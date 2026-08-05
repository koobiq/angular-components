import { BuilderContext, BuilderOutput, Target } from '@angular-devkit/architect';
import { Schema } from '@angular/cli/lib/config/workspace-schema';
// chalk 5+ is an ES module: the colour helpers are properties of the default export, not
// named exports.
import chalk from 'chalk';
import { execSync } from 'child_process';
import { promises as fs, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { IPackagerOptions } from './schema';

const { green } = chalk;

const isCI = !!process.env.CI;
const packageVersionFilePath = './packages/components/core/version.ts';

export async function packager(options: IPackagerOptions, context: BuilderContext): Promise<BuilderOutput> {
    const project = context.target !== undefined ? context.target.project : '';

    context.logger.info(`📦 Packaging ${project}...`);

    const target: Target = {
        target: options.buildTarget,
        project
    };

    if (isCI) await fillKoobiqVersion(project);

    let ngPackagrBuilderOptions: { project: string };

    try {
        ngPackagrBuilderOptions = (await context.getTargetOptions(target)) as unknown as any;

        if (ngPackagrBuilderOptions.project === undefined) {
            throw new Error('❌ Build target does not exist in angular.json');
        }
    } catch (err) {
        context.logger.error(err);

        return {
            error: err,
            success: false
        };
    }

    try {
        context.logger.info('📖 angular.json file...');
        const angularJson = await tryJsonParse<Schema>(join(context.workspaceRoot, 'angular.json'));

        // get the package json
        context.logger.info('📖 package.json file...');
        const packageJson = await tryJsonParse<IPackageJson>(join(context.workspaceRoot, 'package.json'));

        const projectRoot = angularJson.projects && angularJson.projects[project] && angularJson.projects[project].root;

        if (!projectRoot) {
            context.logger.error(
                `❌ Could not find a root folder for the project ${project} in your angular.json file`
            );

            return { success: false };
        }

        const ngPackagrConfigPath = join(context.workspaceRoot, ngPackagrBuilderOptions.project);

        const ngPackagrConfig = await tryJsonParse<INgPackagerJson>(ngPackagrConfigPath);

        const libraryDestination = resolve(dirname(ngPackagrConfigPath), ngPackagrConfig.dest);

        const build = await context.scheduleTarget(target);

        const buildResult = await build.result;

        if (buildResult.error) {
            console.error(buildResult.error);
        }

        const releasePackageJsonPath = join(libraryDestination, 'package.json');
        let releasePackageJson = await tryJsonParse<IPackageJson>(releasePackageJsonPath);

        context.logger.info('Syncing Koobiq components version for releasing...');
        releasePackageJson = syncComponentsVersion(
            releasePackageJson,
            packageJson,
            options.versionPlaceholder,
            context
        );

        context.logger.info('Syncing Angular dependency versions for releasing...');
        releasePackageJson = syncNgVersion(releasePackageJson, packageJson, options.ngVersionPlaceholder, context);

        assertNoPlaceholders(releasePackageJson, releasePackageJsonPath);

        writeFileSync(join(libraryDestination, 'package.json'), JSON.stringify(releasePackageJson, null, 4), {
            encoding: 'utf-8'
        });
        context.logger.info(green('Replaced all version placeholders in package.json file!'));

        for (const additionalTargetName of options.additionalTargets) {
            context.logger.info(`Running additional target: ${additionalTargetName}`);

            const additionalTargetBuild = await context.scheduleTarget(parseAdditionalTargets(additionalTargetName));

            const additionalTargetBuildResult = await additionalTargetBuild.result;

            if (!additionalTargetBuildResult.success) {
                throw new Error(`Running target '${additionalTargetName}' failed!`);
            }
        }

        context.logger.info(green('------------------------------------------------------------------------------'));
        context.logger.info(green('Packaging done!'));

        return { success: buildResult.success };
    } catch (error) {
        context.logger.error(error);
    }

    return {
        error: 'Package failed',
        success: false
    };
}

interface INgPackagerJson {
    dest: string;
}

interface IPackageJson {
    version?: string;
    requiredAngularVersion: string;
    peerDependencies?: {
        [key: string]: string;
    };
    dependencies?: {
        [key: string]: string;
    };
}

function syncComponentsVersion(
    releaseJson: IPackageJson,
    rootPackageJson: IPackageJson,
    placeholder: string,
    context: BuilderContext
): IPackageJson {
    const newPackageJson = { ...releaseJson };

    if (rootPackageJson.version && (!newPackageJson.version || newPackageJson.version.trim() === placeholder)) {
        newPackageJson.version = rootPackageJson.version;

        for (const [key, value] of Object.entries(releaseJson.peerDependencies!)) {
            if (value.includes(placeholder)) {
                // Substitute rather than overwrite, so the source manifest controls the shape of the
                // range: `^{{VERSION}}` must publish as `^1.2.3`, not as the exact pin `1.2.3`.
                // Exact-pinning our own packages to each other makes them mutually unsatisfiable as
                // soon as their versions drift apart.
                const range = value.replace(placeholder, newPackageJson.version!);

                context.logger.info(`${key}: ${range}`);
                newPackageJson.peerDependencies![key] = range;
            }
        }
    }

    return newPackageJson;
}

function syncNgVersion(
    releaseJson: IPackageJson,
    rootPackageJson: IPackageJson,
    placeholder: string,
    context: BuilderContext
): IPackageJson {
    const updatedJson = { ...releaseJson };

    for (const [key, value] of Object.entries(releaseJson.peerDependencies!)) {
        if (value.includes(placeholder)) {
            const range = value.replace(placeholder, rootPackageJson.requiredAngularVersion);

            context.logger.info(`${key}: ${range}`);
            updatedJson.peerDependencies![key] = range;
        }
    }

    return updatedJson;
}

/**
 * Fails the build if any `{{...}}` placeholder survived substitution.
 *
 * `syncComponentsVersion` only rewrites peers when the package version itself is still a
 * placeholder, so a change in ng-packagr's output could silently leave `{{VERSION}}` in a
 * published `peerDependencies` — an unsatisfiable range that breaks `npm install` for every
 * consumer. Yarn's node-modules linker tolerates it in-repo, so nothing else would notice.
 */
function assertNoPlaceholders(releaseJson: IPackageJson, packageJsonPath: string) {
    const leaked = Object.entries(releaseJson.peerDependencies || {})
        .concat(Object.entries(releaseJson.dependencies || {}))
        .filter(([, value]) => value.includes('{{'))
        .map(([key, value]) => `${key}: ${value}`);

    if (releaseJson.version?.includes('{{')) {
        leaked.unshift(`version: ${releaseJson.version}`);
    }

    if (leaked.length > 0) {
        throw new Error(
            `❌ Unresolved version placeholders in ${packageJsonPath}:\n  ${leaked.join('\n  ')}\n` +
                'Publishing this would produce an unsatisfiable dependency range.'
        );
    }
}

async function tryJsonParse<T>(path: string): Promise<T> {
    try {
        return JSON.parse(await fs.readFile(path, { encoding: 'utf-8' }));
    } catch {
        throw new Error(`Error while parsing json file at ${path}`);
    }
}

function parseAdditionalTargets(targetRef: string): { target: string; project: string } {
    const [project, target] = targetRef.split(':');

    return { project, target };
}

async function fillKoobiqVersion(project: string) {
    if (project !== 'components') {
        return;
    }

    const commit = execSync('git rev-parse --short HEAD').toString().trim();

    const packageJson = await tryJsonParse<IPackageJson>('package.json');

    const versionFile = await fs.readFile(packageVersionFilePath, { encoding: 'utf-8' });
    const result = versionFile.replace(/{{VERSION}}/g, `${packageJson.version}+sha-${commit}`);

    await fs.writeFile(packageVersionFilePath, result, 'utf8');
}
