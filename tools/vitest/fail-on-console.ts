import { format } from 'node:util';
import { afterEach, beforeEach, vi } from 'vitest';

/**
 * Fails a test that writes to `console.error` or `console.warn`: a warning nobody reads is how a broken
 * binding or a missing provider ships. `vitest-fail-on-console` loses some errors under Vitest 4, so the
 * check is kept here.
 */
const silenced = (message: string): boolean =>
    // jsdom reports every stylesheet it cannot parse as an error, and the message is that error's stack, so
    // only its first line is stable.
    message.startsWith('Error: Could not parse CSS stylesheet') ||
    // Angular's dev-mode performance hint for an `@for` that tracks by identity and had to re-create every
    // item. Specs replace their inputs with fresh literals all the time, which is exactly what triggers it.
    message.startsWith('NG0956:');

const messages: string[] = [];
const spies: { mockRestore(): void }[] = [];

beforeEach(() => {
    messages.length = 0;

    for (const method of ['error', 'warn'] as const) {
        const spy = vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
            const message = format(...args);

            if (!silenced(message)) messages.push(`console.${method}: ${message}`);
        });

        spies.push(spy);
    }
});

afterEach(() => {
    // A spec may have restored every mock already; restoring a spy twice is harmless.
    spies.splice(0).forEach((spy) => spy.mockRestore());

    if (messages.length) {
        throw new Error(`Expected the test not to write to the console:\n\n${messages.join('\n\n')}`);
    }
});
