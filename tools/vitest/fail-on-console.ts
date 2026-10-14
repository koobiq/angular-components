import { format } from 'node:util';
import { afterEach, beforeEach } from 'vitest';

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

const methods = ['error', 'warn'] as const;

type Method = (typeof methods)[number];

const originals: Record<Method, Console[Method]> = { error: console.error, warn: console.warn };
const messages: string[] = [];
let armed = false;

// A plain function rather than `vi.spyOn`: a spec's own `vi.spyOn(console, ...)` would get that spy back, and its
// `mockRestore()` or `vi.restoreAllMocks()` would put the real console back for the rest of the test and its
// teardown. A spec's spy wraps this one instead, so restoring the spy re-arms the check; a spy left over from
// an earlier test and restored between tests only forwards.
const gate =
    (method: Method) =>
    (...args: unknown[]): void => {
        if (!armed) return originals[method](...args);

        const message = format(...args);

        if (!silenced(message)) messages.push(`console.${method}: ${message}`);
    };

const gates: Record<Method, Console[Method]> = { error: gate('error'), warn: gate('warn') };

beforeEach(() => {
    messages.length = 0;
    armed = true;

    for (const method of methods) console[method] = gates[method];
});

// The Angular setup registers this before calling `setupTestBed()`, so in stack order it runs after the teardown
// that destroys the fixtures.
afterEach(() => {
    armed = false;

    const unchecked = methods.filter((method) => console[method] === originals[method]);

    for (const method of methods) console[method] = originals[method];

    if (messages.length) {
        throw new Error(`Expected the test not to write to the console:\n\n${messages.join('\n\n')}`);
    }

    if (unchecked.length) {
        throw new Error(
            `The test put the real console.${unchecked.join(' and console.')} back, so what it wrote then went unchecked.`
        );
    }
});
