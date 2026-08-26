import { readFileSync } from 'fs';
import type { IReleaseTaskConfig } from './base-release-task';

/**
 * Maps a commit note to a string that will be used to match notes of the
 * given type in commit messages.
 */
export const enum CommitNote {
    Deprecation = 'DEPRECATED',
    BreakingChange = 'BREAKING CHANGE'
}

/** Internal key under which doc-related commits are grouped, regardless of their package. */
export const DOCS_SECTION_KEY = 'documentation';

/** Interface that describes a package in the changelog. */
export interface IChangelogPackage {
    commits: any[];
    breakingChanges: any[];
    deprecations: any[];
}

/**
 * Sorts commits by the given keys, concatenated and compared as one string.
 *
 * Reimplements `functionify` from conventional-changelog-writer 5, which was reached through the
 * internal `lib/util.js` path. Version 9 neither exports it nor keeps that path, and its own
 * `commitsSort` option only sorts the writer's groups, not the per-package groups built below.
 */
export function compareCommitsBy(keys: string[]) {
    return (a: any, b: any): number => {
        const left = keys.map((key) => a[key] || '').join('');
        const right = keys.map((key) => b[key] || '').join('');

        return left.localeCompare(right);
    };
}

/**
 * Renders the base url a commit link points at. Mirrors the branch the old commit.hbs took:
 * `host/owner/repository` when a repository is known, and the plain repository url otherwise.
 */
export function renderRepositoryUrl(context: any): string {
    if (!context.repository) {
        return context.repoUrl;
    }

    const host = context.host ? `${context.host}/` : '';
    const owner = context.owner ? `${context.owner}/` : '';

    return `${host}${owner}${context.repository}`;
}

/**
 * Renders a single commit entry.
 *
 * Replaces the former commit.hbs. conventional-changelog-writer 9 dropped Handlebars entirely
 * and takes render functions instead, so the template is expressed directly. The output is
 * byte for byte the same: an optional bold scope, the subject (or the raw header when there is
 * no subject), then either a linked short hash or the bare short hash.
 */
export function renderCommit(context: any, commit: any): string {
    const scope = commit.scope ? ` **${commit.scope}:**` : '';
    const subject = commit.subject || commit.header;
    const link = context.linkReferences
        ? `([${commit.shortHash}](${renderRepositoryUrl(context)}/${context.commit}/${commit.hash}))`
        : commit.shortHash;

    return `${scope} ${subject} ${link}`;
}

/**
 * Comparator function that sorts a given array of strings based on the
 * hardcoded changelog package order. Entries which are not hardcoded are
 * sorted in alphabetical order after the hardcoded entries.
 */
export function preferredOrderComparator(packages: string[]) {
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
export function getTypeOfCommitGroupDescription(description: string): string {
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

export function preparePackageName(name: string): string {
    return name
        .split('-')
        .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
        .join(' ');
}

export function createChangelogWriterOptions(
    changelogPath: string,
    presetWriterOptions: any,
    config: IReleaseTaskConfig,
    logSkippedDuplicate: (commit: any) => void = () => {}
) {
    const existingChangelogContent = readFileSync(changelogPath, 'utf8');
    const commitSortFunction = compareCommitsBy(['type', 'scope', 'subject']);

    return {
        // Replaces the former template.hbs and commit.hbs, which rendered the commits grouped by
        // package name. conventional-changelog-writer 9 replaced Handlebars templates with render
        // functions, so the two customised templates now live in this file. The release header is
        // still the one from the angular preset, exactly as `{{> header}}` used to resolve it.
        template: (context: any) =>
            `${presetWriterOptions.headerPartial(context)}\n\n` +
            context.packageGroups
                .map(
                    (group: any) =>
                        `### ${group.title}\n\n` +
                        group.commits
                            .map((commit: any) => ` * ${commit.type} ${renderCommit(context, commit)}\n`)
                            .join('') +
                        '\n'
                )
                .join(''),
        commitPartial: renderCommit,

        // Overwrites the conventional-changelog-angular preset transform function. This is necessary
        // because the Angular preset changes every commit note to a breaking change note. Since we
        // have a custom note type for deprecations, we need to keep track of the original type.
        //
        // conventional-changelog-writer 9 hands the transform an immutable commit and merges the
        // returned diff, so the note type is carried on a copy rather than assigned in place. The
        // preset spreads each incoming note before overwriting its title, so `type` survives, and
        // it returns `notes` as part of its diff.
        transform: (commit: any, context: any) => {
            const notes = commit.notes.map((note: any) => ({ ...note, type: note.title }));

            return presetWriterOptions.transform({ ...commit, notes }, context);
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
                        logSkippedDuplicate(commit);

                        return false;
                    }

                    if (!commit.package && commit.scope) {
                        const matchingPackage = packageNames.find((pkgName: string) => pkgName === commit.scope);

                        if (matchingPackage) {
                            commit.scope = null;
                            commit.package = matchingPackage;
                        }
                    }

                    const type = getTypeOfCommitGroupDescription(group.title || '');

                    // A commit is doc-related if it's grouped under the Documentation type, or its
                    // scope is exactly "docs" (a multi-value scope like "docs,select" doesn't count).
                    const isDocsCommit = type === 'docs' || commit.scope === 'docs';
                    const packageName = isDocsCommit ? DOCS_SECTION_KEY : commit.package || config.changelogScope;

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

            const sortedPackageGroupNames = Object.keys(packageGroups)
                .filter((pkgName) => pkgName !== DOCS_SECTION_KEY)
                .sort(preferredOrderComparator(packageNames));

            // Render the Documentation section last, after all package sections.
            if (packageGroups[DOCS_SECTION_KEY]) {
                sortedPackageGroupNames.push(DOCS_SECTION_KEY);
            }

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
