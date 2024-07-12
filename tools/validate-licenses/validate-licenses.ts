import * as path from 'node:path';

import checker from 'license-checker';
import spdxSatisfies from 'spdx-satisfies';

type License = string;
type PackageID = string;

// List of licenses considered valid and acceptable for use.
const licensesWhitelist: License[] = [
    // Regular valid open source licenses.
    'MIT',
    'MIT-0',
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
const licenseReplacements: { [key: string]: License } = {
    // Official SPDX identifier has a dash
    'Apache 2.0': 'Apache-2.0',

    // BSD is BSD-2-clause by default.
    BSD: 'BSD-2-Clause'
};

// Normalizes the license string to a standard SPDX identifier, handling possible asterisks from guessed licenses.
const ignoredPackages: PackageID[] = [
    // Custom
    'deep-freeze@0.0.1',

    // ISC License https://github.com/eemeli/make-plural/blob/main/LICENSE
    'make-plural@7.3.0',

    // https://github.com/soldair/node-gitconfiglocal?tab=BSD-3-Clause-1-ov-file
    'gitconfiglocal@1.0.0',

    // https://github.com/streetsidesoftware/cspell-dicts/blob/main/dictionaries/en-common-misspellings/LICENSE
    '@cspell/dict-en-common-misspellings@2.0.2',
];

// Normalizes the license string to a standard SPDX identifier, handling possible asterisks from guessed licenses.
function normalizeLicense(license: string | undefined): License[] {
    if (typeof license === 'string') {
        let normalized = licenseReplacements[license] || license.replace(/\*$/, '');
        return [normalized];
    }
    return [];
}

// Checks if the license string satisfies one of the accepted licenses using the SPDX specification.
function isLicenseValid(licenses: License[]): boolean {
    const licenseExpression = licenses.join(' AND ');
    try {
        return spdxSatisfies(licenseExpression, licensesWhitelist.join(' OR '));
    } catch (error) {
        console.error(`Error validating licenses '${licenseExpression}': ${error}`);
        return false;
    }
}

const enum ReturnCode {
    Success = 0,
    Error = 1,
    InvalidLicense = 2
}

// Main function that initializes the license checker and processes the results.
async function validateLicense(): Promise<ReturnCode> {
    try {
        const json = await new Promise<any>((resolve, reject) => {
            checker.init({ start: path.join(__dirname, '../../'), excludePrivatePackages: true }, (err, result) =>
                err ? reject(err) : resolve(result)
            );
        });

        const packages = Object.keys(json);
        console.log(`Testing ${packages.length} packages.\n`);

        // Filters out packages with invalid or unaccepted licenses.
        const badLicensePackages = packages
            .map((key) => ({
                id: key,
                licenses: Array.isArray(json[key].licenses)
                    ? json[key].licenses.map(normalizeLicense)
                    : [normalizeLicense(json[key].licenses)]
            }))
            .filter((pkg) => !ignoredPackages.includes(pkg.id))
            .filter((pkg) => !isLicenseValid(pkg.licenses));

        if (badLicensePackages.length > 0) {
            console.error('Invalid package licenses found:\n');
            badLicensePackages.forEach((pkg) => {
                console.error(`▪ ${pkg.id}: ${JSON.stringify(pkg.licenses)}`);
            });

            console.error(`\n${badLicensePackages.length} total packages with invalid licenses.`);
            return ReturnCode.InvalidLicense;
        }

        console.log('All package licenses are valid.');
        return ReturnCode.Success;
    } catch (error) {
        console.error(`Something happened:\n${error.message}`);
        return ReturnCode.Error;
    }
}

if (require.main === module) {
    validateLicense().then((code) => process.exit(code));
}
