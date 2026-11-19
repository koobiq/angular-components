import type { logging } from '@angular-devkit/core';
import { SchematicsException, type Tree } from '@angular-devkit/schematics';
import fs from 'fs';
import * as path from 'path';

export type IconPair = { from: string; to: string };

const KBQ_PREFIX = 'kbq-';

const MAPPING_EXAMPLE = '[{ "replace": "add-to-list_16", "replaceWith": "file-plus-o_16" }]';

const stripKbqPrefix = (value: string) => (value.startsWith(KBQ_PREFIX) ? value.slice(KBQ_PREFIX.length) : value);

export function readCustomJson(tree: Tree, filePath: string, bases: string[] = ['/']): unknown {
    for (const base of bases) {
        const candidate = path.posix.join(base, filePath);

        if (tree.exists(candidate)) {
            return JSON.parse(tree.readText(candidate));
        }
    }

    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
        throw new SchematicsException(`Unable to find '${filePath}' in the workspace or at '${absolutePath}'`);
    }

    return JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
}

export function readCustomIconMapping(
    tree: Tree,
    filePath: string,
    logger: logging.LoggerApi,
    bases?: string[]
): IconPair[] {
    const entries = readCustomJson(tree, filePath, bases);
    const invalid = () =>
        new SchematicsException(`'${filePath}' must hold a JSON array of icon pairs, for example ${MAPPING_EXAMPLE}`);

    if (!Array.isArray(entries)) {
        throw invalid();
    }

    let legacyShape = false;

    const pairs = entries.map((entry): IconPair => {
        if (typeof entry?.replace === 'string' && typeof entry?.replaceWith === 'string') {
            return { from: stripKbqPrefix(entry.replace), to: stripKbqPrefix(entry.replaceWith) };
        }

        if (typeof entry?.from === 'string' && typeof entry?.to === 'string') {
            legacyShape = true;

            return { from: stripKbqPrefix(entry.from), to: stripKbqPrefix(entry.to) };
        }

        throw invalid();
    });

    if (legacyShape) {
        logger.warn(
            `'${filePath}' uses the deprecated { "from", "to" } pairs; write them as { "replace", "replaceWith" }, for example ${MAPPING_EXAMPLE}`
        );
    }

    return pairs;
}
