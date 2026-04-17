import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { docsGetCategories, DocsStructureCategoryId, DocsStructureItemId } from '../apps/docs/src/app/structure';

const isFileExists = (relativePath: string): boolean => {
    const exists = existsSync(join(process.cwd(), relativePath));

    if (!exists) console.warn(`⚠️ Skipping missing file: ${relativePath}`);

    return exists;
};

const readFileContent = (relativePath: string): string => readFileSync(join(process.cwd(), relativePath), 'utf-8');

const FILE_NAME = 'llms.txt';
const FILE_NAME_FULL = 'llms-full.txt';
const TIME_LABEL = 'Runtime';

console.time(TIME_LABEL);

try {
    const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'));

    console.info(`🚀 Generating ${FILE_NAME} / ${FILE_NAME_FULL} for ${version} version`);

    const GITHUB_RAW_CONTENT_URL = `https://raw.githubusercontent.com/koobiq/angular-components/refs/tags/${version}`;

    const ITEM_OVERRIDES: Partial<
        Record<
            DocsStructureItemId,
            Partial<{
                skip: boolean;
                overviewPath: string;
                examplePath: string;
            }>
        >
    > = {
        [DocsStructureItemId.Typography]: {
            overviewPath: `packages/components/core/styles/typography/typography.en.md`
        },
        [DocsStructureItemId.DesignTokens]: {
            skip: true
        },
        [DocsStructureItemId.LayoutFlex]: { skip: true },
        [DocsStructureItemId.AgGrid]: {
            overviewPath: `docs/data-grid/ag-grid/ag-grid.en.md`,
            examplePath: `packages/docs-examples/components/ag-grid/ag-grid-overview/ag-grid-overview-example.ts`
        },
        [DocsStructureItemId.Icon]: { examplePath: '' },
        [DocsStructureItemId.Core]: { examplePath: '' }
    };

    let content = `<!-- This file is auto-generated. Do not edit it manually! -->

# Koobiq Angular

> Koobiq is an open-source design system for designers and developers, focused on designing products related to **information security**.

`;

    let contentFull = content;

    for (const category of docsGetCategories()) {
        if (
            category.id === DocsStructureCategoryId.Other ||
            category.id === DocsStructureCategoryId.Icons ||
            category.id === DocsStructureCategoryId.CDK
        ) {
            continue;
        }

        content += `## ${category.id}\n\n`;
        contentFull += `## ${category.id}\n\n`;

        if (category.id === DocsStructureCategoryId.Main) {
            for (const item of category.items) {
                const override = ITEM_OVERRIDES[item.id];

                if (override?.skip) continue;

                const path = override?.overviewPath ?? `docs/guides/${item.id}.en.md`;

                if (path !== '' && !isFileExists(path)) continue;

                content += `- [${item.id}](${GITHUB_RAW_CONTENT_URL}/${path})\n`;

                contentFull += `### ${item.id}\n\n`;
                contentFull += `${readFileContent(path)}\n`;
            }

            content += '\n';
            contentFull += '\n';
        }

        if (category.id === DocsStructureCategoryId.Components) {
            for (const item of category.items) {
                const override = ITEM_OVERRIDES[item.id];

                if (override?.skip) continue;

                content += `### ${item.id}\n\n`;
                contentFull += `### ${item.id}\n\n`;

                const overviewPath = override?.overviewPath ?? `packages/components/${item.apiId}/${item.id}.en.md`;

                if (overviewPath !== '' && isFileExists(overviewPath)) {
                    content += `- [overview](${GITHUB_RAW_CONTENT_URL}/${overviewPath})\n`;

                    contentFull += `#### overview\n\n`;
                    contentFull += `${readFileContent(overviewPath)}\n`;
                }

                if (item.hasApi) {
                    const apiPath = `tools/public_api_guard/components/${item.apiId}.api.md`;

                    if (isFileExists(apiPath)) {
                        content += `- [api](${GITHUB_RAW_CONTENT_URL}/${apiPath})\n`;

                        contentFull += `#### api\n\n`;
                        contentFull += `${readFileContent(apiPath)}\n`;
                    }
                }

                const examplePath =
                    override?.examplePath ??
                    `packages/docs-examples/components/${item.apiId}/${item.id}-overview/${item.id}-overview-example.ts`;

                if (examplePath !== '' && isFileExists(examplePath)) {
                    content += `- [example](${GITHUB_RAW_CONTENT_URL}/${examplePath})\n`;

                    contentFull += `#### example\n\n`;
                    contentFull += `\`\`\`typescript\n${readFileContent(examplePath)}\n\`\`\`\n`;
                }

                content += '\n';
                contentFull += '\n';
            }
        }
    }

    writeFileSync(join(process.cwd(), 'apps/docs/src', FILE_NAME), content.trimEnd() + '\n');
    console.info(`✅ ${FILE_NAME} has been successfully generated!`);

    writeFileSync(join(process.cwd(), 'apps/docs/src', FILE_NAME_FULL), contentFull.trimEnd() + '\n');
    console.info(`✅ ${FILE_NAME_FULL} has been successfully generated!`);
} catch (error) {
    console.info(`❌ Error occurred while generating ${FILE_NAME} / ${FILE_NAME_FULL}! Details:\n`, error);
} finally {
    console.timeEnd(TIME_LABEL);
}
