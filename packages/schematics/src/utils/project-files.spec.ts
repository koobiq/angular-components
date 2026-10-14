import { Path, virtualFs } from '@angular-devkit/core';
import { HostTree } from '@angular-devkit/schematics';
import { visitProjectFiles } from './project-files';

/** A tree over an in-memory host that records every directory it lists. */
function trackedTree(files: string[]): { tree: HostTree; listed: string[] } {
    const host = new virtualFs.SimpleMemoryHost();
    const listed: string[] = [];
    const list = host.list.bind(host);

    host.list = (path: Path) => {
        listed.push(path);

        return list(path);
    };

    const tree = new HostTree(host);

    for (const file of files) tree.create(file, `// ${file}\n`);

    return { tree, listed };
}

function visited(tree: HostTree, root = '/'): string[] {
    const paths: string[] = [];

    visitProjectFiles(tree.getDir(root), (path, entry) => {
        expect(entry.content.toString()).toBe(`// ${path}\n`);
        paths.push(path);
    });

    return paths;
}

describe('visitProjectFiles', () => {
    it('visits the files in the order of DirEntry.visit', () => {
        const { tree } = trackedTree([
            '/b/z.ts',
            '/a/nested/deep.html',
            '/root.ts',
            '/a/x.ts',
            '/b/y.scss',
            '/a/nested/other.ts'
        ]);
        const expected: string[] = [];

        tree.root.visit((path) => {
            expected.push(path);
        });

        expect(visited(tree)).toEqual(expected);
    });

    it('never lists node_modules, dist, .angular or .git, at any depth', () => {
        const { tree, listed } = trackedTree([
            '/src/app.ts',
            '/node_modules/pkg/index.ts',
            '/dist/app/main.ts',
            '/.angular/cache/deps.ts',
            '/.git/hooks/pre-commit.ts',
            '/projects/lib/src/lib.ts',
            '/projects/lib/node_modules/pkg/index.ts',
            '/projects/lib/dist/lib.ts'
        ]);

        listed.length = 0;

        expect(visited(tree).sort()).toEqual(['/projects/lib/src/lib.ts', '/src/app.ts']);
        expect(listed.filter((path) => /\/(?:node_modules|dist|\.angular|\.git)(?:\/|$)/.test(path))).toEqual([]);
    });

    it('skips a directory by its whole name, not by a part of it', () => {
        const { tree } = trackedTree(['/src/distribution/chart.ts', '/src/.gitlab/ci.ts']);

        expect(visited(tree).sort()).toEqual(['/src/.gitlab/ci.ts', '/src/distribution/chart.ts']);
    });

    it('walks only the directory it is given', () => {
        const { tree } = trackedTree(['/projects/app/src/main.ts', '/projects/lib/src/lib.ts']);

        expect(visited(tree, '/projects/app')).toEqual(['/projects/app/src/main.ts']);
    });
});
