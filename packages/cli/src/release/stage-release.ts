import { Octokit } from '@octokit/rest';
import chalk from 'chalk';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { BaseReleaseTask, IReleaseTaskConfig } from './base-release-task';
import { promptAndGenerateChangelog } from './changelog';
import { CHANGELOG_FILE_NAME } from './constants';
import { GitClient } from './git/git-client';
import { getGithubBranchCommitsUrl } from './git/github-urls';
import { promptForNewVersion } from './prompt/new-version-prompt';
import { Version, parseVersionName } from './version-name/parse-version';

const { green, yellow, red, cyan, bold, italic } = chalk;

/**
 * Class that can be instantiated in order to stage a new release. The tasks requires user
 * interaction/input through command line prompts.
 *
 * Staging a release involves the following the steps:
 *
 *  1) Prompt for release type (with version suggestion)
 *  2) Prompt for version name if no suggestions has been selected
 *  3) Assert that there are no local changes which are uncommitted.
 *  4) Assert that the proper publish branch is checked out. (e.g. 6.4.x for patches)
 *     If a different branch is used, try switching to the publish branch automatically
 *  5) Assert that the Github status checks pass for the publish branch.
 *  6) Assert that the local branch is up to date with the remote branch.
 *  7) Creates a new branch for the release staging (release-stage/{VERSION})
 *  8) Switches to the staging branch and updates the package.json
 *  9) Prompt for release name and generate changelog
 *  10) Wait for the user to continue (users can customize generated changelog)
 *  11) Create a commit that includes all changes in the staging branch.
 */
export class StageReleaseTask extends BaseReleaseTask {
    /** Parsed current version of the project. */
    currentVersion: Version;

    /** Instance of a wrapper that can execute Git commands. */
    declare git: GitClient;

    /** Octokit API instance that can be used to make Github API calls. */
    githubApi: Octokit;

    tabSpaces = 4;

    constructor(public override config: IReleaseTaskConfig) {
        super(new GitClient(config.projectDir, config.repoUrl), config);
        this.currentVersion = parseVersionName(this.packageJson.version)!;

        if (!this.currentVersion) {
            console.error(
                red(
                    `Cannot parse current version in ${italic('package.json')}. Please ` +
                        `make sure "${this.packageJson.version}" is a valid Semver version.`
                )
            );
            process.exit(1);
        }

        this.githubApi = new Octokit({
            type: 'token',
            token: config.repoToken
        });
    }

    async run() {
        console.log();
        console.log(cyan('-----------------------------------------'));
        console.log(cyan('  koobiq stage release script'));
        console.log(cyan('-----------------------------------------'));
        console.log();

        const newVersion = await promptForNewVersion(this.currentVersion);
        const newVersionName = newVersion.format();
        const needsVersionBump = !newVersion.equals(this.currentVersion);
        const stagingBranch = `release-stage/${newVersionName}`;

        // After the prompt for the new version, we print a new line because we want the
        // new log messages to be more in the foreground.
        console.log();

        // Ensure there are no uncommitted changes. Checking this before switching to a
        // publish branch is sufficient as unstaged changes are not specific to Git branches.
        this.verifyNoUncommittedChanges();

        // Branch that will be used to stage the release for the new selected version.
        const publishBranch = this.switchToPublishBranch(newVersion)!;

        this.verifyLocalCommitsMatchUpstream(publishBranch);
        await this.verifyPassingGithubStatus(publishBranch);

        if (!this.git.checkoutNewBranch(stagingBranch)) {
            console.error(red(`Could not create release staging branch: ${stagingBranch}. Aborting...`));
            process.exit(1);
        }

        if (needsVersionBump) {
            this.updatePackageJsonVersion(newVersionName);

            console.log(
                green(
                    `  ✓   Updated the version to "${bold(newVersionName)}" inside of the ` +
                        `${italic('package.json')}`
                )
            );
            console.log();
        }

        await promptAndGenerateChangelog(join(this.config.projectDir, CHANGELOG_FILE_NAME), this.config);

        console.log();
        console.log(green(`  ✓   Updated the changelog in ` + `"${bold(CHANGELOG_FILE_NAME)}"`));
        console.log(
            yellow(
                `  ⚠   Please review CHANGELOG.md and ensure that the log contains only ` +
                    `changes that apply to the public library release. When done, proceed to the prompt below.`
            )
        );
        console.log();

        if (!(await this.promptConfirm('Do you want to proceed and commit the changes?'))) {
            console.log();
            console.log(yellow('Aborting release staging...'));
            process.exit(0);
        }

        this.git.stageAllChanges();
        this.git.createNewCommit(`chore: bump version to ${newVersionName} w/ changelog`);

        console.info();
        console.info(green(`  ✓   Created the staging commit for: "${newVersionName}".`));
        console.info(green(`  ✓   Please push the changes and submit a PR on GitHub.`));
        console.info();
    }

    /** Updates the version of the project package.json and writes the changes to disk. */
    private updatePackageJsonVersion(newVersionName: string) {
        const newPackageJson = { ...this.packageJson, version: newVersionName };

        writeFileSync(this.packageJsonPath, `${JSON.stringify(newPackageJson, null, this.tabSpaces)}\n`);
    }

    /** Verifies that the latest commit of the current branch is passing all Github statuses. */
    private async verifyPassingGithubStatus(expectedPublishBranch: string) {
        const commitRef = this.git.getLocalCommitSha('HEAD');
        const { repoOwner, repoName } = this.config;
        const githubCommitsUrl = getGithubBranchCommitsUrl(repoOwner, repoName, expectedPublishBranch);
        const { state } = (
            await this.githubApi.repos.getCombinedStatusForRef({
                owner: repoOwner,
                repo: repoName,
                ref: commitRef
            })
        ).data;

        if (state === 'failure') {
            console.error(
                red(
                    `  ✘   Cannot stage release. Commit "${commitRef}" does not pass all github ` +
                        `status checks. Please make sure this commit passes all checks before re-running.`
                )
            );
            console.error(red(`      Please have a look at: ${githubCommitsUrl}`));

            if (await this.promptConfirm('Do you want to ignore the Github status and proceed?')) {
                console.info(
                    green(`  ⚠   Upstream commit is failing CI checks, but status has been ` + `forcibly ignored.`)
                );

                return;
            }

            process.exit(1);
        } else if (state === 'pending') {
            console.error(
                red(
                    `  ✘   Commit "${commitRef}" still has pending github statuses that ` +
                        `need to succeed before staging a release.`
                )
            );
            console.error(red(`      Please have a look at: ${githubCommitsUrl}`));

            if (await this.promptConfirm('Do you want to ignore the Github status and proceed?')) {
                console.info(green(`  ⚠   Upstream commit is pending CI, but status has been ` + `forcibly ignored.`));

                return;
            }

            process.exit(0);
        }

        console.info(green(`  ✓   Upstream commit is passing all github status checks.`));
    }
}
