import chalk from 'chalk';
import { createReadStream, createWriteStream } from 'fs';
import inquirer from 'inquirer';
import merge2 from 'merge2';
import { join } from 'path';
import { Readable } from 'stream';
import { IReleaseTaskConfig } from './base-release-task';
import { createChangelogWriterOptions } from './changelog-writer-options';

const { yellow, bold } = chalk;
const { prompt } = inquirer;

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
export async function buildChangelogStream(
    changelogPath: string,
    releaseName: string,
    config: IReleaseTaskConfig
): Promise<Readable> {
    // conventional-changelog 8 and its presets are ES modules and publish no `require`
    // condition, so they cannot be required. A dynamic import works from CommonJS, and
    // TypeScript preserves it in the emitted output under `module: nodenext`.
    const { ConventionalChangelog } = await import('conventional-changelog');
    const createAngularPreset = (await import('conventional-changelog-angular')).default;
    const angularPreset = (await createAngularPreset()) as { writer: any };

    return new ConventionalChangelog(config.projectDir)
        .loadPreset('angular')
        .readPackage(join(config.projectDir, 'package.json'))
        .readRepository()
        .context({ title: releaseName })
        .commits(
            {},
            {
                // Expansion of the convention-changelog-angular preset to extract the package
                // name from the commit message.
                headerPattern: /^(\w*)(?:\((?:([^/]+)\/)?(.*)\))?: (.*)$/,
                headerCorrespondence: ['type', 'package', 'scope', 'subject']
            }
        )
        .writer(
            createChangelogWriterOptions(changelogPath, angularPreset.writer, config, (commit) =>
                console.log(yellow(`  ↺   Skipping duplicate: "${bold(commit.header)}"`))
            )
        )
        .writeStream();
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
    const outputStream = await buildChangelogStream(changelogPath, releaseName, config);

    // Stream for reading the existing changelog. This is necessary because we want to
    // actually prepend the new changelog to the existing one.
    const previousChangelogStream = createReadStream(changelogPath);

    // conventional-changelog-writer 9 trims each rendered block and terminates it with a single
    // newline, so unlike version 5 it no longer leaves a blank line at the end of the section.
    // Emit that separator here, otherwise the new section runs straight into the heading of the
    // previous release.
    const sectionSeparator = Readable.from('\n');

    return new Promise((resolve, reject) => {
        // Sequentially merge the changelog output and the previous changelog stream, so that
        // the new changelog section comes before the existing versions. Afterwards, pipe into the
        // changelog file, so that the changes are reflected on file system.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const mergedCompleteChangelog = merge2(outputStream, sectionSeparator, previousChangelogStream);

        // Wait for the previous changelog to be completely read because otherwise we would
        // read and write from the same source which causes the content to be thrown off.
        previousChangelogStream.on('end', () => {
            mergedCompleteChangelog
                .pipe(createWriteStream(changelogPath))
                .once('error', reject)
                .once('finish', () => resolve(null));
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
