import { execSync } from 'child_process';
import { outputFileSync } from 'fs-extra';

type VersionInfo = {
    version: string;
    date?: string;
    url: string;
};

type Versions = {
    [key: string]: VersionInfo;
};

function getNPMVersions(): Versions {
    const versions = {
        next: {
            version: 'Next',
            url: 'https://next.koobiq.io',
        },
    };

    // Regular expression to match versions like x.y.z, x.y.z-rc.n, x.y.z-beta.n, etc.
    const versionRegex = /^\d+\.\d+\.\d+(-[a-z]+\.\d+)?$/;

    const npmViewOutput = execSync('npm view @koobiq/components time --json').toString();
    const npmVersions: { [version: string]: string } = JSON.parse(npmViewOutput);

    Object.entries(npmVersions).forEach(([version, date]) => {
        if (!versionRegex.test(version)) {
            return;
        }

        const majorVersion = version.split('.')[0];

        const releaseDate = new Date(date);
        if (isNaN(releaseDate.getTime())) {
            console.warn(`Invalid date for version ${version}: ${date}`);
            return;
        }

        if (
            !versions[majorVersion] ||
            !versions[majorVersion].date ||
            releaseDate > new Date(versions[majorVersion].date!)
        ) {
            versions[majorVersion] = {
                version,
                date,
                url: `https://v${majorVersion}.koobiq.io/`,
            };
        }
    });

    return versions;
}

if (require.main === module) {
    const versions = getNPMVersions();
    const outputPath = './apps/docs/src/assets/versions.json';

    outputFileSync(outputPath, JSON.stringify(versions, null, 4));
    console.log(`Version information written to ${outputPath}`);
}
