import { objectEntries, splitTopLevel, stringArray, stringLiteral, stripNamespaces } from './syntax.js';

/**
 * Reads one `.d.ts` of `@koobiq/components`.
 *
 * This is the source of truth for the API a project actually has, because it is the file that
 * project's own compiler reads. The alternative the server used before — the API Extractor report
 * in the repository — describes whatever is on the repository's main branch: today that report
 * lists `color` as an input of `[kbq-button]` while the installed 20.3.1 does not have it, so an
 * agent told otherwise writes an attribute that silently does nothing.
 *
 * Line-based rather than compiler-based. `typescript` is ~22 MB and this server is run through
 * `npx`; the declarations being read are machine-generated, one per line, in a shape Angular has
 * emitted unchanged for several majors. `test/dts-against-tsc.test.ts` holds the parser to the
 * real compiler's reading of the installed package, so the shortcut stays honest.
 */

export type DtsInput = {
    /** Property on the class. */
    name: string;
    /** What a template writes. Differs from `name` for 325 inputs across the library. */
    alias: string;
    required: boolean;
    isSignal: boolean;
};

export type DtsOutput = { name: string; alias: string };

export type DtsHostDirective = {
    directive: string;
    /** Host-directive input name → name exposed on the host element. */
    inputs: Record<string, string>;
    outputs: Record<string, string>;
};

export type DtsMemberKind = 'method' | 'property' | 'accessor' | 'enum-item';

export type DtsMember = {
    name: string;
    kind: DtsMemberKind;
    signature: string;
    visibility: 'public' | 'protected' | 'private';
    /** Compiler plumbing: `ɵfac`, `ngAcceptInputType_*`, `_private`. Never shown unless asked by name. */
    internal: boolean;
    /** `ngOnInit` and friends: public, but called by Angular rather than by the consumer. */
    lifecycle: boolean;
    /**
     * The setter's parameter type, for an accessor pair.
     *
     * A template binds what the *setter* accepts, which is routinely wider than what the getter
     * returns: `kbq-button` reads `get kbqStyle(): string` but takes
     * `set kbqStyle(value: string | KbqButtonStyles)`. Reporting the getter hides the enum that is
     * the whole reason the input exists.
     */
    accepts?: string;
};

export type DtsSymbolKind =
    'component' | 'directive' | 'pipe' | 'class' | 'interface' | 'enum' | 'const' | 'function' | 'type';

export type DtsSymbol = {
    name: string;
    kind: DtsSymbolKind;
    /** Base class name, unresolved. Inputs are inherited through it. */
    base: string | null;
    selector?: string;
    exportAs: string[];
    inputs: DtsInput[];
    outputs: DtsOutput[];
    hostDirectives: DtsHostDirective[];
    members: DtsMember[];
};

export type DtsFile = {
    /** Local name → module specifier it came from. */
    imports: Map<string, string>;
    symbols: Map<string, DtsSymbol>;
    /** Names in the file's `export { … }` clause. Everything else is an implementation detail. */
    exported: Set<string>;
    /**
     * Relative specifiers re-exported wholesale. 19.x builds an entry point as a barrel over ~512
     * files; 20.x emits one flat file. Following these makes the two layouts the same shape here.
     */
    reexports: string[];
};

const CLASS =
    /^(?:export\s+)?declare\s+(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)(?:<[^>]*>)?(?:\s+extends\s+([A-Za-z_$][\w$]*))?/;
const INTERFACE = /^(?:export\s+)?declare\s+interface\s+([A-Za-z_$][\w$]*)/;
const ENUM = /^(?:export\s+)?declare\s+(?:const\s+)?enum\s+([A-Za-z_$][\w$]*)/;
const CONST = /^(?:export\s+)?declare\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)/;
const FUNCTION = /^(?:export\s+)?declare\s+function\s+([A-Za-z_$][\w$]*)/;
const TYPE = /^(?:export\s+)?(?:declare\s+)?type\s+([A-Za-z_$][\w$]*)/;

const IMPORT = /^import\s+(?:\*\s+as\s+([A-Za-z_$][\w$]*)|\{([^}]*)\}|([A-Za-z_$][\w$]*))\s+from\s+['"]([^'"]+)['"]/;
const EXPORT_CLAUSE = /^export\s+\{([\s\S]*?)\}\s*;?\s*$/;
const REEXPORT = /^export\s+(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/;

const NG_DECLARATION = /^\s*static\s+(ɵcmp|ɵdir|ɵpipe)\s*:\s*[^<]*<([\s\S]*)>\s*;?\s*$/;

/**
 * A member line.
 *
 * The tail is optional because a `.d.ts` elides the type of anything private: `private renderer;`
 * is a whole declaration. Requiring a type there dropped those members silently, which only
 * mattered for the `internals` tier but was wrong everywhere.
 */
const MEMBER =
    /^\s*((?:(?:readonly|static|abstract|protected|private|declare|get|set|async)\s+)*)([A-Za-z_$ɵ][\w$]*|\[[^\]]+\])(\??)\s*([<(:=][\s\S]*?)?;?\s*$/;

const LIFECYCLE = new Set([
    'ngOnInit',
    'ngOnDestroy',
    'ngOnChanges',
    'ngDoCheck',
    'ngAfterContentInit',
    'ngAfterContentChecked',
    'ngAfterViewInit',
    'ngAfterViewChecked'
]);

/** `{ "kbqStyle": { "alias": "kbqStyle"; "required": false; "isSignal": true; } }`, and the older
 *  `{ "kbqStyle": "kbqStyle" }` that releases before the signal migration emit. */
const parseInputs = (segment: string): DtsInput[] =>
    objectEntries(segment).map(([name, value]): DtsInput => {
        const plain = stringLiteral(value);

        if (plain !== undefined) return { name, alias: plain, required: false, isSignal: false };

        const fields = new Map(objectEntries(value));

        return {
            name,
            alias: stringLiteral(fields.get('alias') ?? '') ?? name,
            required: (fields.get('required') ?? '').trim() === 'true',
            isSignal: (fields.get('isSignal') ?? '').trim() === 'true'
        };
    });

const parseOutputs = (segment: string): DtsOutput[] =>
    objectEntries(segment).map(([name, value]) => ({ name, alias: stringLiteral(value) ?? name }));

/**
 * `[{ directive: typeof KbqButtonGroupRoot; inputs: { "color": "color"; }; outputs: {}; }]`
 *
 * The directive may be reached through a namespace alias — `typeof i1.KbqStateSavingDirective`,
 * `typeof _koobiq_components_core.KbqLocaleDirective` — depending on how the emitter happened to
 * import it. Capturing the first identifier yields `i1`, which resolves to nothing: 63 inputs then
 * came back with no type and a `via i1` label that tells a reader less than silence would.
 */
const parseHostDirectives = (segment: string): DtsHostDirective[] => {
    const inner = /^\[([\s\S]*)\]$/.exec(segment.trim())?.[1];

    if (!inner) return [];

    return splitTopLevel(inner).flatMap((entry) => {
        const fields = new Map(objectEntries(entry));
        const directive = /typeof\s+(?:[A-Za-z_$][\w$]*\.)*([A-Za-z_$][\w$]*)/.exec(fields.get('directive') ?? '')?.[1];

        if (!directive) return [];

        const asRecord = (raw: string | undefined): Record<string, string> =>
            Object.fromEntries(objectEntries(raw ?? '').map(([key, value]) => [key, stringLiteral(value) ?? key]));

        return [{ directive, inputs: asRecord(fields.get('inputs')), outputs: asRecord(fields.get('outputs')) }];
    });
};

type Declaration = Pick<DtsSymbol, 'selector' | 'exportAs' | 'inputs' | 'outputs' | 'hostDirectives'> & {
    kind: DtsSymbolKind;
};

const parseDeclaration = (line: string): Declaration | null => {
    const match = NG_DECLARATION.exec(line);

    if (!match) return null;

    const marker = match[1]!;
    const segments = splitTopLevel(match[2]!);

    if (marker === 'ɵpipe') {
        return {
            kind: 'pipe',
            selector: stringLiteral(segments[1] ?? ''),
            exportAs: [],
            inputs: [],
            outputs: [],
            hostDirectives: []
        };
    }

    // Component and directive declarations agree on positions 1–5; they diverge only after the
    // content selectors, which nothing here reads.
    return {
        kind: marker === 'ɵcmp' ? 'component' : 'directive',
        selector: stringLiteral(segments[1] ?? ''),
        exportAs: stringArray(segments[2] ?? ''),
        inputs: parseInputs(segments[3] ?? ''),
        outputs: parseOutputs(segments[4] ?? ''),
        hostDirectives: parseHostDirectives(segments.at(-1) ?? '')
    };
};

const classifyMember = (name: string, modifiers: string[], rest: string): DtsMember => {
    const visibility = modifiers.includes('private')
        ? 'private'
        : modifiers.includes('protected')
          ? 'protected'
          : 'public';

    const accessor = modifiers.includes('get') || modifiers.includes('set');
    const kind: DtsMemberKind = accessor
        ? 'accessor'
        : rest.startsWith('(') || rest.startsWith('<')
          ? 'method'
          : 'property';

    return {
        name,
        kind,
        signature: stripNamespaces(`${name}${rest}`).replace(/;$/, ''),
        visibility,
        internal: name.startsWith('_') || name.startsWith('ɵ') || name.startsWith('ngAcceptInputType_'),
        lifecycle: LIFECYCLE.has(name)
    };
};

const emptySymbol = (name: string, kind: DtsSymbolKind, base: string | null = null): DtsSymbol => ({
    name,
    kind,
    base,
    exportAs: [],
    inputs: [],
    outputs: [],
    hostDirectives: [],
    members: []
});

export const parseDts = (source: string): DtsFile => {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const file: DtsFile = { imports: new Map(), symbols: new Map(), exported: new Set(), reexports: [] };

    let current: DtsSymbol | null = null;
    let depth = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        if (current === null) {
            const reexport = REEXPORT.exec(trimmed)?.[1];

            if (reexport?.startsWith('.')) {
                file.reexports.push(reexport);
                continue;
            }

            const exported = EXPORT_CLAUSE.exec(trimmed)?.[1];

            // `export { A, B as C }` — the public surface. `as` renames; the visible name is the right side.
            if (exported && !/\bfrom\b/.test(trimmed)) {
                for (const entry of splitTopLevel(exported)) {
                    const name = /(?:\bas\s+)?([A-Za-z_$][\w$]*)\s*$/.exec(entry)?.[1];

                    if (name) file.exported.add(name);
                }

                continue;
            }

            const imported = IMPORT.exec(trimmed);

            if (imported) {
                const specifier = imported[4]!;
                const names = imported[1]
                    ? [imported[1]]
                    : imported[3]
                      ? [imported[3]]
                      : splitTopLevel(imported[2] ?? '');

                for (const entry of names) {
                    const local = /(?:\bas\s+)?([A-Za-z_$][\w$]*)\s*$/.exec(entry)?.[1];

                    if (local) file.imports.set(local, specifier);
                }

                continue;
            }

            const klass = CLASS.exec(trimmed);

            if (klass) {
                current = emptySymbol(klass[1]!, 'class', klass[2] ?? null);
                depth = (trimmed.match(/\{/g)?.length ?? 0) - (trimmed.match(/\}/g)?.length ?? 0);

                if (depth <= 0) {
                    file.symbols.set(current.name, current);
                    current = null;
                }

                continue;
            }

            const enumName = ENUM.exec(trimmed)?.[1];

            if (enumName) {
                current = emptySymbol(enumName, 'enum');
                depth = 1;
                continue;
            }

            const interfaceName = INTERFACE.exec(trimmed)?.[1];

            if (interfaceName) {
                current = emptySymbol(interfaceName, 'interface');
                depth = 1;
                continue;
            }

            for (const [pattern, kind] of [
                [FUNCTION, 'function'],
                [CONST, 'const'],
                [TYPE, 'type']
            ] as const) {
                const name = pattern.exec(trimmed)?.[1];

                if (name && !file.symbols.has(name)) file.symbols.set(name, emptySymbol(name, kind));
            }

            continue;
        }

        depth += (line.match(/\{/g)?.length ?? 0) - (line.match(/\}/g)?.length ?? 0);

        if (depth <= 0) {
            file.symbols.set(current.name, current);
            current = null;
            continue;
        }

        const declaration = parseDeclaration(line);

        if (declaration) {
            Object.assign(current, declaration);
            continue;
        }

        if (current.kind === 'enum') {
            const item = /^([A-Za-z_$][\w$]*)\s*=/.exec(trimmed);

            if (item) {
                current.members.push({
                    name: item[1]!,
                    kind: 'enum-item',
                    signature: stripNamespaces(trimmed).replace(/,$/, ''),
                    visibility: 'public',
                    internal: false,
                    lifecycle: false
                });
            }

            continue;
        }

        const member = MEMBER.exec(line);

        if (member && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('/*')) {
            const modifiers = (member[1] ?? '').trim().split(/\s+/).filter(Boolean);
            const name = member[2]!;

            if (name === 'constructor') continue;

            const rest = member[4] ?? '';
            const setterType = modifiers.includes('set')
                ? /^\(\s*[\w$]+\s*:\s*([\s\S]+?)\)\s*;?\s*$/.exec(rest)?.[1]
                : undefined;

            // An accessor pair is one member to a consumer: the getter carries the readable type,
            // the setter what may be assigned. Both are kept; which one is shown is the caller's.
            const existing = current.members.find((entry) => entry.name === name);

            if (existing) {
                if (modifiers.includes('get')) {
                    Object.assign(existing, classifyMember(name, modifiers, rest), {
                        ...(existing.accepts ? { accepts: existing.accepts } : {})
                    });
                }

                if (setterType) existing.accepts = stripNamespaces(setterType);

                continue;
            }

            const created = classifyMember(name, modifiers, rest);

            if (setterType) created.accepts = stripNamespaces(setterType);

            current.members.push(created);
        }
    }

    if (current) file.symbols.set(current.name, current);

    return file;
};
