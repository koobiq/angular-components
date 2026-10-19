import { Path } from '@angular-devkit/core';
import { DirEntry, FileEntry } from '@angular-devkit/schematics';

/** Installed packages, build output, the Angular CLI cache and VCS metadata: never a consumer's source. */
const SKIPPED_DIRECTORIES: ReadonlySet<string> = new Set(['node_modules', 'dist', '.angular', '.git']);

/**
 * Calls `visitor` for every file under `dir`, in the order of `DirEntry.visit`, without descending into the
 * skipped directories at any depth.
 *
 * `DirEntry.visit` lists the whole subtree before it visits anything, so a migration that filters its paths
 * still stats every file of `node_modules` — under `ng update`, which runs over the workspace root, that is
 * most of the run.
 */
export function visitProjectFiles(dir: DirEntry, visitor: (path: Path, entry: Readonly<FileEntry>) => void): void {
    for (const name of dir.subfiles) {
        const entry = dir.file(name);

        if (entry) visitor(entry.path, entry);
    }

    for (const name of dir.subdirs) {
        if (!SKIPPED_DIRECTORIES.has(name)) visitProjectFiles(dir.dir(name), visitor);
    }
}
