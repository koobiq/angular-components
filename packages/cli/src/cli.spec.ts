import { CommanderError } from 'commander';
import { createCliProgram } from './cli';

// The seven task modules are mocked so that parsing a VALID action never reaches the
// filesystem or the network: each exported class records the options it was constructed
// with, and its `run` is a `vi.fn()`.
const taskMocks = vi.hoisted(() => {
    const createMock = () => ({ options: undefined as unknown, run: vi.fn() });

    return {
        stage: createMock(),
        stageCommit: createMock(),
        publishCi: createMock(),
        publishDist: createMock(),
        publishCiGitlab: createMock(),
        publishCiGithub: createMock(),
        resolveNpmTag: createMock()
    };
});

vi.mock('./release/stage-release', () => ({
    StageReleaseTask: class {
        run = taskMocks.stage.run;

        constructor(options: unknown) {
            taskMocks.stage.options = options;
        }
    }
}));

vi.mock('./release/stage-release-commit', () => ({
    StageReleaseCommitTask: class {
        run = taskMocks.stageCommit.run;

        constructor(options: unknown) {
            taskMocks.stageCommit.options = options;
        }
    }
}));

vi.mock('./release/publish-release-ci', () => ({
    PublishReleaseCITask: class {
        run = taskMocks.publishCi.run;

        constructor(options: unknown) {
            taskMocks.publishCi.options = options;
        }
    }
}));

vi.mock('./release/publish-release-from-dist', () => ({
    PublishReleaseFromDistTask: class {
        run = taskMocks.publishDist.run;

        constructor(options: unknown) {
            taskMocks.publishDist.options = options;
        }
    }
}));

vi.mock('./release/publish-release-gitlab-ci', () => ({
    PublishReleaseCIGitlabTask: class {
        run = taskMocks.publishCiGitlab.run;

        constructor(options: unknown) {
            taskMocks.publishCiGitlab.options = options;
        }
    }
}));

vi.mock('./release/publish-release-github-ci', () => ({
    PublishReleaseCIGithubTask: class {
        run = taskMocks.publishCiGithub.run;

        constructor(options: unknown) {
            taskMocks.publishCiGithub.options = options;
        }
    }
}));

vi.mock('./release/resolve-npm-tag', () => ({
    ResolveNpmTagTask: class {
        run = taskMocks.resolveNpmTag.run;

        constructor(options: unknown) {
            taskMocks.resolveNpmTag.options = options;
        }
    }
}));

describe('createCliProgram', () => {
    const parse = (args: string[]) => {
        const program = createCliProgram();
        const out: string[] = [];
        const err: string[] = [];

        // `configureOutput` captures Commander's stdout/stderr writes (the program writes errors
        // via `process.stderr.write`, not `console.error`) so none of it trips the console hook.
        program.configureOutput({
            writeOut: (str) => out.push(str),
            writeErr: (str) => err.push(str)
        });
        program.exitOverride();

        try {
            program.parse(['node', 'koobiq-cli', ...args]);

            return { out: out.join(''), err: err.join('') };
        } catch (error) {
            return { error: error as CommanderError, out: out.join(''), err: err.join('') };
        }
    };

    beforeEach(() => {
        for (const mock of Object.values(taskMocks)) {
            mock.options = undefined;
        }
    });

    afterEach(() => {
        delete process.env['RELEASE_PROJECT'];
        delete process.env['RELEASE_DIST'];
        delete process.env['CHANGELOG_SCOPE'];
        delete process.env['REPO_OWNER'];
        delete process.env['REPO_NAME'];
    });

    it('should name the program koobiq-cli', () => {
        expect(createCliProgram().name()).toBe('koobiq-cli');
    });

    it('should list every action in --help', () => {
        const { out, error } = parse(['--help']);

        expect(error).toBeInstanceOf(CommanderError);
        expect(error?.exitCode).toBe(0);

        for (const action of [
            'stage',
            'stage-commit',
            'publish-ci',
            'publish-dist',
            'publish-ci-gitlab',
            'publish-ci-github',
            'resolve-npm-tag'
        ]) {
            expect(out).toContain(action);
        }
    });

    it('should reject an unknown action with exit code 1', () => {
        const { error } = parse(['frobnicate']);

        expect(error).toBeInstanceOf(CommanderError);
        expect(error?.exitCode).toBe(1);
        expect(error?.message).toContain('frobnicate');
    });

    it('should map every flag into the task config', () => {
        parse([
            'stage',
            '-p',
            '/proj',
            '-d',
            '/dist',
            '-c',
            'scope',
            '-t',
            'next',
            '-n',
            '-w',
            '-o',
            'owner',
            '-r',
            'repo'
        ]);

        expect(taskMocks.stage.options).toMatchObject({
            projectDir: '/proj',
            distDir: '/dist',
            changelogScope: 'scope',
            tagName: 'next',
            withoutReferences: true,
            withoutNotification: true,
            repoOwner: 'owner',
            repoName: 'repo'
        });
    });

    it('should keep the -n, -w and -o short flags distinct', () => {
        parse(['stage', '-n', '-w', '-o', 'owner', '-r', 'repo']);

        expect(taskMocks.stage.options).toMatchObject({
            withoutReferences: true,
            withoutNotification: true,
            repoOwner: 'owner',
            repoName: 'repo'
        });
    });

    it('should fall back to the env vars for the defaults', () => {
        process.env['RELEASE_PROJECT'] = '/env-proj';
        process.env['RELEASE_DIST'] = '/env-dist';
        process.env['CHANGELOG_SCOPE'] = 'env-scope';
        process.env['REPO_OWNER'] = 'env-owner';
        process.env['REPO_NAME'] = 'env-repo';

        parse(['stage']);

        expect(taskMocks.stage.options).toMatchObject({
            projectDir: '/env-proj',
            distDir: '/env-dist',
            changelogScope: 'env-scope',
            repoOwner: 'env-owner',
            repoName: 'env-repo'
        });
    });
});
