#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadCatalog, type Catalog } from './catalog.js';
import {
    toolGetComponent,
    toolGetExample,
    toolGetGuide,
    toolGetIcon,
    toolGetToken,
    toolMigrate,
    toolSearch,
    toolWhichComponent
} from './tools.js';

/**
 * stdio entry point.
 *
 * Local rather than hosted for one reason: the client spawns this process inside the consumer's
 * project, so `cwd` leads to their `node_modules` and every answer can be pinned to the versions
 * that project actually resolved. A hosted server cannot see them — and since the spec deprecated
 * Roots, there is no longer a protocol-level way for one to ask.
 */

const HIT_KINDS = ['entry-point', 'symbol', 'member', 'example', 'icon', 'token', 'guide'] as const;

const text = (body: string) => ({ content: [{ type: 'text' as const, text: body }] });

/**
 * Registered in a fixed order, and the order is load-bearing.
 *
 * `tools/list` is rendered into the prefix of every model request, ahead of the system prompt, so
 * a list whose order varies invalidates the whole prompt cache on each turn and the schemas get
 * billed at full rate instead of the cache-read rate. The 2026-07-28 revision spells this out as a
 * SHOULD; it costs nothing to honour now.
 */
const register = (server: McpServer, catalog: Catalog): void => {
    server.registerTool(
        'search',
        {
            description:
                'Search the Koobiq design system: entry points, exported symbols, class members, live examples, icons and design tokens. One index over all of them. Returns refs to pass to the get_* tools. Icon tags are indexed in English and Russian, so search icons by meaning.',
            inputSchema: {
                query: z.string().describe('Words to look for, e.g. "select multiple", "корзина", "error background"'),
                kinds: z.array(z.enum(HIT_KINDS)).optional().describe('Restrict to these result kinds'),
                limit: z.number().int().min(1).max(50).optional().describe('Max results, default 12')
            }
        },
        async (args) => text(toolSearch(catalog, args))
    );

    server.registerTool(
        'get_component',
        {
            description:
                'Public API of one entry point of @koobiq/components, read from the version installed in this project. Returns inputs under the names a template writes, with the type each accepts, plus outputs, selectors and exportAs. Inherited and host-directive inputs are included and labelled. Methods and internals are omitted unless asked for.',
            inputSchema: {
                id: z.string().describe('Entry point id, e.g. "select" or "@koobiq/components/select"'),
                symbols: z.array(z.string()).optional().describe('Expand exactly these exported symbols'),
                members: z.array(z.string()).optional().describe('Keep only these inputs, outputs or members'),
                include: z
                    .array(z.enum(['methods', 'internals']))
                    .optional()
                    .describe('Add public methods, or everything including lifecycle hooks and compiler fields')
            }
        },
        async (args) => text(toolGetComponent(catalog, args))
    );

    server.registerTool(
        'get_example',
        {
            description:
                'Source of one live example from the documentation site, as shipped in the repository. Call with no `files` to get every file of the example.',
            inputSchema: {
                id: z.string().describe('Example id, e.g. "select-multiple-overview"'),
                files: z.array(z.string()).optional().describe('Only these file names')
            }
        },
        async (args) => text(toolGetExample(catalog, args))
    );

    server.registerTool(
        'get_icon',
        {
            description:
                'Resolve an icon of @koobiq/icons to its usable name and markup. Read from the version installed in this project, not from a bundled copy.',
            inputSchema: {
                name: z.string().describe('Icon name with or without the kbq- prefix, e.g. "trash_16"')
            }
        },
        async (args) => text(toolGetIcon(catalog, args))
    );

    server.registerTool(
        'get_token',
        {
            description:
                'Resolve a design token of @koobiq/design-tokens to its CSS custom property, value per theme and deprecation status. Read from the version installed in this project.',
            inputSchema: {
                name: z.string().describe('Token name with or without the --kbq- prefix, e.g. "background-bg"')
            }
        },
        async (args) => text(toolGetToken(catalog, args))
    );

    // Appended rather than slotted next to `search`, where it belongs by topic. Every tool after an
    // insertion point shifts in the request prefix and stops matching the cache, so new tools go on
    // the end: that way adding one invalidates only itself.
    server.registerTool(
        'get_guide',
        {
            description:
                "Koobiq guides: installation, theming, localization, validation patterns, schematics, smart search, and the version-by-version migration guide. Served at the version this project resolved, not the newest. Call with no arguments to list guides, with `id` to list a guide's sections, with `id` and `section` to read one.",
            inputSchema: {
                id: z.string().optional().describe('Guide id, e.g. "theming", "validation", "migration"'),
                section: z.string().optional().describe('Section heading, exact or partial'),
                lang: z.enum(['en', 'ru']).optional().describe('Preferred language, default en')
            }
        },
        async (args) => text(toolGetGuide(catalog, args))
    );

    server.registerTool(
        'migrate',
        {
            description:
                "What changed in @koobiq/components between two versions, and where the written instructions are. Call with `from` for a summary of which entry points lost API — that is what stops compiling — then with `component` for one entry point's changes. `to` defaults to the version installed here.",
            inputSchema: {
                from: z.string().describe('Version being upgraded from, e.g. "18.4.0"'),
                to: z.string().optional().describe('Version being upgraded to; defaults to the installed one'),
                component: z.string().optional().describe('List this entry point\'s changes, e.g. "select"'),
                lang: z.enum(['en', 'ru']).optional().describe('Language of the migration guide, default en')
            }
        },
        async (args) => text(toolMigrate(catalog, args))
    );

    server.registerTool(
        'which_component_when',
        {
            description:
                'Which Koobiq component answers a task, and which neighbouring component would be the wrong choice — with the reason. Use before get_component when the task is known but the component is not. Answers in the language the task is written in.',
            inputSchema: {
                task: z
                    .string()
                    .describe('The job to be done, in plain words, e.g. "pick several values from a long list"'),
                lang: z.enum(['en', 'ru']).optional().describe('Overrides the language detected from the task')
            }
        },
        async (args) => text(toolWhichComponent(catalog, args))
    );
};

const main = async (): Promise<void> => {
    const catalog = loadCatalog();
    const server = new McpServer(
        { name: 'koobiq', version: '0.0.0' },
        { instructions: 'Koobiq design system reference. Resolve names here instead of guessing them.' }
    );

    register(server, catalog);

    // stdout carries the JSON-RPC stream, so diagnostics go to stderr. The spec deprecated the
    // logging feature; stderr is the migration it names for stdio servers.
    process.stderr.write(`koobiq-mcp ready — ${describe(catalog)}\n`);

    await server.connect(new StdioServerTransport());
};

const describe = (catalog: Catalog): string => [
        `index @koobiq/components@${catalog.index.sourceVersion}`,
        `${catalog.index.components.length} entry points`,
        catalog.icons.ok ? `icons@${catalog.icons.version}` : `icons unavailable`,
        catalog.tokens.ok ? `tokens@${catalog.tokens.version}` : `tokens unavailable`,
        catalog.project.projectRoot ?? 'no project root'
    ].join(', ');

main().catch((error: unknown) => {
    process.stderr.write(`koobiq-mcp failed to start: ${error instanceof Error ? error.stack : String(error)}\n`);
    process.exit(1);
});
