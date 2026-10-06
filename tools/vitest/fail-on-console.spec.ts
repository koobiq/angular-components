import { it } from 'vitest';

// The hook reports from `afterEach`, so a test that writes to the console fails even though its own body passed.
// `it` comes from Vitest itself: the zone.js patch of the Angular setup drops `it.fails`.
describe('fail-on-console', () => {
    // eslint-disable-next-line vitest/expect-expect -- the console hook is the assertion
    it.fails('fails a test that writes to console.error', () => {
        console.error('canary');
    });

    // eslint-disable-next-line vitest/expect-expect -- the console hook is the assertion
    it.fails('fails a test that writes to console.warn', () => {
        console.warn('canary');
    });

    it('lets a test that spies on the console through', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});

        console.warn('expected by the test');

        expect(console.warn).toHaveBeenCalledWith('expected by the test');
    });
});
