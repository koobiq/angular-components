/* tslint:disable:no-var-requires no-magic-numbers */
import { execSync } from 'child_process';
import { outputFileSync } from 'fs-extra';


export function getNPMVersions() {
    const versions = {
        next: {
            version: 'Next',
            url: 'https://next.koobiq.io'
        }
    };

    Object.entries(JSON.parse(execSync('npm view @koobiq/components time --json').toString()))
    .forEach(([version, date]: [string, string]) => {
        if (!/\d\d?.\d\d?.\d\d?$/.test(version)) { return; }

        const majorVersion = version.split('.')[0];

        if (versions[majorVersion] === undefined || new Date(date) > new Date(versions[majorVersion].date)) {
            versions[majorVersion] = {
                version,
                date,
                url: `https://v${majorVersion}.koobiq.io/`
            };
        }
    });

    return versions;
}

if (require.main === module) {
    const version = getNPMVersions();

    outputFileSync('./packages/docs/src/assets/versions.json', JSON.stringify(version, null, 4));
}
