import { SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { TemplateTransformFn } from './angular-parsing';
import {
    Attribute,
    Block,
    Element,
    getClassBindingToken,
    getSimpleAttributeName,
    getSimpleAttributeValue,
    replaceTokenList,
    TokenLookup,
    visitAll,
    Visitor
} from './ast';
import {
    collectInlineTemplateRanges,
    forEachStringLiteral,
    parseTemplate,
    TransformTemplateAttributesResult
} from './typescript';

export type TokenReplacement = { from: string; to: string };

export interface IconMigrationData {
    /** Attribute names whose *value* holds a scope-prefixed icon name, on any element (icon
     *  directives attach via attribute selector, e.g. `[kbq-icon]`). */
    valueAttrs: string[];
    /** Old scope word and its replacement, e.g. `{ from: 'pt-icons', to: 'kbq' }`. */
    scope: { from: string; to: string };
    /** How the bare scope token behaves inside a class list: dropped, or renamed in place. */
    scopeClassInList: 'remove' | 'rename';
    /** Exact deprecated-suffix -> new-suffix pairs (unprefixed). */
    icons: TokenReplacement[];
    /** Only for the valueAttrs code path: rescope `<scope>-<anything>` even when the suffix isn't
     *  a known icon. Never applies to class-list/binding/string-literal/style matching — those
     *  stay exact-token-only regardless of this flag. */
    rescopeUnknownValues: boolean;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds the exact-match token table shared by every exact-token-only path (class lists,
 * `[class.X]` bindings, bare TS string literals, style-file regex): the bare scope word (mapped
 * per `scopeClassInList`) plus `scope.from-<icon.from>` -> `scope.to-<icon.to>` for every icon.
 */
export function buildIconTokenMap(data: IconMigrationData): Map<string, string | null> {
    const map = new Map<string, string | null>();

    map.set(data.scope.from, data.scopeClassInList === 'remove' ? null : data.scope.to);

    for (const icon of data.icons) {
        map.set(`${data.scope.from}-${icon.from}`, `${data.scope.to}-${icon.to}`);
    }

    return map;
}

function exactTokenLookup(tokenMap: Map<string, string | null>, found: TokenReplacement[]): TokenLookup {
    return (token) => {
        if (!tokenMap.has(token)) {
            return undefined;
        }

        const replacement = tokenMap.get(token)!;

        found.push({ from: token, to: replacement ?? '' });

        return replacement;
    };
}

/**
 * HTML-AST visitor, element-name-agnostic (unlike `ElementCollector`'s single `elementName`),
 * since icon directives attach via attribute selector to any host element. Collects every
 * element carrying at least one relevant attribute — a `valueAttrs` match, a bare `class`
 * attribute, or a `class.X` binding.
 */
export class IconAttributeCollector implements Visitor {
    readonly elementsToMigrate: Element[] = [];

    constructor(private data: IconMigrationData) {}

    visitElement(el: Element): void {
        if (el.attrs?.length) {
            const isRelevant = el.attrs.some((attr) => {
                const name = getSimpleAttributeName(attr.name);

                return (
                    this.data.valueAttrs.includes(name) || name === 'class' || getClassBindingToken(name) !== undefined
                );
            });

            if (isRelevant) {
                this.elementsToMigrate.push(el);
            }
        }

        this.visitChildren(el);
    }

    visitChildren(el: Element | Block) {
        if (el.children?.length) {
            for (const child of el.children) {
                child.visit(this);
            }
        }
    }

    visitBlock(block: Block, _1: any) {
        this.visitChildren(block);
    }

    // part of interface
    visitAttribute(_: Attribute, _1: any) {}
    visitText(_: any, _1: any) {}
    visitComment(_: any, _1: any) {}
    visitExpansion(_: any, _1: any) {}
    visitExpansionCase(_: any, _1: any) {}
    visitBlockParameter(_: any, _1: any) {}
    visitLetDeclaration(_: any, _1: any) {}
}

type PendingEdit = { start: number; end: number; replacement: string };

/**
 * Resolves a bare (non-template) string literal like `'pt-icons word-wrap_16'` or
 * `'pt-icons-word-wrap_16'`. Only proceeds when the literal contains an unambiguous icon
 * reference — a hyphenated `scope-suffix` token, or a bare token that's an exact known icon
 * suffix — so a string that merely contains the bare scope word (e.g. `'pt-icons my-custom-thing'`,
 * where `my-custom-thing` isn't a known icon) is left untouched rather than having its scope word
 * silently dropped/renamed on no real evidence of an icon reference.
 */
function resolveBareStringLiteral(
    text: string,
    tokenMap: Map<string, string | null>,
    data: IconMigrationData
): { result: string; found: TokenReplacement[] } | undefined {
    const tokens = text.split(/\s+/).filter(Boolean);
    const hasIconReference = tokens.some(
        (token) => (tokenMap.has(token) && token !== data.scope.from) || data.icons.some(({ from }) => from === token)
    );

    if (!hasIconReference) {
        return undefined;
    }

    const found: TokenReplacement[] = [];
    let changed = false;

    const resolved = tokens
        .map((token) => {
            if (tokenMap.has(token)) {
                const replacement = tokenMap.get(token)!;

                changed = true;
                found.push({ from: token, to: replacement ?? '' });

                return replacement;
            }

            const icon = data.icons.find(({ from }) => from === token);

            if (icon) {
                changed = true;
                found.push({ from: token, to: icon.to });

                return icon.to;
            }

            return token;
        })
        .filter((token) => !!token);

    return changed ? { result: resolved.join(' '), found } : undefined;
}

/**
 * Template-level transform pluggable into `migrateTemplateWithTransform`. Walks the HTML AST via
 * `IconAttributeCollector` and, for each matched element:
 *  - `valueAttrs` match: a bound attribute (`[kbq-icon]="expr"`) whose value isn't a quoted
 *    literal is a genuine runtime expression and is warned about, never mutated. A static value
 *    is looked up against `tokenMap` (plus an optional unknown-suffix rescope); if found, only
 *    the attribute's value span is spliced.
 *  - `class` attribute: only exact-matching tokens in the space-separated list are replaced or
 *    dropped; unrelated classes are left untouched.
 *  - `class.X` binding: `X` is matched exactly against `tokenMap`; on a match, only the
 *    attribute's name (the `X` part) is spliced — the binding's value is untouched.
 * When `fix` is false, performs the same walk without mutating and reports matches via `onFound`.
 */
export function createIconTemplateTransform(
    data: IconMigrationData,
    tokenMap: Map<string, string | null>,
    opts: { fix: boolean; onFound: (fileName: string, found: TokenReplacement[]) => void }
): TemplateTransformFn {
    return async (template: string, fileName: string): Promise<TransformTemplateAttributesResult> => {
        const parsed = await parseTemplate(template);

        if (parsed.tree === undefined) {
            return { fileContent: template, changed: undefined, errors: parsed.errors };
        }

        const visitor = new IconAttributeCollector(data);

        visitAll(visitor, parsed.tree.rootNodes);

        const edits: PendingEdit[] = [];
        const allFound: TokenReplacement[] = [];

        const resolveValueToken = (token: string): string | null | undefined => {
            if (tokenMap.has(token)) {
                return tokenMap.get(token);
            }

            if (data.rescopeUnknownValues && token.startsWith(`${data.scope.from}-`)) {
                return `${data.scope.to}-${token.slice(data.scope.from.length + 1)}`;
            }

            return undefined;
        };

        for (const el of visitor.elementsToMigrate) {
            for (const attr of el.attrs) {
                const simpleName = getSimpleAttributeName(attr.name);

                if (data.valueAttrs.includes(simpleName)) {
                    const isDynamicExpression = attr.name.startsWith('[') && !/^\s*['"].*['"]\s*$/.test(attr.value);

                    if (isDynamicExpression) {
                        console.warn(
                            `Element is using a dynamic value. Check the code and change value on your own.${
                                (fileName && ' File: ' + fileName) || ''
                            }`
                        );
                        continue;
                    }

                    const cleanValue = getSimpleAttributeValue(attr.value).replace(/"/g, '');
                    const resolved = resolveValueToken(cleanValue);

                    if (resolved) {
                        edits.push({
                            start: attr.valueSpan.start.offset,
                            end: attr.valueSpan.end.offset,
                            replacement: resolved
                        });
                        allFound.push({ from: cleanValue, to: resolved });
                    }

                    continue;
                }

                if (simpleName === 'class') {
                    const found: TokenReplacement[] = [];
                    const newValue = replaceTokenList(attr.value, exactTokenLookup(tokenMap, found));

                    if (newValue !== undefined) {
                        edits.push({
                            start: attr.valueSpan.start.offset,
                            end: attr.valueSpan.end.offset,
                            replacement: newValue
                        });
                        allFound.push(...found);
                    }

                    continue;
                }

                const bindingToken = getClassBindingToken(simpleName);

                if (bindingToken !== undefined && tokenMap.has(bindingToken)) {
                    const replacement = tokenMap.get(bindingToken);

                    if (replacement) {
                        const newSimpleName = simpleName.replace(
                            new RegExp(`\\.${escapeRegExp(bindingToken)}$`),
                            `.${replacement}`
                        );
                        const newName = attr.name.startsWith('[') ? `[${newSimpleName}]` : newSimpleName;

                        edits.push({
                            start: attr.keySpan.start.offset,
                            end: attr.keySpan.end.offset,
                            replacement: newName
                        });
                        allFound.push({ from: bindingToken, to: replacement });
                    }
                }
            }
        }

        if (!opts.fix) {
            if (allFound.length > 0) {
                opts.onFound(fileName, allFound);
            }

            return { fileContent: template, changed: false, errors: parsed.errors };
        }

        if (edits.length === 0) {
            return { fileContent: template, changed: false, errors: parsed.errors };
        }

        edits.sort((a, b) => a.start - b.start);

        let updatedTemplate = template;
        let offset = 0;

        for (const edit of edits) {
            updatedTemplate =
                updatedTemplate.slice(0, edit.start - offset) +
                edit.replacement +
                updatedTemplate.slice(edit.end - offset);
            offset += edit.end - edit.start - edit.replacement.length;
        }

        return { fileContent: updatedTemplate, changed: true, errors: parsed.errors };
    };
}

/**
 * Migrates icon usage in `.ts` files: both inline `@Component({ template: '…' })` strings (via
 * `createIconTemplateTransform`, same as external HTML) and bare string literals outside of any
 * template (e.g. `return 'pt-icons ' + iconName;`), matched exact-token-only against `tokenMap`.
 *
 * Both kinds of edits are computed from the same unmodified `sourceFile`/`content` and applied in
 * a single `beginUpdate`/`commitUpdate` pass per file, sorted by original offset — this avoids
 * corrupting offsets that a separate, sequential edit pass would introduce once the first pass
 * had already shifted the file's content.
 *
 * `sourceFile.fileName` must be a path `tree.readText`/`tree.beginUpdate` can resolve directly
 * (i.e. built from the file's own tree path, not a real filesystem path) — these migrations run
 * against the schematic `Tree`, not the on-disk project.
 */
export async function migrateIconsInTsFiles(
    tree: Tree,
    sourceFiles: ts.SourceFile[],
    context: SchematicContext,
    data: IconMigrationData,
    tokenMap: Map<string, string | null>,
    opts: { fix: boolean; onFound: (fileName: string, found: TokenReplacement[]) => void }
): Promise<void> {
    for (const sourceFile of sourceFiles) {
        const relativePath = sourceFile.fileName;
        const content = tree.readText(relativePath);
        const templateRanges = collectInlineTemplateRanges(sourceFile);

        const edits: PendingEdit[] = [];
        const allFound: TokenReplacement[] = [];

        const templateTransform = createIconTemplateTransform(data, tokenMap, {
            fix: opts.fix,
            onFound: (_fileName, found) => allFound.push(...found)
        });

        for (const range of templateRanges) {
            const template = content.slice(range.start, range.end);
            const { fileContent, changed, errors } = await templateTransform(template, relativePath);

            if (errors.length > 0) {
                context.logger.error(errors.map(({ error }) => error.toString()).join('\n'));
            }

            if (changed) {
                edits.push({ start: range.start, end: range.end, replacement: fileContent });
            }
        }

        forEachStringLiteral(sourceFile, (node) => {
            const start = node.getStart(sourceFile) + 1;
            const end = node.getEnd() - 1;
            const isInsideTemplate = templateRanges.some((range) => start >= range.start && end <= range.end);

            if (isInsideTemplate) {
                return;
            }

            const resolved = resolveBareStringLiteral(node.text, tokenMap, data);

            if (resolved !== undefined) {
                if (opts.fix) {
                    edits.push({ start, end, replacement: resolved.result });
                }

                allFound.push(...resolved.found);
            }
        });

        if (!opts.fix) {
            if (allFound.length > 0) {
                opts.onFound(relativePath, allFound);
            }

            continue;
        }

        if (edits.length === 0) {
            continue;
        }

        edits.sort((a, b) => a.start - b.start);

        const update = tree.beginUpdate(relativePath);

        for (const edit of edits) {
            update.remove(edit.start, edit.end - edit.start);
            update.insertLeft(edit.start, edit.replacement);
        }

        tree.commitUpdate(update);
    }
}

/**
 * Word/selector-boundary-safe regex replace over raw style-file text, built only from
 * `tokenMap`'s keys (never a blanket scope-prefix regex). Each token is boundary-wrapped so
 * neither side is a word/hyphen character — e.g. `.pt-icons {}` and `@extend .pt-icons;` match
 * (preceded by `.`, a non-word/non-hyphen char), but `.my-widget-pt-icons-preview` and
 * `mc-word-wrap_16-suffix` do not. When `fix` is false, only collects `found` without mutating.
 */
export function replaceKnownIconTokens(
    content: string,
    tokenMap: Map<string, string | null>,
    fix: boolean
): { content: string; changed: boolean; found: TokenReplacement[] } {
    const found: TokenReplacement[] = [];
    let result = content;

    for (const [token, replacement] of tokenMap) {
        const pattern = new RegExp(`(?<![\\w-])${escapeRegExp(token)}(?![\\w-])`, 'g');

        if (!pattern.test(result)) {
            continue;
        }

        found.push({ from: token, to: replacement ?? '' });

        if (fix) {
            result = result.replace(new RegExp(`(?<![\\w-])${escapeRegExp(token)}(?![\\w-])`, 'g'), replacement ?? '');
        }
    }

    return { content: fix ? result : content, changed: fix && found.length > 0, found };
}
