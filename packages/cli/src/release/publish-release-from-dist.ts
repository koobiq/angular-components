import chalk from 'chalk';
import { join } from 'path';
import { BaseReleaseTask, IReleaseTaskConfig } from './base-release-task';
import { CHANGELOG_FILE_NAME } from './constants';
import { extractReleaseNotes } from './extract-release-notes';
import { GitClient } from './git/git-client';
import { notify } from './notify-release';
import { npmPublish } from './npm/npm-client';
import { checkReleasePackage } from './release-output/check-packages';
import { Version, parseVersionName } from './version-name/parse-version';

const { bold, cyan, green, italic, red } = chalk;

export class PublishReleaseFromDistTask extends BaseReleaseTask {
    /** Parsed current version of the project. */
    currentVersion: Version;

    /** Instance of a wrapper that can execute Git commands. */
    declare git: GitClient;

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
    }

    async run() {
        console.info();
        console.info(cyan('-----------------------------------------'));

        if (process.env['DEBUG']) {
            console.info(red(' [DEBUG MODE] Koobiq CI release script'));
        } else {
            console.info(cyan('  Koobiq CI release script'));
        }
        console.info(cyan('-----------------------------------------'));
        console.info();

        this.checkReleaseConfiguration();
        this.checkReleaseOutput();

        const npmDistTag = 'latest';
        for (const packageName of this.packageJson.release.packages) {
            this.publishPackageToNpm(packageName, npmDistTag);
        }

        console.info();
        console.info(green(bold(`  ✓   Published all packages successfully`)));
        console.info();

        const newVersionName = this.currentVersion.format();

        const extractedReleaseNotes = extractReleaseNotes(
            join(this.config.projectDir, CHANGELOG_FILE_NAME),
            newVersionName
        );

        if (!extractedReleaseNotes) {
            console.error(red(`  ✘   Could not find release notes in the changelog.`));
            process.exit(1);
        }

        if (!process.env['DEBUG'] && !this.config.withoutNotification) {
            console.info(green(bold(`  ✓   Notification to Mattermost, version: ${newVersionName}`)));
            await notify(extractedReleaseNotes);
        }

        console.info(green(`  ✓  Release is posted.`));
    }

    /** Publishes the specified package within the given NPM dist tag. */
    private publishPackageToNpm(packageName: string, npmDistTag: string) {
        console.info(green(`  ⭮   Publishing "${packageName}"..`));

        const errorOutput = npmPublish(join(this.config.distDir, packageName), npmDistTag);

        if (errorOutput) {
            console.error(red(`  ✘   An error occurred while publishing "${packageName}".`));
            console.error(red(`      Please check the terminal output and reach out to the team.`));
            console.error(red(`\n${errorOutput}`));
            process.exit(1);
        }

        console.info(green(`  ✓   Successfully published "${packageName}"`));
    }

    /** Checks the release output by running the release-output validations. */
    private checkReleaseOutput() {
        const releasePackages = this.packageJson.release.packages;
        let hasFailed = false;

        releasePackages.forEach((packageName: string) => {
            if (!checkReleasePackage(this.config.distDir, packageName)) {
                hasFailed = true;
            }
        });

        // In case any release validation did not pass, abort the publishing because
        // the issues need to be resolved before publishing.
        if (hasFailed) {
            console.error(
                red(
                    `  ✘   Release output does not pass all release validations. Please fix ` +
                        `all failures or reach out to the team.`
                )
            );
            process.exit(1);
        }

        console.info(green(`  ✓   Release output passed validation checks.`));
    }
}
