import { readFileSync, writeFileSync } from 'fs';
import { CHANGELOG_FILE_NAME } from '../../packages/cli/src/release/constants';
import { extractReleaseNotes } from '../../packages/cli/src/release/extract-release-notes';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

const changelogFilePath = `./${CHANGELOG_FILE_NAME}`;
const { releaseTitle, releaseNotes } = extractReleaseNotes(changelogFilePath, packageJson.version);

const resultNotes = `# ${releaseTitle}\n\n${releaseNotes}`;

writeFileSync('./CHANGELOG_CURRENT.md', resultNotes, 'utf-8');
console.log('Result Notes: \n', resultNotes);
