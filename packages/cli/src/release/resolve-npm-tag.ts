import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolveNpmDistTag } from './npm/resolve-publish-tag';
import { parseVersionName } from './version-name/parse-version';

const { red, italic } = chalk;

export interface IResolveNpmTagConfig {
    projectDir: string;
    /** npm package name to check the currently published `latest` against. */
    packageName?: string;
}

/**
 * Standalone command wrapping `resolveNpmDistTag` so any koobiq repo's CI can resolve the
 * correct npm dist-tag (`latest` vs `v<major>-lts`) without reimplementing the semver-against-
 * registry comparison itself. Prints only the resolved tag to stdout, so callers can do
 * `TAG=$(koobiq-cli resolve-npm-tag --package-name @koobiq/icons)`.
 */
export class ResolveNpmTagTask {
    constructor(private readonly config: IResolveNpmTagConfig) {}

    run() {
        const { projectDir, packageName } = this.config;

        if (!packageName) {
            console.error(red('  ✘   --package-name is required.'));
            process.exit(1);
        }

        const versionString = this.readVersionFromPackageJson(projectDir);
        const version = parseVersionName(versionString);

        if (!version) {
            console.error(red(`  ✘   Cannot parse "${versionString}" as a Semver version.`));
            process.exit(1);
        }

        console.log(resolveNpmDistTag(packageName, version));
    }

    private readVersionFromPackageJson(projectDir: string): string {
        const packageJsonPath = join(projectDir, 'package.json');

        let packageJson: { version?: string };

        try {
            packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        } catch {
            console.error(red(`  ✘   Could not read ${italic(packageJsonPath)}.`));
            process.exit(1);
        }

        if (!packageJson.version) {
            console.error(red(`  ✘   No "version" field found in ${italic(packageJsonPath)}.`));
            process.exit(1);
        }

        return packageJson.version;
    }
}
