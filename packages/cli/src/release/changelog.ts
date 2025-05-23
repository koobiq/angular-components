import chalk from 'chalk';
import conventionalChangelog from 'conventional-changelog';
import { createReadStream, createWriteStream, readFileSync } from 'fs';
import inquirer from 'inquirer';
import merge2 from 'merge2';
import { join } from 'path';
import { Readable } from 'stream';
import { IReleaseTaskConfig } from './base-release-task';

const changelogCompare = require('conventional-changelog-writer/lib/util.js');
const writerOpts = require('conventional-changelog-angular/writer-opts.js');

const { yellow, bold } = chalk;
const { prompt } = inquirer;

/**
 * Maps a commit note to a string that will be used to match notes of the
 * given type in commit messages.
 */
const enum CommitNote {
    Deprecation = 'DEPRECATED',
    BreakingChange = 'BREAKING CHANGE'
}

/** Interface that describes a package in the changelog. */
interface IChangelogPackage {
    commits: any[];
    breakingChanges: any[];
    deprecations: any[];
}

/** Prompts for a changelog release name and prepends the new changelog. */
export async function promptAndGenerateChangelog(changelogPath: string, config: IReleaseTaskConfig) {
    const releaseName = await promptChangelogReleaseName();

    await prependChangelogFromLatestTag(changelogPath, releaseName, config);
}

/**
 * Writes the changelog from the latest Semver tag to the current HEAD.
 * @param changelogPath Path to the changelog file.
 * @param releaseName Name of the release that should show up in the changelog.
 * @param config task configuration
 */
export async function prependChangelogFromLatestTag(
    changelogPath: string,
    releaseName: string,
    config: IReleaseTaskConfig
) {
    const angularPresetWriterOptions = await writerOpts;
    const outputStream: Readable = conventionalChangelog(
        {
            preset: 'angular',
            pkg: {
                path: join(config.projectDir, 'package.json')
            }
        } /* core options */,
        { title: releaseName } /* context options */,
        undefined,
        {
            /* commit parser options */
            // Expansion of the convention-changelog-angular preset to extract the package
            // name from the commit message.
            headerPattern: /^(\w*)(?:\((?:([^/]+)\/)?(.*)\))?: (.*)$/,
            headerCorrespondence: ['type', 'package', 'scope', 'subject']
        },
        createChangelogWriterOptions(changelogPath, angularPresetWriterOptions, config) /* writer options */
    );

    // Stream for reading the existing changelog. This is necessary because we want to
    // actually prepend the new changelog to the existing one.
    const previousChangelogStream = createReadStream(changelogPath);

    return new Promise((resolve, reject) => {
        // Sequentially merge the changelog output and the previous changelog stream, so that
        // the new changelog section comes before the existing versions. Afterwards, pipe into the
        // changelog file, so that the changes are reflected on file system.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mergedCompleteChangelog = merge2(outputStream, previousChangelogStream);

        // Wait for the previous changelog to be completely read because otherwise we would
        // read and write from the same source which causes the content to be thrown off.
        previousChangelogStream.on('end', () => {
            mergedCompleteChangelog
                .pipe(createWriteStream(changelogPath))
                .once('error', reject)
                .once('finish', resolve);
        });
    });
}

/** Prompts the terminal for a changelog release name. */
export async function promptChangelogReleaseName(): Promise<string> {
    return (
        await prompt<{ releaseName: string }>({
            type: 'input',
            name: 'releaseName',
            message: 'What should be the name of the release?'
        })
    ).releaseName;
}

function createChangelogWriterOptions(changelogPath: string, presetWriterOptions: any, config: IReleaseTaskConfig) {
    const existingChangelogContent = readFileSync(changelogPath, 'utf8');
    const commitSortFunction = changelogCompare.functionify(['type', 'scope', 'subject']);

    return {
        // Overwrite the changelog templates so that we can render the commits grouped
        // by package names. Templates are based on the original templates of the
        // angular preset: "conventional-changelog-angular/templates".
        mainTemplate: readFileSync(join(__dirname, 'templates/template.hbs'), 'utf8'),
        commitPartial: readFileSync(join(__dirname, 'templates/commit.hbs'), 'utf8'),

        // Overwrites the conventional-changelog-angular preset transform function. This is necessary
        // because the Angular preset changes every commit note to a breaking change note. Since we
        // have a custom note type for deprecations, we need to keep track of the original type.
        transform: (commit: any, context: any) => {
            commit.notes.forEach((n: any) => (n.type = n.title));

            return presetWriterOptions.transform(commit, context);
        },

        // Specify a writer option that can be used to modify the content of a new changelog section.
        // See: conventional-changelog/tree/master/packages/conventional-changelog-writer
        finalizeContext: (context: any) => {
            const packageNames = context.packageData.release.packages.map((path: string) => path.split('/').pop());
            const packageGroups: { [packageName: string]: IChangelogPackage } = {};

            context.commitGroups.forEach((group: any) => {
                group.commits.forEach((commit: any) => {
                    // Filter out duplicate commits. Note that we cannot compare the SHA because the commits
                    // will have a different SHA if they are being cherry-picked into a different branch.
                    if (existingChangelogContent.includes(commit.subject)) {
                        console.log(yellow(`  ↺   Skipping duplicate: "${bold(commit.header)}"`));

                        return false;
                    }

                    if (!commit.package && commit.scope) {
                        const matchingPackage = packageNames.find((pkgName: string) => pkgName === commit.scope);

                        if (matchingPackage) {
                            commit.scope = null;
                            commit.package = matchingPackage;
                        }
                    }

                    const packageName = commit.package || config.changelogScope;

                    const type = getTypeOfCommitGroupDescription(group.title || '');

                    if (!packageGroups[packageName]) {
                        packageGroups[packageName] = { commits: [], breakingChanges: [], deprecations: [] };
                    }

                    const packageGroup = packageGroups[packageName];

                    // Collect all notes of the commit. Either breaking change or deprecation notes.
                    commit.notes.forEach((n: any) => {
                        if (n.type === CommitNote.Deprecation) {
                            packageGroup.deprecations.push(n);
                        } else if (n.type === CommitNote.BreakingChange) {
                            packageGroup.breakingChanges.push(n);
                        } else {
                            throw Error(`Found commit note that is not known: ${JSON.stringify(n, null, 4)}`);
                        }
                    });

                    if (typeof commit.subject === 'string') {
                        if (context.packageData.bugs.url) {
                            const urlIssue = `${context.packageData.bugs.url}/issue/`;

                            commit.subject = commit.subject.replace(/#([a-zA-Z]+-[0-9]+)/g, (_: any, issue: any) => {
                                return `[#${issue}](${urlIssue}${issue})`;
                            });
                        }
                    }

                    packageGroup.commits.push({ ...commit, type });

                    return;
                });
            });

            const sortedPackageGroupNames = Object.keys(packageGroups).sort(preferredOrderComparator(packageNames));

            context.linkReferences = !config.withoutReferences;
            context.packageGroups = sortedPackageGroupNames.map((pkgName) => {
                const packageGroup = packageGroups[pkgName];

                return {
                    title: preparePackageName(pkgName),
                    commits: packageGroup.commits.sort(commitSortFunction),
                    breakingChanges: packageGroup.breakingChanges,
                    deprecations: packageGroup.deprecations
                };
            });

            return context;
        }
    };
}

/**
 * Comparator function that sorts a given array of strings based on the
 * hardcoded changelog package order. Entries which are not hardcoded are
 * sorted in alphabetical order after the hardcoded entries.
 */
function preferredOrderComparator(packages: string[]) {
    return (a: string, b: string): number => {
        const aIndex = packages.indexOf(a);
        const bIndex = packages.indexOf(b);

        // If a package name could not be found in the hardcoded order, it should be
        // sorted after the hardcoded entries in alphabetical order.
        if (aIndex === -1) {
            return bIndex === -1 ? a.localeCompare(b) : 1;
        } else if (bIndex === -1) {
            return -1;
        }

        return aIndex - bIndex;
    };
}

/** Gets the type of a commit group description. */
function getTypeOfCommitGroupDescription(description: string): string {
    if (description === 'Features') {
        return 'feature';
    } else if (description === 'Bug Fixes') {
        return 'bug fix';
    } else if (description === 'Performance Improvements') {
        return 'performance';
    } else if (description === 'Reverts') {
        return 'revert';
    } else if (description === 'Documentation') {
        return 'docs';
    } else if (description === 'Code Refactoring') {
        return 'refactor';
    }

    return description.toLowerCase();
}

function preparePackageName(name: string): string {
    return name
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
}
