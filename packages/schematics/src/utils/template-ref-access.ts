import { memberAccessPattern } from './signal-members-migration';

/**
 * Rewrites the members that became signals where a template reaches them through a reference variable:
 * a read becomes a call, a write to a member that stays writable becomes `.set(…)`, and a write to one that
 * is read-only now is left untouched and returned, so the migration can report it. A compound assignment or an
 * increment has no `.set(…)` form, so it is left untouched and returned too.
 */

/** A half-open `[start, end)` span of the template. */
interface Range {
    start: number;
    end: number;
}

interface Edit extends Range {
    text: string;
}

/** A reference variable and the members reachable through it. */
export interface RefAccessPolicy {
    name: string;
    /** Members that became signals. */
    members: readonly string[];
    /** Subset of `members` that stays writable. */
    writable: ReadonlySet<string>;
}

export interface RefAccessResult {
    content: string;
    /** Read-only members written through a ref, left as they are. */
    readOnlyWrites: Set<string>;
    /** Writable members written through a ref by a compound assignment or an increment, left as they are. */
    compoundWrites: Set<string>;
}

/** `(click)` / `on-click`: the value is a statement list, where an assignment is legal. */
const EVENT_BINDING = /^(?:\(|on-)/;

/** `[(ngModel)]` / `bindon-ngModel`: the value is a write target, which a signal fills without a call. */
const TWO_WAY_BINDING = /^(?:\[\(|bindon-)/;

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

/** The value spans of the event and two-way bindings on every element of the parsed template. */
function collectBindings(nodes: readonly any[], statements: Range[], twoWay: Range[]): void {
    for (const node of nodes) {
        for (const attr of node.attrs ?? []) {
            const span = attr.valueSpan;

            if (typeof attr.name !== 'string' || !span) continue;

            const range = { start: span.start.offset, end: span.end.offset };

            if (TWO_WAY_BINDING.test(attr.name)) twoWay.push(range);
            else if (EVENT_BINDING.test(attr.name)) statements.push(range);
        }

        collectBindings(node.children ?? [], statements, twoWay);
    }
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

const within = ({ start, end }: Range, from: number, to: number): boolean => from >= start && to <= end;

/**
 * Rewrites reads and writes of `refs`' members in `template`, whose HTML AST is `rootNodes`. A ref that two
 * policies name is rewritten once, by the first of them.
 */
export function rewriteRefAccesses(
    template: string,
    rootNodes: readonly unknown[],
    refs: readonly RefAccessPolicy[]
): RefAccessResult {
    const statements: Range[] = [];
    const twoWay: Range[] = [];
    const readOnlyWrites = new Set<string>();
    const compoundWrites = new Set<string>();
    const writeEdits: Edit[] = [];
    const readEdits: Edit[] = [];
    const seen = new Set<number>();

    collectBindings(rootNodes, statements, twoWay);

    for (const { name, members, writable } of refs) {
        if (members.length === 0) continue;

        for (const match of template.matchAll(assignmentPattern(name, members))) {
            const [, target, member, operator] = match;
            const targetEnd = match.index + target.length;

            if (seen.has(targetEnd)) continue;

            seen.add(targetEnd);

            if (!writable.has(member)) {
                readOnlyWrites.add(member);
                continue;
            }

            const valueStart = targetEnd + operator.length;
            const statement = statements.find((range) => within(range, match.index, valueStart));

            // Outside a statement an assignment is no valid template to begin with.
            if (!statement) continue;

            const valueEnd = assignedExpressionEnd(template, valueStart, statement.end);

            if (valueEnd === valueStart) continue;

            writeEdits.push({ start: targetEnd, end: valueStart, text: '.set(' });
            writeEdits.push({ start: valueEnd, end: valueEnd, text: ')' });
        }

        for (const match of template.matchAll(memberAccessPattern(name, members))) {
            const end = match.index + match[0].length;

            if (seen.has(end)) continue;

            seen.add(end);

            const member = match[2];
            const statement = statements.find((range) => within(range, match.index, end));

            // `(click)="ref.value += 1"`, `ref.value++`, `--ref.value`: a call there is no valid template.
            if (
                statement &&
                (COMPOUND_WRITE_AFTER.test(template.slice(end, statement.end)) ||
                    INCREMENT_BEFORE.test(template.slice(statement.start, match.index)))
            ) {
                (writable.has(member) ? compoundWrites : readOnlyWrites).add(member);
                continue;
            }

            const binding = twoWay.find((range) => within(range, match.index, end));

            // `[(ngModel)]="ref.value"` writes through the binding: a writable signal fills it as it is.
            if (
                binding &&
                !template.slice(binding.start, match.index).trim() &&
                !template.slice(end, binding.end).trim()
            ) {
                if (!writable.has(member)) readOnlyWrites.add(member);

                continue;
            }

            readEdits.push({ start: end, end, text: '()' });
        }
    }

    // Applied right to left. The sort is stable, so where a read ends an assigned value, the `)` closing
    // `.set(` goes in first and the read's `()` lands in front of it.
    const edits = [...writeEdits, ...readEdits].sort((a, b) => b.start - a.start || b.end - a.end);
    let content = template;

    for (const { start, end, text } of edits) {
        content = content.slice(0, start) + text + content.slice(end);
    }

    return { content, readOnlyWrites, compoundWrites };
}
