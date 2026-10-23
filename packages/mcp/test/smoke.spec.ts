import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline';

/**
 * Smoke-tests the assembled package instead of the source: a stdio handshake followed by one real
 * tool call, against `dist/mcp/dist/server.js` — the file `@koobiq/mcp`'s `bin` entry actually
 * points at. `yarn mcp:probe` exercises every tool and prints a token-budget report for a human to
 * read; this is the automated slice of the same idea for CI — wiring, schema and transport agree,
 * nothing more.
 */

const SERVER = join(import.meta.dirname, '..', '..', '..', 'dist', 'mcp', 'dist', 'server.js');

type Response = {
    id?: number;
    result?: { protocolVersion?: string; tools?: { name: string }[]; content?: { text?: string }[] };
};

describe.skipIf(!existsSync(SERVER))('the assembled package, over stdio', () => {
    test('initializes, lists its tools and answers one call', async () => {
        const child = spawn(process.execPath, [SERVER], { stdio: ['pipe', 'pipe', 'pipe'] });
        const lines = createInterface({ input: child.stdout });
        const next = (): Promise<Response> =>
            new Promise((resolve) => lines.once('line', (line: string) => resolve(JSON.parse(line) as Response)));
        const send = (message: Record<string, unknown>): void => {
            child.stdin.write(`${JSON.stringify(message)}\n`);
        };

        try {
            send({
                jsonrpc: '2.0',
                id: 1,
                method: 'initialize',
                params: {
                    protocolVersion: '2025-11-25',
                    capabilities: {},
                    clientInfo: { name: 'koobiq-mcp-smoke-test', version: '0.0.0' }
                }
            });

            expect((await next()).result?.protocolVersion).toBeTruthy();

            send({ jsonrpc: '2.0', method: 'notifications/initialized' });
            send({ jsonrpc: '2.0', id: 2, method: 'tools/list' });

            const tools = (await next()).result?.tools ?? [];

            expect(tools.some((tool) => tool.name === 'list_components')).toBeTruthy();

            send({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'list_components', arguments: {} } });

            const answer = (await next()).result?.content?.[0]?.text ?? '';

            expect(answer.length).toBeGreaterThan(0);
        } finally {
            child.kill();
        }
    }, 10_000);
});
