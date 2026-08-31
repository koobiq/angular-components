import { program } from 'commander';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { PublishReleaseCITask } from './release/publish-release-ci';
import { PublishReleaseFromDistTask } from './release/publish-release-from-dist';
import { PublishReleaseCIGithubTask } from './release/publish-release-github-ci';
import { PublishReleaseCIGitlabTask } from './release/publish-release-gitlab-ci';
import { ResolveNpmTagTask } from './release/resolve-npm-tag';
import { StageReleaseTask } from './release/stage-release';
import { StageReleaseCommitTask } from './release/stage-release-commit';

const ROOT_DIR = process.env['INIT_CWD'] ?? process.cwd();
const DIST_DIR = join(ROOT_DIR, 'dist');

enum CommandTypes {
    Stage = 'stage',
    StageCommit = 'stage-commit',
    PublishCi = 'publish-ci',
    PublishDist = 'publish-dist',
    PublishCIGitlab = 'publish-ci-gitlab',
    PublishCIGithub = 'publish-ci-github',
    ResolveNpmTag = 'resolve-npm-tag'
}

export const runCliCommands = () => {
    dotenvConfig();

    program
        .arguments('<action>')
        .option('-p, --project-dir <string>', 'project root directory', process.env['RELEASE_PROJECT'] ?? ROOT_DIR)
        .option('-d, --dist-dir <string>', 'packages dist directory', process.env['RELEASE_DIST'] ?? DIST_DIR)
        .option('-c, --changelog-scope <string>', 'default changelog scope', process.env['CHANGELOG_SCOPE'] ?? 'koobiq')
        // No default: when omitted, each publish task resolves the tag itself from the
        // registry's current `latest` major (see `resolveNpmDistTag`) instead of blindly
        // overwriting `latest` with whatever version happens to be published.
        .option('-t, --tag-name <string>', 'Name of the NPM dist tag. Auto-resolved when omitted.')
        // `-n` was previously declared for three different options. Commander resolved it to
        // the first one, so --without-notification and --repo-name were unreachable by their
        // short flag; commander 15 rejects the duplicate outright. `-n` keeps its original
        // meaning and the other two get short flags of their own.
        .option('-n, --without-references', 'exclude changelog links', false)
        .option('-w, --without-notification', 'cancel mattermost notifications', false)
        .option('-o, --repo-owner <string>', 'github owner name', process.env['REPO_OWNER'] ?? 'koobiq')
        .option('-r, --repo-name <string>', 'github repo name', process.env['REPO_NAME'] ?? 'koobiq')
        // Only used by `resolve-npm-tag`.
        .option('--package-name <string>', 'npm package name to resolve the dist-tag for')
        .action((subcommand, options) => {
            switch (subcommand) {
                case CommandTypes.Stage:
                    new StageReleaseTask(options).run();
                    break;
                case CommandTypes.StageCommit:
                    new StageReleaseCommitTask(options).run();
                    break;
                case CommandTypes.PublishCi:
                    new PublishReleaseCITask(options).run();
                    break;
                case CommandTypes.PublishDist:
                    new PublishReleaseFromDistTask(options).run();
                    break;
                case CommandTypes.PublishCIGitlab:
                    new PublishReleaseCIGitlabTask(options).run();
                    break;
                case CommandTypes.PublishCIGithub:
                    new PublishReleaseCIGithubTask(options).run();
                    break;
                case CommandTypes.ResolveNpmTag:
                    new ResolveNpmTagTask({
                        projectDir: options.projectDir,
                        packageName: options.packageName
                    }).run();
            }
        });

    program.parse();
};

runCliCommands();
