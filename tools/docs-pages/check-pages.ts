/**
 * Fails on what the build of the pages lets through: a difference between the English and the Russian version of a
 * page, which leaves one language behind unnoticed, and a link to a heading that is not there. Needs no build.
 */
import { readFileSync } from 'fs';
import { docsGetPagePaths } from '../../apps/docs/src/app/page-paths';
import { parsePage } from './compile-page';
import { findLocaleProblems } from './locale-parity';
import { findBrokenAnchors } from './page-links';
import { findPageSources, parsePageSource } from './sources';

const pages = findPageSources().map((path) => ({
    path,
    url: parsePageSource(path).url,
    root: parsePage(readFileSync(path, 'utf-8'), path)
}));
const sitePaths = new Set(docsGetPagePaths().map(({ path }) => path));
const problems = [...findLocaleProblems(pages), ...findBrokenAnchors(pages, sitePaths)];

if (problems.length) {
    console.error(problems.join('\n'));
    console.error(
        `\n${problems.length} problem(s). Both languages of a page show the same blocks in the same order, and a link to a heading names the id it has.`
    );
    process.exitCode = 1;
} else {
    console.log(
        `The ${pages.length} pages match their other language, and the links to their headings lead somewhere.`
    );
}
