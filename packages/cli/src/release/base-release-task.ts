/* tslint:disable:no-console */
import chalk from 'chalk';
import { execSync, ExecSyncOptions } from 'child_process';
import { readFileSync } from 'fs';
import inquirer from 'inquirer';
import { join } from 'path';
import { GitClient } from './git/git-client';
import { Version } from './version-name/parse-version';
import { getAllowedPublishBranches } from './version-name/publish-branches';

const { red, italic, yellow, green } = chalk;
const { prompt } = inquirer;

export type LifecycleStage = 'pre-publish' | 'post-publish';
export interface IReleaseTaskConfig {
    projectDir: string;
    repoToken: string;
    distDir: string;
    repoOwner: string;
    repoName: string;
    repoUrl: string;
    changelogScope: string;
    withoutReferences: boolean;
    withoutNotification: boolean;
}

/**
 * Base release task class that contains shared methods that are commonly used across
 * the staging and publish script.
 */
export class BaseReleaseTask {
    /** Path to the project package JSON. */
    packageJsonPath: string;
    /** Serialized package.json of the specified project. */
    packageJson: any;

    constructor(
        public git: GitClient,
        public config: IReleaseTaskConfig
    ) {
        this.packageJsonPath = join(config.projectDir, 'package.json');
        this.packageJson = JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'));
    }

    /** Checks if the user is on an allowed to publish branch for the specified version. */
    protected switchToPublishBranch(newVersion: Version): string | undefined {
        const allowedBranches = getAllowedPublishBranches(newVersion)!;
        const currentBranchName = this.git.getCurrentBranch();

        // If current branch already matches one of the allowed to publish branches, just continue
        // by exiting this function and returning the currently used publish branch.
        if (allowedBranches.includes(currentBranchName)) {
            console.log(green(`  ✓   Using the "${italic(currentBranchName)}" branch.`));

            return currentBranchName;
        }

        // In case there are multiple allowed publish branches for this version, we just
        // exit and let the user decide which branch they want to release from.
        if (allowedBranches.length !== 1) {
            console.warn(yellow('  ✘   You are not on an allowed publish branch.'));
            console.warn(
                yellow(`      Please switch to one of the following branches: ` + `${allowedBranches.join(', ')}`)
            );
            process.exit(0);
        }

        // For this version there is only *one* allowed publish branch, so we could
        // automatically switch to that branch in case the user isn't on it yet.
        const defaultPublishBranch = allowedBranches[0];

        if (!this.git.checkoutBranch(defaultPublishBranch)) {
            console.error(red(`  ✘   Could not switch to the "${italic(defaultPublishBranch)}" ` + `branch.`));
            console.error(red(`      Please ensure that the branch exists or manually switch to the ` + `branch.`));
            process.exit(1);
        }

        console.log(green(`  ✓   Switched to the "${italic(defaultPublishBranch)}" branch.`));

        return;
    }

    /** Verifies that the local branch is up to date with the given publish branch. */
    protected verifyLocalCommitsMatchUpstream(publishBranch: string) {
        const upstreamCommitSha = this.git.getRemoteCommitSha(publishBranch);
        const localCommitSha = this.git.getLocalCommitSha('HEAD');

        // Check if the current branch is in sync with the remote branch.
        if (upstreamCommitSha !== localCommitSha) {
            // console.error(red(`  ✘ The current branch is not in sync with the remote branch. Please ` +
            //     `make sure your local branch "${italic(publishBranch)}" is up to date.`));
            // process.exit(1);
        }
    }

    /** Verifies that there are no uncommitted changes in the project. */
    protected verifyNoUncommittedChanges() {
        if (this.git.hasUncommittedChanges()) {
            // console.error(red(`  ✘   There are changes which are not committed and should be ` +
            //     `discarded.`));
            // process.exit(1);
        }
    }

    /** Prompts the user with a confirmation question and a specified message. */
    protected async promptConfirm(message: string): Promise<boolean> {
        return (
            await prompt<{ result: boolean }>({
                type: 'confirm',
                name: 'result',
                message
            })
        ).result;
    }

    /**
     * Verifies that there are release config in the package.json
     */
    protected checkReleaseConfiguration() {
        const releasePackages = this.packageJson?.release?.packages;

        if (!releasePackages) {
            console.error(red(`  ✘   Release config did not find in the package.json file.`));
            process.exit(1);
        }
    }

    /** Builds all release packages that should be published. */
    protected runReleaseCommands(commandType: LifecycleStage) {
        const binDir = join(this.config.projectDir, 'node_modules/.bin');
        const spawnOptions: ExecSyncOptions = { cwd: binDir, stdio: 'inherit' };
        const preReleaseCommands = this.packageJson?.release?.hooks?.[commandType] ?? [];

        for (const command of preReleaseCommands) {
            execSync(command, spawnOptions);
        }
    }
}
