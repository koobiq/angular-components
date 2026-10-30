import { HostTree, SchematicsException } from '@angular-devkit/schematics';
import { resolveTargetDir } from './package-config';

const workspace = JSON.stringify({ version: 1, projects: { app: { root: 'apps/app', projectType: 'application' } } });

function treeWith(files: string[], withWorkspace = true): HostTree {
    const tree = new HostTree();

    if (withWorkspace) tree.create('/angular.json', workspace);

    for (const file of files) tree.create(file, '');

    return tree;
}

describe('resolveTargetDir', () => {
    it('walks the whole tree without a project', async () => {
        const tree = treeWith(['/libs/a.ts']);

        expect((await resolveTargetDir(undefined, tree)).path).toBe('/');
    });

    it('resolves a project name to its root', async () => {
        const tree = treeWith(['/apps/app/src/main.ts']);

        expect((await resolveTargetDir('app', tree)).path).toBe('/apps/app');
    });

    it.each(['./libs', 'libs', 'libs/', '/libs'])('resolves the folder %s', async (project: string) => {
        const tree = treeWith(['/libs/ui/icon.html']);

        expect((await resolveTargetDir(project, tree)).path).toBe('/libs');
    });

    it('resolves a folder in a tree without angular.json', async () => {
        const tree = treeWith(['/libs/ui/icon.html'], false);

        expect((await resolveTargetDir('./libs', tree)).path).toBe('/libs');
    });

    it('throws on something that is neither a project nor a folder', async () => {
        const tree = treeWith(['/libs/ui/icon.html']);

        await expect(resolveTargetDir('./missing', tree)).rejects.toBeInstanceOf(SchematicsException);
    });
});
