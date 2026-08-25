import { SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { TemplateTransformFn } from './angular-parsing';
import {
    Attribute,
    Block,
    Element,
    getClassBindingToken,
    getSimpleAttributeName,
    replaceTokenList,
    TokenLookup,
    visitAll,
    Visitor
} from './ast';
import {
    collectInlineTemplateRanges,
    forEachClass,
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
 * per `scopeClassInList`) plus, for every icon, `<prefix>-<icon.from> -> scope.to-<icon.to>` under
 * *both* the old scope prefix and the new one — a project may already have run the prefix half of
 * a migration (`mc-<name>` -> `kbq-<name>`) without yet getting the name rename, so both starting
 * points have to resolve to the same, final `scope.to`-prefixed value. A pair that resolves to
 * itself (already fully migrated) is never added, so it can't be reported/rewritten as a spurious
 * no-op change.
 */
export function buildIconTokenMap(data: IconMigrationData): Map<string, string | null> {
    const map = new Map<string, string | null>();
    const prefixes = Array.from(new Set([data.scope.from, data.scope.to]));

    const setIfChanged = (key: string, value: string | null) => {
        if (key !== value) {
            map.set(key, value);
        }
    };

    setIfChanged(data.scope.from, data.scopeClassInList === 'remove' ? null : data.scope.to);

    for (const icon of data.icons) {
        for (const prefix of prefixes) {
            setIfChanged(`${prefix}-${icon.from}`, `${data.scope.to}-${icon.to}`);
        }
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

    // ICU expansions (`{count, plural, =1 {...} other {...}}`) hold their child nodes on
    // `cases[].expression`, not `children`, so `visitChildren` never reaches them on its own.
    visitExpansion(expansion: any, _1: any) {
        visitAll(this, expansion.cases);
    }

    visitExpansionCase(expansionCase: any, _1: any) {
        visitAll(this, expansionCase.expression);
    }

    // part of interface
    visitAttribute(_: Attribute, _1: any) {}
    visitText(_: any, _1: any) {}
    visitComment(_: any, _1: any) {}
    visitBlockParameter(_: any, _1: any) {}
    visitLetDeclaration(_: any, _1: any) {}
}

type PendingEdit = { start: number; end: number; replacement: string };

/**
 * If `value` (already trimmed) is a single quoted string literal — starts and ends with the same
 * quote character, with no further occurrence of that character in between — returns the quote
 * used and the unquoted content. Returns `undefined` for anything else, including a concatenation
 * like `'mc-' + name` (which merely starts and ends with a quote).
 */
function extractQuotedLiteral(value: string): { quote: string; content: string } | undefined {
    const trimmed = value.trim();

    if (trimmed.length < 2) {
        return undefined;
    }

    const quote = trimmed[0];

    if ((quote !== "'" && quote !== '"') || trimmed[trimmed.length - 1] !== quote) {
        return undefined;
    }

    const inner = trimmed.slice(1, -1);

    if (inner.includes(quote)) {
        return undefined;
    }

    return { quote, content: inner };
}

/**
 * Resolves a bare (non-template) string literal like `'pt-icons word-wrap_16'` or
 * `'pt-icons-word-wrap_16'`, operating on its *raw* source text (escape sequences intact, never
 * decoded) so the replacement can be spliced back in without corrupting them. Only proceeds when
 * the literal contains an unambiguous icon reference — a hyphenated `scope-suffix` token that's a
 * known replacement, or a bare icon suffix *alongside* the scope word elsewhere in the same
 * literal — so a string that merely contains the bare scope word (e.g. `'pt-icons my-custom-thing'`,
 * where `my-custom-thing` isn't a known icon) is left untouched, and a completely unscoped bare
 * suffix (e.g. `'add-to-list_16'` with no scope word anywhere) is never rewritten on its own.
 */
function resolveBareStringLiteral(
    rawText: string,
    tokenMap: Map<string, string | null>,
    data: IconMigrationData
): { result: string; found: TokenReplacement[] } | undefined {
    const tokens = rawText.split(/\s+/).filter(Boolean);
    const hasScopeWord = tokens.includes(data.scope.from) || tokens.includes(data.scope.to);
    const hasPrefixedIconMatch = tokens.some(
        (token) => tokenMap.has(token) && token !== data.scope.from && token !== data.scope.to
    );
    const hasBareIconMatch = hasScopeWord && tokens.some((token) => data.icons.some(({ from }) => from === token));

    if (!hasPrefixedIconMatch && !hasBareIconMatch) {
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

            if (icon && icon.to !== token) {
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
 *  - `valueAttrs` match: a bound attribute (`[kbq-icon]="expr"`) whose value isn't a single quoted
 *    literal (e.g. a bare identifier, or a concatenation like `'mc-' + name`) is a genuine runtime
 *    expression and is warned about, never mutated — same for any value containing `{{ }}`
 *    interpolation, bound or not, since it can't be resolved statically either. A quoted literal's
 *    replacement is re-wrapped in the same quote character so the result stays a valid Angular
 *    expression; a plain attribute's value is spliced in as-is.
 *  - `class` attribute: only when it's a plain (unbound) attribute — only exact-matching tokens in
 *    the space-separated list are replaced or dropped; unrelated classes, and any `[class]`
 *    binding expression, are left untouched.
 *  - `class.X` binding: `X` is matched exactly against `tokenMap`. A rename splices just the
 *    attribute's name (the `X` part); a token that maps to removal drops the whole attribute
 *    (name, value and `=`) since there's no value left to bind.
 * When `fix` is false, performs the same walk without mutating and reports matches via `onFound`.
 */
export function createIconTemplateTransform(
    data: IconMigrationData,
    tokenMap: Map<string, string | null>,
    opts: {
        fix: boolean;
        onFound: (fileName: string, found: TokenReplacement[]) => void;
        warn: (message: string) => void;
    }
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

        const warn = (message: string) => {
            opts.warn(`${message}${(fileName && ' File: ' + fileName) || ''}`);
        };

        for (const el of visitor.elementsToMigrate) {
            for (const attr of el.attrs) {
                if (!attr.valueSpan) {
                    continue;
                }

                const simpleName = getSimpleAttributeName(attr.name);

                if (data.valueAttrs.includes(simpleName)) {
                    if (attr.value.includes('{{')) {
                        warn('Element is using an interpolated value. Check the code and change value on your own.');
                        continue;
                    }

                    const isBound = attr.name.startsWith('[');
                    const literal = extractQuotedLiteral(attr.value);
                    const isDynamicExpression = isBound && literal === undefined;

                    if (isDynamicExpression) {
                        warn('Element is using a dynamic value. Check the code and change value on your own.');
                        continue;
                    }

                    const cleanValue = literal ? literal.content : attr.value;
                    const resolved = resolveValueToken(cleanValue);

                    if (resolved) {
                        const replacementText = literal ? `${literal.quote}${resolved}${literal.quote}` : resolved;

                        edits.push({
                            start: attr.valueSpan.start.offset,
                            end: attr.valueSpan.end.offset,
                            replacement: replacementText
                        });
                        allFound.push({ from: cleanValue, to: resolved });
                    }

                    continue;
                }

                if (simpleName === 'class' && !attr.name.startsWith('[')) {
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
                    } else {
                        // No replacement — the binding can't be renamed in place, and there's no
                        // value left worth keeping either, so drop the whole attribute.
                        edits.push({
                            start: attr.sourceSpan.start.offset,
                            end: attr.sourceSpan.end.offset,
                            replacement: ''
                        });
                    }

                    allFound.push({ from: bindingToken, to: replacement ?? '' });
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

function getComponentMetadataObjects(sourceFile: ts.SourceFile): ts.ObjectLiteralExpression[] {
    const results: ts.ObjectLiteralExpression[] = [];

    forEachClass(sourceFile, (node) => {
        const decorator = ts
            .getDecorators(node)
            ?.find(
                (dec) =>
                    ts.isCallExpression(dec.expression) &&
                    ts.isIdentifier(dec.expression.expression) &&
                    dec.expression.expression.text === 'Component'
            );

        if (!decorator || !ts.isCallExpression(decorator.expression)) {
            return;
        }

        const [arg] = decorator.expression.arguments;

        if (arg && ts.isObjectLiteralExpression(arg)) {
            results.push(arg);
        }
    });

    return results;
}

/**
 * Migrates the `host` and `styles` properties of an inline `@Component` decorator — the parts of
 * a component that the HTML-AST template path and `collectInlineTemplateRanges` never see. `host`
 * is matched the same way as a template's `class`/`class.X` attributes; `styles` array entries are
 * plain CSS text, so they're matched with the same word/selector-boundary-safe regex used for
 * `.scss` files.
 *
 * Returns every string-literal range it inspected (`claimedRanges`) — changed or not — so the
 * caller can exclude them from the generic bare-string-literal walk, which would otherwise
 * re-interpret the same text under different (whitespace-token) matching rules.
 */
function collectHostAndStylesEdits(
    sourceFile: ts.SourceFile,
    data: IconMigrationData,
    tokenMap: Map<string, string | null>,
    styleTokenMap: Map<string, string | null>
): { edits: PendingEdit[]; found: TokenReplacement[]; claimedRanges: Array<{ start: number; end: number }> } {
    const edits: PendingEdit[] = [];
    const found: TokenReplacement[] = [];
    const claimedRanges: Array<{ start: number; end: number }> = [];

    for (const metadata of getComponentMetadataObjects(sourceFile)) {
        for (const prop of metadata.properties) {
            if (!ts.isPropertyAssignment(prop) || (!ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name))) {
                continue;
            }

            const propName = prop.name.text;

            if (propName === 'host' && ts.isObjectLiteralExpression(prop.initializer)) {
                for (const hostProp of prop.initializer.properties) {
                    if (
                        !ts.isPropertyAssignment(hostProp) ||
                        (!ts.isIdentifier(hostProp.name) && !ts.isStringLiteralLike(hostProp.name))
                    ) {
                        continue;
                    }

                    if (ts.isStringLiteralLike(hostProp.name)) {
                        claimedRanges.push({
                            start: hostProp.name.getStart(sourceFile) + 1,
                            end: hostProp.name.getEnd() - 1
                        });
                    }

                    const hostKey = hostProp.name.text;
                    const simpleName = getSimpleAttributeName(hostKey);

                    if (simpleName === 'class' && ts.isStringLiteralLike(hostProp.initializer)) {
                        const start = hostProp.initializer.getStart(sourceFile) + 1;
                        const end = hostProp.initializer.getEnd() - 1;

                        claimedRanges.push({ start, end });

                        const valueFound: TokenReplacement[] = [];
                        const newValue = replaceTokenList(
                            sourceFile.text.slice(start, end),
                            exactTokenLookup(tokenMap, valueFound)
                        );

                        if (newValue !== undefined) {
                            edits.push({ start, end, replacement: newValue });
                            found.push(...valueFound);
                        }

                        continue;
                    }

                    const bindingToken = getClassBindingToken(simpleName);

                    if (bindingToken !== undefined && tokenMap.has(bindingToken)) {
                        const replacement = tokenMap.get(bindingToken);

                        if (replacement) {
                            const rawName = hostProp.name.getText(sourceFile);
                            const quote = rawName[0] === "'" || rawName[0] === '"' ? rawName[0] : '';
                            const newSimpleName = simpleName.replace(
                                new RegExp(`\\.${escapeRegExp(bindingToken)}$`),
                                `.${replacement}`
                            );
                            const newInner = hostKey.startsWith('[') ? `[${newSimpleName}]` : newSimpleName;

                            edits.push({
                                start: hostProp.name.getStart(sourceFile),
                                end: hostProp.name.getEnd(),
                                replacement: quote ? `${quote}${newInner}${quote}` : newInner
                            });
                        } else {
                            edits.push({
                                start: hostProp.getStart(sourceFile),
                                end: hostProp.getEnd(),
                                replacement: ''
                            });
                        }

                        found.push({ from: bindingToken, to: replacement ?? '' });
                    }
                }

                continue;
            }

            if (propName === 'styles' && ts.isArrayLiteralExpression(prop.initializer)) {
                for (const el of prop.initializer.elements) {
                    if (!ts.isStringLiteralLike(el)) {
                        continue;
                    }

                    const start = el.getStart(sourceFile) + 1;
                    const end = el.getEnd() - 1;

                    claimedRanges.push({ start, end });

                    const {
                        content,
                        changed,
                        found: styleFound
                    } = replaceKnownIconTokens(sourceFile.text.slice(start, end), styleTokenMap, true, data.scope.from);

                    if (changed) {
                        edits.push({ start, end, replacement: content });
                    }

                    found.push(...styleFound);
                }
            }
        }
    }

    return { edits, found, claimedRanges };
}

/**
 * Migrates icon usage in `.ts` files: inline `@Component({ template: '…' })` strings (via
 * `createIconTemplateTransform`, same as external HTML), the `host`/`styles` decorator properties
 * (via `collectHostAndStylesEdits`), and bare string literals outside of any of those (e.g.
 * `return 'pt-icons ' + iconName;`), matched exact-token-only against `tokenMap`.
 *
 * All edits are computed from the same unmodified `sourceFile`/`content` and applied in a single
 * `beginUpdate`/`commitUpdate` pass per file — `Tree`'s `UpdateRecorder` records changes against
 * the file's original offsets regardless of call order, so this only needs to avoid *overlapping*
 * edits, not sequence them.
 *
 * `sourceFile.fileName` must be a path `tree.readText`/`tree.beginUpdate` can resolve directly
 * (i.e. built from the file's own tree path, not a real filesystem path) — these migrations run
 * against the schematic `Tree`, not the on-disk project.
 *
 * `styleTokenMap` (defaults to `tokenMap`) is used for the CSS text inside an inline `styles`
 * array — pass a separate map when a bare scope word should be *renamed* there even though it's
 * *dropped* from HTML class lists (see `deprecated-icons/index.ts`).
 */
export async function migrateIconsInTsFiles(
    tree: Tree,
    sourceFiles: ts.SourceFile[],
    context: SchematicContext,
    data: IconMigrationData,
    tokenMap: Map<string, string | null>,
    opts: {
        fix: boolean;
        onFound: (fileName: string, found: TokenReplacement[]) => void;
        warn: (message: string) => void;
    },
    styleTokenMap: Map<string, string | null> = tokenMap
): Promise<void> {
    for (const sourceFile of sourceFiles) {
        const relativePath = sourceFile.fileName;
        const content = tree.readText(relativePath);
        const templateRanges = collectInlineTemplateRanges(sourceFile);

        const edits: PendingEdit[] = [];
        const allFound: TokenReplacement[] = [];

        const templateTransform = createIconTemplateTransform(data, tokenMap, {
            fix: opts.fix,
            onFound: (_fileName, found) => allFound.push(...found),
            warn: opts.warn
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

        const hostAndStyles = collectHostAndStylesEdits(sourceFile, data, tokenMap, styleTokenMap);

        if (opts.fix) {
            edits.push(...hostAndStyles.edits);
        }

        allFound.push(...hostAndStyles.found);

        const claimedRanges = [...templateRanges, ...hostAndStyles.claimedRanges];

        forEachStringLiteral(sourceFile, (node) => {
            const start = node.getStart(sourceFile) + 1;
            const end = node.getEnd() - 1;
            const isClaimed = claimedRanges.some((range) => start >= range.start && end <= range.end);

            if (isClaimed) {
                return;
            }

            const resolved = resolveBareStringLiteral(content.slice(start, end), tokenMap, data);

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
    fix: boolean,
    /** The bare, unprefixed scope word (`data.scope.from`), if present in `tokenMap`. Unlike every
     *  other token — which is a specific, hyphenated `scope-suffix` string — this one is short and
     *  generic enough (e.g. `mc`) to collide with unrelated identifiers (`$mc: red;`,
     *  `@import 'mc'`, `font-family: mc;`). Matched only when immediately preceded by `.`, so it
     *  still catches a real class selector (`.mc {}`) without touching those. */
    bareScopeWord?: string
): { content: string; changed: boolean; found: TokenReplacement[] } {
    const found: TokenReplacement[] = [];
    let result = content;

    for (const [token, replacement] of tokenMap) {
        const pattern =
            token === bareScopeWord
                ? new RegExp(`(?<=\\.)${escapeRegExp(token)}(?![\\w-])`, 'g')
                : new RegExp(`(?<![\\w-])${escapeRegExp(token)}(?![\\w-])`, 'g');

        if (fix) {
            const next = result.replace(pattern, replacement ?? '');

            if (next !== result) {
                found.push({ from: token, to: replacement ?? '' });
                result = next;
            }
        } else if (pattern.test(content)) {
            found.push({ from: token, to: replacement ?? '' });
        }
    }

    return { content: fix ? result : content, changed: fix && found.length > 0, found };
}
