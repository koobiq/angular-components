import type { IReleaseTaskConfig } from './base-release-task';

/**
 * Maps a commit note to a string that will be used to match notes of the
 * given type in commit messages.
 */
const enum CommitNote {
    Deprecation = 'DEPRECATED',
    BreakingChange = 'BREAKING CHANGE'
}

/** Internal key under which doc-related commits are grouped, regardless of their package. */
const DOCS_SECTION_KEY = 'documentation';

/** A rendered commit line, ` * <type>  <entry> <commit link>`; captures the entry with its commit link. */
const COMMIT_LINE_PATTERN = /^\s*\* [a-z]+(?: [a-z]+)* {2}(.+)$/;

/** The commit link that ends a rendered line: a linked short hash or a bare one. */
const COMMIT_LINK_PATTERN = /\s+(?:\(\[[^\]]+\]\([^)]+\)\)|[0-9a-f]{7,40}|undefined)$/;

/** Pull request references that end a subject, linked by the preset or left as is. */
const PULL_REQUEST_REFERENCES_PATTERN = /(?:\s+\((?:\[#\d+\]\([^)]+\)|#\d+)\))+$/;

/** Interface that describes a package in the changelog. */
interface IChangelogPackage {
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
function compareCommitsBy(keys: string[]) {
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
function renderRepositoryUrl(context: any): string {
    if (!context.repository) {
        return context.repoUrl;
    }

    const host = context.host ? `${context.host}/` : '';
    const owner = context.owner ? `${context.owner}/` : '';

    return `${host}${owner}${context.repository}`;
}

/** Renders the optional bold scope and the subject (or the raw header when there is no subject). */
function renderCommitEntry(commit: any): string {
    const subject = commit.subject || commit.header;

    return commit.scope ? `**${commit.scope}:** ${subject}` : subject;
}

/**
 * Renders a single commit entry.
 *
 * Replaces the former commit.hbs. conventional-changelog-writer 9 dropped Handlebars entirely
 * and takes render functions instead, so the template is expressed directly. The output is
 * byte for byte the same: the entry, then either a linked short hash or the bare short hash.
 */
function renderCommit(context: any, commit: any): string {
    const link = context.linkReferences
        ? `([${commit.shortHash}](${renderRepositoryUrl(context)}/${context.commit}/${commit.hash}))`
        : commit.shortHash;

    return ` ${renderCommitEntry(commit)} ${link}`;
}

/**
 * Identifies a change by its scope and subject. The SHA and the pull request number are left out:
 * a fix ported to a release branch gets a new SHA, and a new number when it goes through its own
 * pull request.
 */
function getChangeKey(entry: string): string {
    return entry.replace(PULL_REQUEST_REFERENCES_PATTERN, '');
}

/** Collects the change keys of every commit line in an existing changelog. */
function collectChangeKeys(changelogContent: string): Set<string> {
    const keys = new Set<string>();

    for (const line of changelogContent.split(/\r?\n/)) {
        const entry = COMMIT_LINE_PATTERN.exec(line)?.[1];

        if (entry) {
            keys.add(getChangeKey(entry.replace(COMMIT_LINK_PATTERN, '')));
        }
    }

    return keys;
}

export function createChangelogWriterOptions(
    presetWriterOptions: any,
    config: IReleaseTaskConfig,
    existingChangelogContent: string,
    logSkippedDuplicate: (commit: any) => void = () => {}
) {
    const commitSortFunction = compareCommitsBy(['type', 'scope', 'subject']);
    const existingChangeKeys = collectChangeKeys(existingChangelogContent);

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

        // Overwrites the conventional-changelog-angular preset transform function. This is necessary
        // for two reasons:
        //
        // 1. The Angular preset changes every commit note to a breaking change note. Since we have a
        //    custom note type for deprecations, we need to keep track of the original type.
        //
        //    conventional-changelog-writer 9 hands the transform an immutable commit and merges the
        //    returned diff, so the note type is carried on a copy rather than assigned in place. The
        //    preset spreads each incoming note before overwriting its title, so `type` survives, and
        //    it returns `notes` as part of its diff.
        //
        // 2. The preset discards a `docs:` commit before it ever reaches its own
        //    `commit.type === 'docs'` mapping unless the commit also carries a note, so a plain
        //    `docs:` commit would otherwise never form a "Documentation" commit group. That case is
        //    handled here instead of being delegated to the preset.
        transform: (commit: any, context: any) => {
            if (commit.type === 'docs' && commit.notes.length === 0) {
                return { ...commit, type: 'Documentation' };
            }

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

                    // The "Documentation" heading already names the scope, so drop the redundant
                    // prefix, mirroring the package remap above.
                    if (commit.scope === 'docs') {
                        commit.scope = null;
                    }

                    if (typeof commit.subject === 'string' && context.packageData.bugs.url) {
                        const urlIssue = `${context.packageData.bugs.url}/issue/`;

                        commit.subject = commit.subject.replace(/#([a-zA-Z]+-[0-9]+)/g, (_: any, issue: any) => {
                            return `[#${issue}](${urlIssue}${issue})`;
                        });
                    }

                    // Compared once the commit is in its final form, as the changelog holds it: with the
                    // package scope dropped and the issue references linked.
                    if (existingChangeKeys.has(getChangeKey(renderCommitEntry(commit)))) {
                        logSkippedDuplicate(commit);

                        return;
                    }

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

                    packageGroup.commits.push({ ...commit, type });
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
