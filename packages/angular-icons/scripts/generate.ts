import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SVG_SOURCE_DIR = 'node_modules/@koobiq/icons/svg';
const OUTPUT_DIR = path.resolve(__dirname, '../icons');
const PUBLIC_API_PATH = path.resolve(__dirname, '../public-api.ts');

const componentTemplate = ({
    attrSelector,
    escapedInner,
    className,
    viewBox,
    width,
    height
}) => `import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    standalone: true,
    selector: 'svg[${attrSelector}]',
    template: \`${escapedInner}\`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '${viewBox}',
        width: '${width}',
        height: '${height}'
    }
})
export class ${className} extends KbqSvgIcon {}
`;

/** plus_16 → plus-16 */
function toKebab(name: string): string {
    return name.replace(/_/g, '-');
}

/** plus-16 → Plus16 */
function toPascalCase(kebab: string): string {
    return kebab
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
}

function extractSvgParts(svg: string): { viewBox: string; width: string; height: string; inner: string } {
    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 16 16';
    const width = svg.match(/\bwidth="([^"]+)"/)?.[1] ?? '16';
    const height = svg.match(/\bheight="([^"]+)"/)?.[1] ?? width;
    const inner = svg
        .replace(/^[\s\S]*?<svg[^>]*>/, '')
        .replace(/<\/svg>[\s\S]*$/, '')
        .trim();

    return { viewBox, width, height, inner };
}

function addSvgNamespace(inner: string): string {
    return inner.replace(/<([a-zA-Z])/g, '<svg:$1').replace(/<\/([a-zA-Z])/g, '</svg:$1');
}

function generateComponent(filename: string, svgContent: string): string {
    const name = filename.replace('.svg', '');
    const kebab = toKebab(name);
    const pascal = toPascalCase(kebab);

    const className = `Kbq${pascal}`;
    const attrSelector = `kbq${pascal}`;

    const { viewBox, width, height, inner } = extractSvgParts(svgContent);
    const escapedInner = addSvgNamespace(inner).replace(/`/g, '\\`').replace(/\$/g, '\\$');

    return componentTemplate({ attrSelector, escapedInner, className, viewBox, width, height });
}

function run(): void {
    const files = fs
        .readdirSync(SVG_SOURCE_DIR)
        .filter((f) => f.endsWith('.svg'))
        .sort();

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Clear existing generated files
    for (const f of fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith('.ts'))) {
        fs.unlinkSync(path.join(OUTPUT_DIR, f));
    }

    const iconExports: string[] = [];

    for (const file of files) {
        if (!file.endsWith('.svg')) continue;

        const svgContent = fs.readFileSync(path.join(SVG_SOURCE_DIR, file), 'utf-8');
        const name = file.replace('.svg', '');
        const kebab = toKebab(name);
        const outputFile = `${kebab}.ts`;

        fs.writeFileSync(path.join(OUTPUT_DIR, outputFile), generateComponent(file, svgContent), 'utf-8');
        iconExports.push(`export * from './icons/${kebab}';`);
    }

    const publicApi = `export * from './svg-icon';\n${iconExports.join('\n')}\n`;

    fs.writeFileSync(PUBLIC_API_PATH, publicApi, 'utf-8');

    const eslintBin = path.resolve(__dirname, '../../../node_modules/.bin/eslint');

    execSync(`"${eslintBin}" --fix "${OUTPUT_DIR}/**/*.ts" "${PUBLIC_API_PATH}"`, {
        cwd: path.resolve(__dirname, '../../..'),
        stdio: 'inherit'
    });
}

run();
