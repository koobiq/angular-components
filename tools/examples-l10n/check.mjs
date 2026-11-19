#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const componentsDir = fileURLToPath(new URL('../../packages/docs-examples/components', import.meta.url));
const missing = [];

const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);

        if (entry.isDirectory()) {
            walk(path);
        } else if (entry.isFile() && entry.name.endsWith('-example.ts')) {
            if (!existsSync(join(dir, 'l10n.ts'))) {
                missing.push(relative(componentsDir, dir));
            }

            break;
        }
    }
};

walk(componentsDir);

if (missing.length > 0) {
    console.error(`Every docs example must have an l10n.ts next to it. Missing in ${missing.length} example(s):`);

    for (const dir of missing.sort()) {
        console.error(`  ${dir}`);
    }

    process.exit(1);
}

console.log('Every docs example has an l10n.ts.');
