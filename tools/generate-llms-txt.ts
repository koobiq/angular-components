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

    const MAIN_CATEGORY_ITEM_OVERRIDES: Partial<
        Record<
            DocsStructureItemId,
            Partial<{
                skip: boolean;
                overviewPath: string;
            }>
        >
    > = {
        [DocsStructureItemId.Typography]: {
            overviewPath: `packages/components/core/styles/typography/typography.en.md`
        },
        [DocsStructureItemId.DesignTokens]: {
            skip: true
        }
    };

    const COMPONENT_OVERRIDES: Partial<
        Record<
            DocsStructureItemId,
            Partial<{
                skip: boolean;
                overviewPath: string;
                examplePath: string;
            }>
        >
    > = {
        [DocsStructureItemId.LayoutFlex]: { skip: true },
        [DocsStructureItemId.AgGrid]: {
            overviewPath: `docs/data-grid/ag-grid/ag-grid.en.md`,
            examplePath: `packages/docs-examples/components/ag-grid/ag-grid-overview/ag-grid-overview-example.ts`
        },
        [DocsStructureItemId.Icon]: { examplePath: '' },
        [DocsStructureItemId.Core]: { examplePath: '' }
    };

    let content = '# Koobiq Angular\n\n';

    for (const category of docsGetCategories()) {
        if (
            category.id === DocsStructureCategoryId.Other ||
            category.id === DocsStructureCategoryId.Icons ||
            category.id === DocsStructureCategoryId.CDK
        ) {
            continue;
        }

        content += `## ${category.id}\n\n`;

        if (category.id === DocsStructureCategoryId.Main) {
            for (const item of category.items) {
                const override = MAIN_CATEGORY_ITEM_OVERRIDES[item.id];

                if (override?.skip) continue;

                const localPath = override?.overviewPath ?? `docs/guides/${item.id}.en.md`;

                if (!isFileExists(localPath)) continue;

                content += `- [${item.id}](${GITHUB_BASE}/${localPath})\n`;
            }

            content += '\n';
        }

        if (category.id === DocsStructureCategoryId.Components) {
            for (const item of category.items) {
                const override = COMPONENT_OVERRIDES[item.id];

                if (override?.skip) continue;

                content += `### ${item.id}\n\n`;

                const overviewPath = override?.overviewPath ?? `packages/components/${item.apiId}/${item.id}.en.md`;

                if (isFileExists(overviewPath)) content += `- [overview](${GITHUB_BASE}/${overviewPath})\n`;

                if (item.hasApi) {
                    const apiPath = `tools/public_api_guard/components/${item.apiId}.api.md`;

                    if (isFileExists(apiPath)) content += `- [api](${GITHUB_BASE}/${apiPath})\n`;
                }

                const examplePath =
                    override?.examplePath ??
                    `packages/docs-examples/components/${item.apiId}/${item.id}-overview/${item.id}-overview-example.ts`;

                if (isFileExists(examplePath)) content += `- [example](${GITHUB_BASE}/${examplePath})\n`;

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
