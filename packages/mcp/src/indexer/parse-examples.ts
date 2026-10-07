import JSON5 from 'json5';
import type { ExampleRef } from '../types.js';

/**
 * Reads `packages/docs-examples/example-module.ts`.
 *
 * That file is generated and committed, so its object literal is a stable enough contract to read
 * directly. Balanced-brace scanning rather than a regex: the literal is ~7500 lines and a
 * non-greedy match would stop at the first nested close.
 */

const ANCHOR = 'export const EXAMPLE_COMPONENTS';

type RawExample = {
    title?: string;
    primaryFile?: string;
    packagePath?: string;
    importPath?: string;
    files?: string[];
    localImportFiles?: string[];
};

const extractLiteral = (source: string): string | null => {
    const anchor = source.indexOf(ANCHOR);

    if (anchor === -1) return null;

    const start = source.indexOf('{', source.indexOf('=', anchor));

    if (start === -1) return null;

    let depth = 0;

    for (let index = start; index < source.length; index++) {
        const char = source[index];

        if (char === '{') depth++;
        else if (char === '}') {
            depth--;
            if (depth === 0) return source.slice(start, index + 1);
        }
    }

    return null;
};

/** `components/accordion` and `components/core/validation` both key on their second segment. */
export const importPathToComponentId = (importPath: string): string | null => {
    const segments = importPath.split('/').filter(Boolean);

    if (segments[0] !== 'components') return null;
    if (segments[1] === 'core' && segments[2]) return segments[2];

    return segments[1] ?? null;
};

export const parseExampleModule = (source: string): Map<string, ExampleRef[]> => {
    const literal = extractLiteral(source);
    const byComponent = new Map<string, ExampleRef[]>();

    if (!literal) return byComponent;

    const parsed = JSON5.parse(literal) as Record<string, RawExample>;

    for (const [id, raw] of Object.entries(parsed)) {
        const componentId = raw.importPath ? importPathToComponentId(raw.importPath) : null;

        if (!componentId) continue;

        const list = byComponent.get(componentId) ?? [];

        list.push({
            id,
            title: raw.title ?? id,
            primaryFile: raw.primaryFile ?? '',
            packagePath: raw.packagePath ?? '',
            files: [...new Set([...(raw.files ?? []), ...(raw.localImportFiles ?? [])])]
        });

        byComponent.set(componentId, list);
    }

    return byComponent;
};
