/**
 * Compiles the MDX pages, starts the docs dev server and recompiles the pages on every save.
 * One process rather than `watcher & ng serve`: npm runs scripts with cmd.exe on Windows, where `&` is sequential.
 */
import { spawn } from 'child_process';
import { watch } from 'fs';
import { join } from 'path';
import { compileDocsPages } from './generate-docs-pages';

if (!compileDocsPages()) process.exit(1);

// One save arrives as several events, and a run compiles every page, so the runs are collapsed into one.
let pending: NodeJS.Timeout | undefined;

const scheduleCompile = (path: string): void => {
    console.log(`${path} changed`);
    clearTimeout(pending);
    pending = setTimeout(compileDocsPages, 50);
};

// The example catalogue is read once: restart after adding an example.
for (const directory of ['packages/components', 'docs']) {
    watch(directory, { recursive: true }, (_event, fileName) => {
        if (fileName?.endsWith('.mdx')) {
            scheduleCompile(join(directory, fileName));
        }
    });
}

spawn('ng serve --configuration=development koobiq-docs', { shell: true, stdio: 'inherit' }).on('exit', (code) =>
    process.exit(code ?? 1)
);
