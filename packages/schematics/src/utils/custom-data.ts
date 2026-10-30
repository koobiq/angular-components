import { logging } from '@angular-devkit/core';
import { SchematicsException, Tree } from '@angular-devkit/schematics';
import fs from 'fs';
import * as path from 'path';

/** One pair of an icon mapping, before and after: `{ from: 'kbq-add-to-list_16', to: 'kbq-file-plus-o_16' }`. */
export type IconPair = { from: string; to: string };

const MAPPING_EXAMPLE = '[{ "replace": "kbq-add-to-list_16", "replaceWith": "kbq-file-plus-o_16" }]';

/**
 * Reads a custom data file. The path is tried against each of `bases` in turn (the workspace root by
 * default), then as an absolute path or one relative to the current directory; a file found nowhere
 * stops the run.
 */
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

/**
 * Reads the icon mapping of `--custom-data-path`: an array of `replace`/`replaceWith` pairs. The
 * `from`/`to` pairs that `icons-replacement` used to read are still accepted, with a warning.
 */
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
            return { from: entry.replace, to: entry.replaceWith };
        }

        if (typeof entry?.from === 'string' && typeof entry?.to === 'string') {
            legacyShape = true;

            return { from: entry.from, to: entry.to };
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
