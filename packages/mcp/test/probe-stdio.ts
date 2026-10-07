import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { CONSUMER } from './project.ts';

/**
 * Drives the real server the way a client does: spawn it, speak newline-delimited JSON-RPC over
 * its stdin and stdout, call every tool, and report what each answer would cost in context.
 *
 * Unit tests exercise the tool bodies; this is the only check that the wiring, the schemas and the
 * transport actually work together.
 *
 *   yarn mcp:probe
 */

const PROJECT = CONSUMER;

/**
 * Resolved rather than spelled out: `tsx` is a devDependency of the repository root, not of this
 * package, and in a monorepo there is no telling which `node_modules` it was hoisted into.
 */
const tsxCli = (): string => createRequire(import.meta.url).resolve('tsx/cli');
const SERVER = resolve(import.meta.dirname, '..', 'src', 'server.ts');

/**
 * A range, not a number. JSON tokenizes worse than prose — punctuation, quoted identifiers and
 * nesting all cost — so a payload of mixed English descriptions and JSON Schema lands somewhere
 * between ~2.5 and ~3.5 characters per token. Nothing here is tokenizer output.
 */
const estimateTokens = (value: string): string => `${Math.round(value.length / 3.5)}–${Math.round(value.length / 2.5)}`;

const midpoint = (value: string): number => Math.round(value.length / 3);

type Response = { id?: number; result?: unknown; error?: { message: string } };

const child = spawn(process.execPath, [tsxCli(), SERVER], {
    cwd: PROJECT,
    stdio: ['pipe', 'pipe', 'pipe']
});

const pending = new Map<number, (value: Response) => void>();
let nextId = 1;

createInterface({ input: child.stdout }).on('line', (line) => {
    if (!line.trim()) return;

    try {
        const message = JSON.parse(line) as Response;

        if (typeof message.id === 'number') pending.get(message.id)?.(message);
    } catch {
        process.stderr.write(`[unparsed] ${line}\n`);
    }
});

child.stderr.on('data', (chunk: Buffer) => process.stderr.write(`[server] ${chunk.toString()}`));

const call = (method: string, params?: unknown): Promise<Response> => {
    const id = nextId++;

    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`${method} timed out`)), 20_000);

        pending.set(id, (value) => {
            clearTimeout(timer);
            resolve(value);
        });

        child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
};

const notify = (method: string, params?: unknown): void => {
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
};

const textOf = (response: Response): string => {
    if (response.error) return `ERROR ${response.error.message}`;

    const content = (response.result as { content?: { type: string; text?: string }[] } | undefined)?.content ?? [];

    return content.map((block) => block.text ?? '').join('\n');
};

const CALLS: { label: string; name: string; args: Record<string, unknown> }[] = [
    { label: 'поиск компонента по селектору', name: 'search', args: { query: 'kbq-alert' } },
    { label: 'поиск иконки по смыслу (рус.)', name: 'search', args: { query: 'удалить', kinds: ['icon'], limit: 5 } },
    { label: 'поиск токена', name: 'search', args: { query: 'background error', kinds: ['token'], limit: 5 } },
    { label: 'поиск примера', name: 'search', args: { query: 'validation on submit', kinds: ['example'], limit: 5 } },
    { label: 'API компонента целиком', name: 'get_component', args: { id: 'alert' } },
    {
        label: 'API, сужённый до одного инпута',
        name: 'get_component',
        args: { id: 'select', symbols: ['KbqSelect'], members: ['multiple'] }
    },
    { label: 'иконка', name: 'get_icon', args: { name: 'trash_16' } },
    { label: 'токен', name: 'get_token', args: { name: 'background-bg' } },
    { label: 'устаревший токен', name: 'get_token', args: { name: 'theme-default' } },
    { label: 'исходник примера', name: 'get_example', args: { id: 'validation-on-submit' } },
    { label: 'несуществующий компонент', name: 'get_component', args: { id: 'selekt' } },
    { label: 'несуществующая иконка', name: 'get_icon', args: { name: 'dumpster_16' } }
];

const main = async (): Promise<void> => {
    const initialize = await call('initialize', {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'koobiq-mcp-probe', version: '0.0.0' }
    });

    const negotiated = (initialize.result as { protocolVersion?: string } | undefined)?.protocolVersion;

    notify('notifications/initialized');

    const list = await call('tools/list');
    const tools = (list.result as { tools: { name: string; description: string; inputSchema: unknown }[] }).tools;
    const payload = JSON.stringify(tools);

    process.stdout.write(
        [
            `protocol negotiated: ${negotiated}`,
            `tools/list: ${tools.map((tool) => tool.name).join(', ')}`,
            `tool schemas: ${payload.length} chars ≈ ${estimateTokens(payload)} tokens`,
            `  This is THIS server's share of the per-request tax, not the whole of it. A client`,
            `  shows one figure for every server it has connected plus its own built-ins — a session`,
            `  with 113 tools loaded is not measuring these five.`,
            '',
            '─'.repeat(78),
            ''
        ].join('\n')
    );

    let total = 0;

    for (const item of CALLS) {
        const response = await call('tools/call', { name: item.name, arguments: item.args });
        const body = textOf(response);

        total += midpoint(body);

        process.stdout.write(
            [
                `▸ ${item.label}`,
                `  ${item.name}(${JSON.stringify(item.args)})`,
                `  ≈ ${estimateTokens(body)} tokens`,
                '',
                body
                    .split('\n')
                    .map((line) => `  │ ${line}`)
                    .join('\n'),
                '',
                '─'.repeat(78),
                ''
            ].join('\n')
        );
    }

    process.stdout.write(
        [
            `${CALLS.length} calls, ≈ ${total} tokens of answers (midpoint estimate)`,
            `average ≈ ${Math.round(total / CALLS.length)} tokens per call`,
            `this server's schemas ≈ ${estimateTokens(payload)} tokens per request`,
            ''
        ].join('\n')
    );

    child.kill();
};

main().catch((error: unknown) => {
    process.stderr.write(`probe failed: ${error instanceof Error ? error.message : String(error)}\n`);
    child.kill();
    process.exit(1);
});
