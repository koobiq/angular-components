import { visitAll } from './ast';
import {
    memberAccessPattern,
    Range,
    TemplateExpression,
    TemplateRefResolver,
    TemplateScanner
} from './signal-members-migration';

/**
 * Rewrites the members that became signals where a template reaches them through a reference variable:
 * a read becomes a call, a write to a member that stays writable becomes `.set(…)`, and a write to one that
 * is read-only now is left untouched and returned, so the migration can report it. A compound assignment or an
 * increment has no `.set(…)` form, so it is left untouched and returned too.
 *
 * Only the expressions of the view that declares a ref are looked at — not prose, comments or plain attributes —
 * and a ref whose name the template also gives to something else is left alone, as the shared engine does.
 */

interface Edit extends Range {
    text: string;
}

/** What a reference variable reaches, and how. */
export interface RefAccessPolicy {
    /** Members that became signals. */
    members: readonly string[];
    /** Subset of `members` that stays writable. */
    writable: ReadonlySet<string>;
    /** Members reported, in any form, wherever a ref reaches them. Never rewritten. */
    reported?: readonly string[];
}

export interface RefAccessResult {
    content: string;
    /** Read-only members written through a ref, left as they are. */
    readOnlyWrites: Set<string>;
    /** Writable members written through a ref by a compound assignment or an increment, left as they are. */
    compoundWrites: Set<string>;
    /** `reported` members reached through a ref. */
    reported: Set<string>;
}

/** A compound assignment (`+=`, `??=`, …) or a postfix `++` / `--` at the start of what follows an access. */
const COMPOUND_WRITE_AFTER = /^\s*(?:\+\+|--|(?:\*\*|>>>|<<|>>|&&|\|\||\?\?|[-+*/%&|^])=(?!=))/;

/** A prefix `++` / `--` at the end of what precedes an access. */
const INCREMENT_BEFORE = /(?:\+\+|--)\s*$/;

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** `<ref>.<member> =`, but not `==` / `===`: the lookbehind matches the one `memberAccessPattern` uses. */
function assignmentPattern(ref: string, members: readonly string[]): RegExp {
    const names = members.map(escapeRegExp).join('|');

    return new RegExp(`(?<![\\w$.])(${escapeRegExp(ref)}\\s*\\.\\s*(${names}))\\b(\\s*=(?!=)\\s*)`, 'g');
}

/** `<ref>.<member>` in any form, the optional chain included. */
function anyAccessPattern(ref: string, members: readonly string[]): RegExp {
    return new RegExp(
        `(?<![\\w$.])${escapeRegExp(ref)}\\s*\\??\\.\\s*(${members.map(escapeRegExp).join('|')})\\b`,
        'g'
    );
}

/** End of the assigned expression that starts at `from`: the next top-level `;`, or the end of the statement list. */
function assignedExpressionEnd(template: string, from: number, limit: number): number {
    let depth = 0;
    let quote: string | undefined;
    let end = limit;

    for (let i = from; i < limit && end === limit; i++) {
        const char = template[i];

        if (quote) {
            if (char === '\\') i++;
            else if (char === quote) quote = undefined;
        } else if (char === "'" || char === '"' || char === '`') {
            quote = char;
        } else if ('([{'.includes(char)) {
            depth++;
        } else if (')]}'.includes(char)) {
            if (depth === 0) end = i;
            else depth--;
        } else if (char === ';' && depth === 0) {
            end = i;
        }
    }

    while (end > from && /\s/.test(template[end - 1])) end--;

    return end;
}

/**
 * Rewrites reads and writes of the members reachable through the refs in `template`, whose HTML AST is
 * `rootNodes`. `policyOf` tells what a `#ref` on an element is bound to, or `undefined` when it is not one of
 * the migrated types.
 */
export function rewriteRefAccesses(
    template: string,
    rootNodes: readonly unknown[],
    policyOf: TemplateRefResolver<RefAccessPolicy>
): RefAccessResult {
    const scanner = new TemplateScanner(template, policyOf);
    const result: RefAccessResult = {
        content: template,
        readOnlyWrites: new Set<string>(),
        compoundWrites: new Set<string>(),
        reported: new Set<string>()
    };
    const writeEdits: Edit[] = [];
    const readEdits: Edit[] = [];
    // The end of each access already handled: a ref redeclared in a nested view reaches it twice.
    const seen = new Set<number>();

    visitAll(scanner, rootNodes);

    const rewriteWrites = (expression: TemplateExpression, name: string, policy: RefAccessPolicy) => {
        const source = template.slice(expression.start, expression.end);

        for (const match of source.matchAll(assignmentPattern(name, policy.members))) {
            const [, target, member, operator] = match;
            const targetEnd = expression.start + match.index + target.length;

            if (seen.has(targetEnd)) continue;

            seen.add(targetEnd);

            if (!policy.writable.has(member)) {
                result.readOnlyWrites.add(member);
                continue;
            }

            // Outside a statement an assignment is no valid template to begin with.
            if (expression.kind !== 'statement') continue;

            const valueStart = targetEnd + operator.length;
            const valueEnd = assignedExpressionEnd(template, valueStart, expression.end);

            if (valueEnd === valueStart) continue;

            writeEdits.push({ start: targetEnd, end: valueStart, text: '.set(' });
            writeEdits.push({ start: valueEnd, end: valueEnd, text: ')' });
        }
    };

    const rewriteReads = (expression: TemplateExpression, name: string, policy: RefAccessPolicy) => {
        const source = template.slice(expression.start, expression.end);

        for (const match of source.matchAll(memberAccessPattern(name, policy.members))) {
            const start = expression.start + match.index;
            const end = start + match[0].length;
            const member = match[2];

            if (seen.has(end)) continue;

            seen.add(end);

            // `(click)="ref.value += 1"`, `ref.value++`, `--ref.value`: a call there is no valid template.
            if (
                expression.kind === 'statement' &&
                (COMPOUND_WRITE_AFTER.test(template.slice(end, expression.end)) ||
                    INCREMENT_BEFORE.test(template.slice(expression.start, start)))
            ) {
                (policy.writable.has(member) ? result.compoundWrites : result.readOnlyWrites).add(member);
                continue;
            }

            // `[(ngModel)]="ref.value"` writes through the binding: a writable signal fills it as it is.
            if (
                expression.kind === 'twoWay' &&
                !template.slice(expression.start, start).trim() &&
                !template.slice(end, expression.end).trim()
            ) {
                if (!policy.writable.has(member)) result.readOnlyWrites.add(member);

                continue;
            }

            readEdits.push({ start: end, end, text: '()' });
        }
    };

    for (const { name, type: policy, ...view } of scanner.unambiguousRefs()) {
        for (const expression of scanner.expressions) {
            if (expression.start < view.start || expression.end > view.end) continue;

            if (policy.members.length > 0) {
                rewriteWrites(expression, name, policy);
                rewriteReads(expression, name, policy);
            }

            if (policy.reported?.length) {
                const source = template.slice(expression.start, expression.end);

                for (const [, member] of source.matchAll(anyAccessPattern(name, policy.reported))) {
                    result.reported.add(member);
                }
            }
        }
    }

    // Applied right to left. The sort is stable, so where a read ends an assigned value, the `)` closing
    // `.set(` goes in first and the read's `()` lands in front of it.
    const edits = [...writeEdits, ...readEdits].sort((a, b) => b.start - a.start || b.end - a.end);

    for (const { start, end, text } of edits) {
        result.content = result.content.slice(0, start) + text + result.content.slice(end);
    }

    return result;
}
