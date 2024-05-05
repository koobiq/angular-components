import * as path from 'node:path';

import checker from 'license-checker';
import spdxSatisfies from 'spdx-satisfies';

/* tslint:disable:object-literal-key-quotes */
/* tslint:disable:no-console */
const licensesWhitelist = [
    // Regular valid open source licenses.
    'MIT',
    'ISC',
    'Apache-2.0',
    'BlueOak-1.0.0',

    'BSD-2-Clause',
    'BSD-3-Clause',
    'BSD-4-Clause',

    // All CC-BY licenses have a full copyright grant and attribution section.
    'CC-BY-3.0',
    'CC-BY-4.0',

    'GPL-3.0',
    'Python-2.0',

    // Have a full copyright grant. Validated by opensource team.
    'Unlicense',
    '0BSD',
    'CC0-1.0'
];

// Name variations of SPDX licenses that some packages have.
// Licenses not included in SPDX but accepted will be converted to MIT.
const licenseReplacements: { [key: string]: string } = {
    // Official SPDX identifier has a dash
    'Apache 2.0': 'Apache-2.0',

    // BSD is BSD-2-clause by default.
    BSD: 'BSD-2-Clause'
};

const ignoredPackages = [
    // Custom
    'deep-freeze@0.0.1',

    // ISC License https://github.com/eemeli/make-plural/blob/main/LICENSE
    'make-plural@7.3.0'
];

// Check if a license is accepted by an array of accepted licenses
function passesSpdx(licenses: string[], accepted: string[]) {
    try {
        return spdxSatisfies(licenses.join(' AND '), accepted.join(' OR '));
    } catch (_) {
        return false;
    }
}

const enum ReturnCode {
    Success = 0,
    Error = 1,
    INVALID_LIC = 2
}

export function validateLicense(): Promise<number> {
    return new Promise<number>((resolve) => {
        checker.init(
            { start: path.join(__dirname, '../../'), excludePrivatePackages: true },
            (err: Error, json: any) => {
                if (err) {
                    console.error(`Something happened:\n${err.message}`);
                    resolve(ReturnCode.Error);
                    process.exit(ReturnCode.Error);
                } else {
                    console.log(`Testing ${Object.keys(json).length} packages.\n`);

                    const badLicensePackages = Object.keys(json)
                        .map((key) => ({
                            id: key,
                            licenses: ([] as string[])
                                /* tslint:disable:no-non-null-assertion */
                                .concat(json[key].licenses as string[])
                                // `*` is used when the license is guessed.
                                .map((x) => x.replace(/\*$/, ''))
                                .map((x) => (x in licenseReplacements ? licenseReplacements[x] : x))
                        }))
                        .filter((pkg) => !passesSpdx(pkg.licenses, licensesWhitelist))
                        .filter((pkg) => !ignoredPackages.find((ignored) => ignored === pkg.id));

                    // Report packages with bad licenses
                    if (badLicensePackages.length > 0) {
                        console.error('Invalid package licences found: \n');

                        badLicensePackages.forEach((pkg) => {
                            console.error(`▪ ${pkg.id}: ${JSON.stringify(pkg.licenses)}`);
                        });

                        console.error(`\n${badLicensePackages.length} total packages with invalid licenses.`);
                        resolve(ReturnCode.INVALID_LIC);
                        process.exit(ReturnCode.INVALID_LIC);
                    } else {
                        console.log('All package licenses are valid.');
                        resolve(ReturnCode.Success);
                        process.exit(ReturnCode.Success);
                    }
                }
            }
        );
    });
}

if (require.main === module) {
    validateLicense();
}
