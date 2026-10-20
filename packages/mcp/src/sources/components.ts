import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseDts, type DtsFile, type DtsInput, type DtsOutput, type DtsSymbol } from '../dts/parse-dts.js';
import type { PackageRef } from './project.js';

/**
 * The public API of `@koobiq/components` as installed in the consumer's project.
 *
 * Entry points are read on demand and cached for the life of the process. Reading all seventy up
 * front would cost about a second for a question that touches one of them; `core` is the only file
 * most answers pull in besides their own, because nearly every directive inherits from something
 * declared there.
 */

export type ResolvedInput = DtsInput & {
    /** Entry point the input was declared in, when that is not the one being asked about. */
    from?: string;
    /** Set when the input reaches the element through a host directive rather than the class. */
    viaHostDirective?: string;
    /** Accepted type, unwrapped from `InputSignal<…>` and from the setter of an accessor pair. */
    type?: string;
};

/**
 * The type a template may bind.
 *
 * A signal input is declared as `InputSignal<T>` and an accessor pair as `get x(): T`, but what a
 * consumer writes is `[x]="value of T"` in both cases — so the wrapper is unwrapped here rather
 * than shown. `InputSignalWithTransform<T, U>` accepts `U` and stores `T`, so the second argument
 * is the one that answers "what may I pass".
 */
const bindableType = (signature: string | undefined): string | undefined => {
    if (!signature) return undefined;

    const transform = /InputSignalWithTransform<\s*([^,]+),\s*([\s\S]+)>\s*$/.exec(signature);

    // Angular's own `booleanAttribute` transform is typed `<boolean, unknown>` — literally true and
    // useless to a caller. When the accepted type says nothing, the stored type is the answer.
    if (transform) {
        const accepted = transform[2]!.trim();

        return accepted === 'unknown' || accepted === 'any' ? transform[1]!.trim() : accepted;
    }

    const signal = /Input(?:Signal|SignalWithTransform)<([\s\S]+)>\s*$/.exec(signature);

    if (signal) return signal[1]!.trim();

    const accessor = /^[\w$]+\(\)\s*:\s*([\s\S]+)$/.exec(signature);

    if (accessor) return accessor[1]!.trim();

    const property = /^[\w$]+\??\s*:\s*([\s\S]+)$/.exec(signature);

    return property ? property[1]!.trim() : undefined;
};

export type ResolvedOutput = DtsOutput & { from?: string; viaHostDirective?: string; type?: string };

export type ResolvedSymbol = Omit<DtsSymbol, 'inputs' | 'outputs'> & {
    inputs: ResolvedInput[];
    outputs: ResolvedOutput[];
    entryPoint: string;
};

export type ComponentsApi = {
    version: string;
    /** Entry point ids present in the installed package, e.g. `button`, `core`, `select`. */
    entryPoints: string[];
    read: (entryPoint: string) => ResolvedSymbol[] | null;
    find: (name: string) => ResolvedSymbol | null;
};

const ENTRY_PREFIX = '@koobiq/components/';

/** The `types` of an `exports` entry, through whatever conditions it is nested under. */
const typesOf = (value: unknown): string | null => {
    if (typeof value === 'string') return value.endsWith('.d.ts') ? value : null;
    if (!value || typeof value !== 'object') return null;

    const { types } = value as { types?: unknown };

    if (typeof types === 'string') return types.endsWith('.d.ts') ? types : null;

    for (const nested of Object.values(value)) {
        const found = typesOf(nested);

        if (found) return found;
    }

    return null;
};

/**
 * The `exports` map of the installed package: entry point id → the file its typings are in.
 *
 * Read in preference to the directory layout because 21.x publishes one flat file per entry point
 * under `types/` and addresses it from here, leaving the entry point directories with nothing but
 * stylesheets in them. Keys that carry no typings — `./package.json`, the prebuilt themes — are
 * skipped, so what is left is exactly the entry points the package publishes, nested ones included
 * and under the path they are imported by.
 */
const typingsFromExports = (root: string): Map<string, string> | null => {
    const manifest = join(root, 'package.json');

    if (!existsSync(manifest)) return null;

    let map: unknown;

    try {
        ({ exports: map } = JSON.parse(readFileSync(manifest, 'utf-8')) as { exports?: unknown });
    } catch {
        return null;
    }

    if (!map || typeof map !== 'object') return null;

    const found = new Map<string, string>();

    for (const [key, value] of Object.entries(map as Record<string, unknown>)) {
        if (!key.startsWith('.')) continue;

        const types = typesOf(value);

        if (types) found.set(key === '.' ? '' : key.replace(/^\.\//, ''), join(root, types));
    }

    return found.size > 0 ? found : null;
};

/**
 * Entry point directories, discovered rather than listed: the set changes every few releases.
 *
 * One level down as well, because two entry points are nested inside another's directory —
 * `scrollbar/deprecated` and `splitter/deprecated`. A top-level scan finds 64 where the package
 * publishes 66, and the two it misses are the ones a project that has not migrated off the
 * deprecated scrollbar still imports.
 */
const typingsFromDirectories = (root: string): Map<string, string> => {
    const found = new Map<string, string>();

    // The root barrel first: a directory holding no typings of its own is not this package, and
    // walking it would read every directory of whatever was handed over instead.
    if (!existsSync(join(root, 'index.d.ts'))) return found;

    found.set('', join(root, 'index.d.ts'));

    const take = (id: string, path: string) => {
        if (existsSync(path)) found.set(id, path);
    };

    for (const entry of readdirSync(root, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;

        take(entry.name, join(root, entry.name, 'index.d.ts'));

        for (const nested of readdirSync(join(root, entry.name), { withFileTypes: true })) {
            if (nested.isDirectory()) {
                take(`${entry.name}/${nested.name}`, join(root, entry.name, nested.name, 'index.d.ts'));
            }
        }
    }

    return found;
};

/**
 * Entry point id → the file its typings are published in, `''` being the root barrel.
 *
 * The packaging has moved twice: 19.x and 20.x publish a directory per entry point with an
 * `index.d.ts` in it, 21.x publishes `types/koobiq-components-<id>.d.ts` and addresses it through
 * `exports`. Both are installed by someone, so the map is read first and the scan answers for the
 * releases that have none.
 */
export const listEntryPointTypings = (root: string): Map<string, string> =>
    typingsFromExports(root) ?? typingsFromDirectories(root);

/**
 * Reads an entry point, following the barrel if there is one.
 *
 * 19.x emits an entry point as `index.d.ts` re-exporting ~512 sibling files; 20.x emits one flat
 * file. Following relative re-exports collapses the difference here instead of spreading a version
 * check through everything downstream.
 */
const readEntryFile = (indexPath: string | undefined): DtsFile | null => {
    if (!indexPath || !existsSync(indexPath)) return null;

    const merged = parseDts(readFileSync(indexPath, 'utf-8'));
    const seen = new Set<string>();
    const queue = [...merged.reexports.map((specifier) => ({ from: indexPath, specifier }))];

    while (queue.length > 0) {
        const next = queue.shift()!;
        const resolved = ['.d.ts', '/index.d.ts', '.ts']
            .map((suffix) => join(dirname(next.from), next.specifier + suffix))
            .find((candidate) => existsSync(candidate));

        if (!resolved || seen.has(resolved)) continue;

        seen.add(resolved);

        const part = parseDts(readFileSync(resolved, 'utf-8'));

        for (const [name, symbol] of part.symbols) if (!merged.symbols.has(name)) merged.symbols.set(name, symbol);
        for (const [name, specifier] of part.imports)
            if (!merged.imports.has(name)) merged.imports.set(name, specifier);
        for (const name of part.exported) merged.exported.add(name);

        queue.push(...part.reexports.map((specifier) => ({ from: resolved, specifier })));
    }

    return merged;
};

export const readComponentsApi = (pkg: PackageRef | undefined): ComponentsApi | null => {
    if (!pkg || !existsSync(join(pkg.root, 'package.json'))) return null;

    const typings = listEntryPointTypings(pkg.root);

    // No root barrel means no typings were found at all: a source checkout, or a directory handed
    // over through the override that is not this package.
    if (!typings.has('')) return null;

    const files = new Map<string, DtsFile | null>();
    const resolved = new Map<string, ResolvedSymbol[]>();

    const file = (entryPoint: string): DtsFile | null => {
        if (!files.has(entryPoint)) files.set(entryPoint, readEntryFile(typings.get(entryPoint)));

        return files.get(entryPoint) ?? null;
    };

    const entryPoints = [...typings.keys()].filter(Boolean).sort();

    /** Finds a class by name in `entryPoint`, then wherever that entry point imported it from. */
    const locate = (name: string, entryPoint: string): { symbol: DtsSymbol; entryPoint: string } | null => {
        const here = file(entryPoint);
        const own = here?.symbols.get(name);

        if (own) return { symbol: own, entryPoint };
        if (!here) return null;

        const named = here.imports.get(name);

        if (named?.startsWith(ENTRY_PREFIX)) {
            const target = named.slice(ENTRY_PREFIX.length);
            const imported = file(target)?.symbols.get(name);

            if (imported) return { symbol: imported, entryPoint: target };
        }

        // Reached through a namespace import. `import * as i1 from '@koobiq/components/core'` maps
        // `i1`, not the symbols inside it, so a host directive written `typeof i1.KbqStateSaving`
        // is invisible to the named map — 63 inputs resolved with no type because of this. The
        // candidates are the few Koobiq entry points this file imports, and they are cached.
        for (const specifier of new Set(here.imports.values())) {
            if (!specifier.startsWith(ENTRY_PREFIX)) continue;

            const target = specifier.slice(ENTRY_PREFIX.length);

            if (target === entryPoint) continue;

            const found = file(target)?.symbols.get(name);

            if (found) return { symbol: found, entryPoint: target };
        }

        return null;
    };

    /**
     * Inputs reach an element three ways and all three are usable in a template, so all three are
     * reported: declared on the class, inherited from a base directive, or exposed by a host
     * directive. Reading only the class's own declaration drops `color` from every button in the
     * library — it is declared on `KbqColorDirective` in `core` and inherited.
     */
    const resolveSymbol = (symbol: DtsSymbol, entryPoint: string): ResolvedSymbol => {
        const inputs: ResolvedInput[] = [];
        const outputs: ResolvedOutput[] = [];
        const taken = new Set<string>();
        const takenOutputs = new Set<string>();

        const add = (symbolAt: DtsSymbol, origin: string, depth: number): void => {
            if (depth > 8) return;

            for (const input of symbolAt.inputs) {
                if (taken.has(input.alias)) continue;

                taken.add(input.alias);

                const member = symbolAt.members.find((entry) => entry.name === input.name);
                const type = member?.accepts ?? bindableType(member?.signature);

                inputs.push({ ...input, ...(type ? { type } : {}), ...(depth === 0 ? {} : { from: origin }) });
            }

            for (const output of symbolAt.outputs) {
                if (takenOutputs.has(output.alias)) continue;

                takenOutputs.add(output.alias);

                const type = bindableType(symbolAt.members.find((member) => member.name === output.name)?.signature);

                outputs.push({ ...output, ...(type ? { type } : {}), ...(depth === 0 ? {} : { from: origin }) });
            }

            // The host directive's own map already states the public name, so the directive itself
            // does not have to be resolved to know what a template may write.
            for (const host of symbolAt.hostDirectives) {
                const declared = locate(host.directive, origin)?.symbol;

                for (const [own, exposed] of Object.entries(host.inputs)) {
                    if (taken.has(exposed)) continue;

                    taken.add(exposed);

                    // The key of a host-directive map is whatever that directive calls the input
                    // publicly, which is its *alias* — `kbqLocaleOverrides` for a property named
                    // `overrides`. Looking the member up by the key finds nothing; it has to be
                    // resolved back to the property name first.
                    const source = declared?.inputs.find((input) => input.alias === own || input.name === own);
                    const member = declared?.members.find((entry) => entry.name === (source?.name ?? own));
                    const type = member?.accepts ?? bindableType(member?.signature);

                    inputs.push({
                        name: own,
                        alias: exposed,
                        required: source?.required ?? false,
                        isSignal: source?.isSignal ?? false,
                        ...(type ? { type } : {}),
                        viaHostDirective: host.directive
                    });
                }

                for (const [own, exposed] of Object.entries(host.outputs)) {
                    if (takenOutputs.has(exposed)) continue;

                    takenOutputs.add(exposed);

                    const type = bindableType(declared?.members.find((member) => member.name === own)?.signature);

                    outputs.push({
                        name: own,
                        alias: exposed,
                        ...(type ? { type } : {}),
                        viaHostDirective: host.directive
                    });
                }
            }

            if (!symbolAt.base) return;

            const base = locate(symbolAt.base, origin);

            if (base) add(base.symbol, base.entryPoint, depth + 1);
        };

        add(symbol, entryPoint, 0);

        return { ...symbol, inputs, outputs, entryPoint };
    };

    const read = (entryPoint: string): ResolvedSymbol[] | null => {
        const cached = resolved.get(entryPoint);

        if (cached) return cached;

        const parsed = file(entryPoint);

        if (!parsed) return null;

        // `export { … }` is the contract. Everything else in the file is reachable only by
        // accident of bundling, and naming it would invite code that breaks on the next patch.
        const list = [...parsed.symbols.values()]
            .filter((symbol) => parsed.exported.size === 0 || parsed.exported.has(symbol.name))
            .map((symbol) => resolveSymbol(symbol, entryPoint))
            .sort((a, b) => a.name.localeCompare(b.name));

        resolved.set(entryPoint, list);

        return list;
    };

    const find = (name: string): ResolvedSymbol | null => {
        for (const entryPoint of entryPoints) {
            const hit = read(entryPoint)?.find((symbol) => symbol.name === name);

            if (hit) return hit;
        }

        return null;
    };

    return { version: pkg.version, entryPoints, read, find };
};
