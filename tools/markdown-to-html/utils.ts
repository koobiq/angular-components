import chalk from 'chalk';
import { access, mkdir, readFile, writeFile } from 'fs/promises';
import { GlobSync } from 'glob';
import { basename, join } from 'path';
import { configureMarkedGlobally } from './marked/configuration';
import { DocsMarkdownRenderer } from './marked/docs-marked-renderer';

// Regular expression that matches the markdown extension of a given path.
const markdownExtension = /.md$/;

// Custom markdown renderer for transforming markdown files for the docs.
const markdownRenderer = new DocsMarkdownRenderer();

// Setup custom marked instance.
const marked = configureMarkedGlobally(markdownRenderer);

export const src = (path: string | string[]): string[] => {
    let res: string[] = [];
    if (Array.isArray(path)) {
        res = path.reduce((result, curPath) => {
            const files = new GlobSync(curPath).found;
            result.push(...files);
            return result;
        }, [] as string[]);
    } else if (typeof path === 'string') {
        res = new GlobSync(path).found;
    }

    return res;
};

export const createDirIfNotExists = (dir: string) =>
    access(dir)
        .then(() => undefined)
        .catch(() => mkdir(dir, { recursive: true }));

export const docTask = (taskId: string, { source, dest }: { source: string | string[]; dest: string }) => {
    return async () => {
        console.log(`Starting ${chalk.blue(taskId)}...`);
        await createDirIfNotExists(dest);

        const promises = src(source).map(async (inputPath: string) => {
            const outputPath = join(dest, basename(inputPath).replace(markdownExtension, '.html'));
            const mdContent = await readFile(inputPath, 'utf8');
            const htmlOutput = markdownRenderer.finalizeOutput(marked.parse(mdContent) as string);

            return await writeFile(outputPath, htmlOutput);
        });

        const res = await Promise.all(promises);
        console.log(chalk.green(`Finished ${chalk.bold.green(taskId)}!`));
        console.log(chalk.green('------------------------------------------------------------------------------'));
        return res;
    };
};
