import type { ComponentSymbol, MemberKind, SymbolKind } from '../types.js';

/**
 * Parses an API Extractor report from `tools/public_api_guard`.
 *
 * The reports are the repository's own CI gate, so they are the one description of the public
 * surface that cannot drift from the code. The Angular compiler declarations inside them
 * (`ɵcmp` / `ɵdir`) additionally carry the selector, the exported names and the input and output
 * aliases, which no other artifact states in one place.
 */

const TS_BLOCK = /```ts\n([\s\S]*?)```/;

const DECLARATION =
    /^export (?:declare )?(?:abstract )?(class|interface|enum|const|function|type|let|var) ([A-Za-z_$][\w$]*)/;

const NG_DECLARATION = /static (ɵcmp|ɵdir|ɵpipe): [^<]*<([\s\S]*)>;?\s*$/;

const MEMBER_BODY = /^ {4}(\S.*)$/;
const MEMBER_MODIFIER = /^(?:readonly|static|abstract|protected|private|declare|get|set)\s+/;
const MEMBER_NAME = /^([A-Za-z_$][\w$]*|\[[^\]]+\])\??\s*[<(:=]/;

/**
 * A member is indented exactly four spaces; its name sits behind any number of modifiers.
 *
 * Angular's own `ɵcmp` / `ɵdir` / `ɵfac` members fall out for free — `ɵ` is outside `[A-Za-z_$]` —
 * and `protected` / `private` members are reported so the caller can drop them: they exist only
 * for the component's own template and are noise to a consumer.
 */
export const parseMemberLine = (line: string): { name: string; modifiers: string[] } | null => {
    const body = MEMBER_BODY.exec(line)?.[1];

    if (!body || body.startsWith('//')) return null;

    let rest = body;
    const modifiers: string[] = [];
    let modifier = MEMBER_MODIFIER.exec(rest);

    while (modifier) {
        modifiers.push(modifier[0].trim());
        rest = rest.slice(modifier[0].length);
        modifier = MEMBER_MODIFIER.exec(rest);
    }

    const name = MEMBER_NAME.exec(rest)?.[1];

    return name ? { name, modifiers } : null;
};

const HIDDEN_MODIFIERS = new Set(['protected', 'private']);

const OPEN: Record<string, string> = { '<': '>', '{': '}', '[': ']', '(': ')' };
const CLOSE = new Set(['>', '}', ']', ')']);

/** Splits on `,` at nesting depth zero, ignoring separators inside brackets or strings. */
export const splitTopLevel = (input: string): string[] => {
    const parts: string[] = [];
    let depth = 0;
    let quote: string | null = null;
    let current = '';

    for (const char of input) {
        if (quote) {
            current += char;
            if (char === quote) quote = null;
            continue;
        }

        if (char === '"' || char === "'") {
            quote = char;
            current += char;
            continue;
        }

        if (OPEN[char]) depth++;
        else if (CLOSE.has(char)) depth--;

        if (char === ',' && depth === 0) {
            parts.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    if (current.trim()) parts.push(current.trim());

    return parts;
};

const stringLiteral = (segment: string): string | undefined => /^["']([^"']*)["']$/.exec(segment.trim())?.[1];

const stringArray = (segment: string): string[] => [...segment.matchAll(/["']([^"']+)["']/g)].map((match) => match[1]!);

/** Top-level keys of an inline object type: `{ "compact": { ... }; "alertStyle": { ... }; }`. */
const objectKeys = (segment: string): string[] => {
    const inner = /^\{([\s\S]*)\}$/.exec(segment.trim())?.[1];

    if (!inner) return [];

    return splitTopLevel(inner.replace(/;/g, ','))
        .map((entry) => stringLiteral(entry.split(':')[0] ?? ''))
        .filter((key): key is string => Boolean(key));
};

type NgMetadata = {
    kind: SymbolKind;
    selector?: string;
    exportAs?: string[];
    inputs: Set<string>;
    outputs: Set<string>;
};

const parseNgDeclaration = (line: string): NgMetadata | null => {
    const match = NG_DECLARATION.exec(line);

    if (!match) return null;

    const [, marker, args] = match as unknown as [string, string, string];
    const segments = splitTopLevel(args);
    const kind: SymbolKind = marker === 'ɵcmp' ? 'component' : marker === 'ɵpipe' ? 'class' : 'directive';

    if (marker === 'ɵpipe') {
        return { kind, selector: stringLiteral(segments[1] ?? ''), inputs: new Set(), outputs: new Set() };
    }

    return {
        kind,
        selector: stringLiteral(segments[1] ?? ''),
        exportAs: stringArray(segments[2] ?? ''),
        inputs: new Set(objectKeys(segments[3] ?? '')),
        outputs: new Set(objectKeys(segments[4] ?? ''))
    };
};

const memberKind = (name: string, signature: string, ng: NgMetadata | null): MemberKind => {
    if (ng?.inputs.has(name)) return 'input';
    if (ng?.outputs.has(name)) return 'output';
    if (/^[A-Za-z_$][\w$]*\s*\(/.test(signature) || /^[A-Za-z_$][\w$]*<[^>]*>\s*\(/.test(signature)) return 'method';

    return 'property';
};

/** Compresses `readonly x: _angular_core.InputSignal<"a" | "b">;` to `x: InputSignal<"a" | "b">`. */
const normalizeSignature = (raw: string): string =>
    raw
        .trim()
        .replace(/;$/, '')
        .replace(/^(?:(?:readonly|static|abstract|declare)\s+)+/, '')
        // API Extractor names imported namespaces differently per report: `_angular_core.` and `i0.`.
        .replace(/\b(?:_angular_core|i\d+)\./g, '')
        .replace(/\s+/g, ' ');

export const parseApiReport = (source: string): ComponentSymbol[] => {
    // The reports are committed with CRLF endings; every pattern below is written against LF.
    const block = TS_BLOCK.exec(source.replace(/\r\n/g, '\n'))?.[1];

    if (!block) return [];

    const lines = block.split('\n');
    const symbols: ComponentSymbol[] = [];

    let current: { symbol: ComponentSymbol; ng: NgMetadata | null; enum: boolean } | null = null;
    let depth = 0;

    for (const line of lines) {
        if (!current) {
            const declaration = DECLARATION.exec(line);

            if (!declaration) continue;

            const [, keyword, name] = declaration as unknown as [string, string, string];
            const kind: SymbolKind =
                keyword === 'let' || keyword === 'var' ? 'const' : (keyword as Exclude<SymbolKind, 'component'>);

            current = {
                symbol: { name, kind, members: [] },
                ng: null,
                enum: keyword === 'enum'
            };
            depth = 0;
        }

        for (const char of line) {
            if (char === '{') depth++;
            else if (char === '}') depth--;
        }

        const ng = parseNgDeclaration(line);

        if (ng) {
            current.ng = ng;
            current.symbol.kind = ng.kind;
            if (ng.selector) current.symbol.selector = ng.selector;
            if (ng.exportAs?.length) current.symbol.exportAs = ng.exportAs;
        }

        const member = parseMemberLine(line);

        if (member && member.name !== 'constructor' && !member.modifiers.some((it) => HIDDEN_MODIFIERS.has(it))) {
            const signature = normalizeSignature(line);

            current.symbol.members.push({
                name: member.name,
                kind: current.enum ? 'enum-item' : memberKind(member.name, signature, current.ng),
                signature
            });
        }

        const closed =
            depth === 0 && (line.includes('}') || /^export (?:declare )?(?:const|type|let|var|function)/.test(line));

        if (closed) {
            const { symbol, ng } = current;

            for (const item of symbol.members) {
                if (item.kind === 'property' || item.kind === 'method') {
                    item.kind = memberKind(item.name, item.signature, ng);
                }
            }

            symbols.push(symbol);
            current = null;
        }
    }

    return symbols;
};
