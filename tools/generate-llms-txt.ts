import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { docsGetCategories, DocsStructureCategoryId, DocsStructureItemId } from '../apps/docs/src/app/structure';

const isFileExists = (relativePath: string): boolean => {
    const exists = existsSync(join(process.cwd(), relativePath));

    if (!exists) console.warn(`⚠️ Skipping missing file: ${relativePath}`);

    return exists;
};

const fileName = 'llms.txt';
const timeLabel = 'Runtime';

console.time(timeLabel);

try {
    const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'));

    console.info(`🚀 Generating ${fileName} for ${version} version`);

    const GITHUB_BASE = `https://github.com/koobiq/angular-components/blob/${version}`;

    const SKIP_CATEGORIES = new Set([
        DocsStructureCategoryId.Other,
        DocsStructureCategoryId.Icons,
        DocsStructureCategoryId.CDK
    ]);

    const SKIP_CATEGORY_ITEM = new Set([
        DocsStructureItemId.Typography,
        DocsStructureItemId.DesignTokens,
        DocsStructureItemId.AgGrid,
        DocsStructureItemId.LayoutFlex
    ]);

    let content = '';

    for (const category of docsGetCategories()) {
        content += `## ${category.id}\n\n`;

        if (SKIP_CATEGORIES.has(category.id)) continue;

        if (category.id === DocsStructureCategoryId.Main) {
            for (const item of category.items) {
                if (SKIP_CATEGORY_ITEM.has(item.id)) continue;

                const localPath = `docs/guides/${item.id}.en.md`;

                if (!isFileExists(localPath)) {
                    continue;
                }

                content += `- [${item.id}](${GITHUB_BASE}/${localPath})\n`;
            }

            content += '\n';
        }

        if (category.id === DocsStructureCategoryId.Components) {
            for (const item of category.items) {
                if (SKIP_CATEGORY_ITEM.has(item.id)) continue;

                content += `### ${item.id}\n\n`;

                const docLocalPath = `packages/components/${item.apiId}/${item.id}.en.md`;

                if (!isFileExists(docLocalPath)) {
                    continue;
                }

                content += `- [${item.id} component](${GITHUB_BASE}/${docLocalPath})\n`;

                if (item.hasApi) {
                    const apiLocalPath = `tools/public_api_guard/components/${item.apiId}.api.md`;

                    if (isFileExists(apiLocalPath)) {
                        content += `- [${item.id} component api](${GITHUB_BASE}/${apiLocalPath})\n`;
                    }
                }

                if (item.hasExamples) {
                    const exampleLocalPath = `packages/docs-examples/components/${item.apiId}/${item.id}-overview/${item.id}-overview-example.ts`;

                    if (isFileExists(exampleLocalPath)) {
                        content += `- [${item.id} component example](${GITHUB_BASE}/${exampleLocalPath})\n`;
                    }
                }

                content += '\n';
            }
        }
    }

    writeFileSync(join(process.cwd(), 'apps/docs/src', fileName), content);

    console.info(`✅ ${fileName} has been successfully generated!`);
} catch (error) {
    console.info(`❌ Error occurred while generating ${fileName}! Details:\n`, error);
} finally {
    console.timeEnd(timeLabel);
}
