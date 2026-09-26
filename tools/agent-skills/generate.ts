import { spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';
import { DOCS_SEO_DESCRIPTIONS } from '../../apps/docs/src/app/seo-descriptions';
import { DocsStructureCategoryId } from '../../apps/docs/src/app/structure';
import { EXAMPLE_COMPONENTS } from '../../packages/docs-examples/example-module';
import { parseApiReport, renderApiReport } from './api-report';
import {
    AGENT_DOCS_CONSUMER_PATH,
    AGENT_DOCS_DIST_DIR,
    DOCS_SITE_URL,
    PACKAGE_DIST_DIR,
    REPO_ROOT,
    SITE_BUNDLE_DIR,
    SKILL_DIST_DIR,
    SKILL_NAME,
    SKILL_SOURCE_DIR
} from './constants';
import {
    firstSentence,
    InventoryRow,
    MigrationEntry,
    parseTokenNames,
    renderInventory,
    renderMigrations,
    renderTokens
} from './content';
import { pageToMarkdown, ResolvedExample } from './mdx-to-markdown';
import { parseFrontmatter } from './rules';
import { collectSkillItems, readRepoFile, SkillItem } from './sources';

/** First line of a hand-written reference: the documented items whose API it relies on (see check.ts). */
export const COVERS_COMMENT = /^<!--\s*covers:([^>]*)-->\s*\n?/;

const TIME_LABEL = 'agent-skills';

const resolveExample = (id: string): ResolvedExample => {
    const example = EXAMPLE_COMPONENTS[id];

    if (!example) throw new Error(`Unknown example "${id}"`);

    return {
        id,
        title: example.title,
        files: example.files.map((name) => ({
            name,
            content: readRepoFile(`packages/docs-examples/${example.packagePath}/${name}`)
        }))
    };
};

const toMarkdown = (path: string): string =>
    pageToMarkdown(readRepoFile(path), { path, resolveExample, siteUrl: DOCS_SITE_URL });

const renderItemDoc = (skillItem: SkillItem, version: string): string => {
    const { item, categoryId, importPath, entryPoint, apiReport, examplesPage, overviewPage, tokenFiles } = skillItem;
    const url = (locale: string) => `${DOCS_SITE_URL}/${locale}/${categoryId}/${item.id}/overview`;
    const lines = [
        `# ${item.name.en}`,
        '',
        `- Documentation id: \`${item.id}\``,
        `- Package: \`@koobiq/components@${version}\``,
        ...(importPath ? [`- Import from: \`${importPath}\``] : []),
        `- Human-readable page: ${url('en')} (Russian: ${url('ru')})`,
        '',
        '## Overview',
        '',
        toMarkdown(overviewPage)
    ];

    if (examplesPage) lines.push('', '## More examples', '', toMarkdown(examplesPage));

    if (apiReport && entryPoint) {
        lines.push(
            '',
            `## API of \`${importPath}\``,
            '',
            renderApiReport(parseApiReport(readRepoFile(apiReport)), entryPoint)
        );
    }

    const tokens = tokenFiles.flatMap((file) => parseTokenNames(readRepoFile(file)));

    if (tokens.length > 0) lines.push('', '## Design tokens', '', renderTokens(tokens));

    return `${lines.join('\n').trim()}\n`;
};

const inventoryRow = ({ item, importPath }: SkillItem): InventoryRow => ({
    id: item.id,
    name: item.name.en,
    importPath,
    purpose: firstSentence((DOCS_SEO_DESCRIPTIONS as Record<string, { en: string }>)[item.id]?.en ?? '')
});

const collectMigrations = (): MigrationEntry[] => {
    const migrations = JSON.parse(readRepoFile('packages/schematics/src/migrations.json')).schematics as Record<
        string,
        { version: string; description: string }
    >;
    const collection = JSON.parse(readRepoFile('packages/schematics/src/collection.json')).schematics as Record<
        string,
        unknown
    >;

    return Object.entries(migrations).map(([name, { version, description }]) => ({
        name,
        version,
        description,
        runnable: name in collection
    }));
};

const write = (path: string, content: string) => {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
};

const listFiles = (directory: string): string[] =>
    readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);

        return statSync(path).isDirectory() ? listFiles(path) : [path];
    });

/**
 * The skill for agents that install it from the documentation site: `npx skills add https://koobiq.io` reads
 * `/.well-known/agent-skills/index.json` (Agent Skills Discovery v0.2.0) and checks the archive against its digest.
 * The documentation build copies the folder to the site root.
 */
const writeSiteBundle = () => {
    const directory = join(SITE_BUNDLE_DIR, '.well-known/agent-skills');
    const archive = join(directory, `${SKILL_NAME}.tar.gz`);
    const description = parseFrontmatter(readFileSync(join(SKILL_DIST_DIR, 'SKILL.md'), 'utf-8'))?.values.description;

    rmSync(SITE_BUNDLE_DIR, { recursive: true, force: true });
    mkdirSync(directory, { recursive: true });

    // SKILL.md at the root of the archive, as the skills command-line tool expects; no macOS metadata files.
    const { status, stderr } = spawnSync(
        'tar',
        ['-czf', archive, '-C', SKILL_DIST_DIR, ...readdirSync(SKILL_DIST_DIR)],
        {
            encoding: 'utf-8',
            env: { ...process.env, COPYFILE_DISABLE: '1' }
        }
    );

    if (status !== 0) throw new Error(`Could not archive the skill: ${stderr}`);

    const digest = createHash('sha256').update(readFileSync(archive)).digest('hex');
    const index = {
        $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
        skills: [
            { name: SKILL_NAME, type: 'archive', description, url: `${SKILL_NAME}.tar.gz`, digest: `sha256:${digest}` }
        ]
    };

    write(join(directory, 'index.json'), `${JSON.stringify(index, null, 4)}\n`);
};

/**
 * Builds the consumer skill into the package: the skill itself (`skills/koobiq-angular`, copied into consumer
 * repositories) and the references it points to (`agent-docs`, read in place from `node_modules`). Everything
 * is generated from the sources the documentation site uses, so it always matches the version it ships with.
 */
export const generateAgentSkills = () => {
    if (!existsSync(join(PACKAGE_DIST_DIR, 'package.json'))) {
        throw new Error(`${relative(REPO_ROOT, PACKAGE_DIST_DIR)} is missing: run "yarn run build:components" first`);
    }

    const { version, requiredAngularVersion } = JSON.parse(readRepoFile('package.json'));
    const items = collectSkillItems();

    rmSync(SKILL_DIST_DIR, { recursive: true, force: true });
    rmSync(AGENT_DOCS_DIST_DIR, { recursive: true, force: true });

    for (const skillItem of items) {
        write(join(AGENT_DOCS_DIST_DIR, skillItem.docPath), renderItemDoc(skillItem, version));
    }

    write(join(AGENT_DOCS_DIST_DIR, 'migrations.md'), `${renderMigrations(collectMigrations(), version)}\n`);

    const inventory = (categoryId: DocsStructureCategoryId) =>
        renderInventory(items.filter((item) => item.categoryId === categoryId).map(inventoryRow));

    write(
        join(AGENT_DOCS_DIST_DIR, 'README.md'),
        [
            `# Koobiq references for agents (@koobiq/components ${version})`,
            '',
            `Generated from the documentation of this exact version. Each file holds the overview, the full source of its examples, the public API and the design tokens. Read \`${AGENT_DOCS_CONSUMER_PATH}/<folder>/<id>.md\`.`,
            '',
            '## Guides (`guides/`)',
            '',
            inventory(DocsStructureCategoryId.Main),
            '',
            '## Components (`components/`)',
            '',
            inventory(DocsStructureCategoryId.Components),
            '',
            '## Formatters, forms and validation (`other/`)',
            '',
            inventory(DocsStructureCategoryId.Other),
            '',
            '## Migrations',
            '',
            '`migrations.md` lists the `ng update` migrations of every version.',
            ''
        ].join('\n')
    );

    const fill = (content: string): string =>
        content
            .replace(COVERS_COMMENT, '')
            .replaceAll('{{VERSION}}', version)
            .replaceAll('{{NG_VERSION}}', requiredAngularVersion)
            .replace('{{COMPONENTS}}', inventory(DocsStructureCategoryId.Components))
            .replace('{{OTHER}}', inventory(DocsStructureCategoryId.Other))
            .replace('{{GUIDES}}', inventory(DocsStructureCategoryId.Main));

    for (const source of listFiles(SKILL_SOURCE_DIR)) {
        write(
            join(SKILL_DIST_DIR, relative(SKILL_SOURCE_DIR, source)),
            fill(readRepoFile(relative(REPO_ROOT, source)))
        );
    }

    writeSiteBundle();

    const size = (directory: string) => listFiles(directory).reduce((total, file) => total + statSync(file).size, 0);

    console.info(
        `✅ ${relative(REPO_ROOT, SKILL_DIST_DIR)}: ${listFiles(SKILL_DIST_DIR).length} files, ${Math.round(size(SKILL_DIST_DIR) / 1024)} KB`
    );
    console.info(
        `✅ ${relative(REPO_ROOT, AGENT_DOCS_DIST_DIR)}: ${items.length} references, ${Math.round(size(AGENT_DOCS_DIST_DIR) / 1024)} KB`
    );
};

if (require.main === module) {
    console.time(TIME_LABEL);

    try {
        generateAgentSkills();
    } catch (error) {
        console.error(`❌ ${error instanceof Error ? error.message : error}`);
        process.exitCode = 1;
    } finally {
        console.timeEnd(TIME_LABEL);
    }
}
