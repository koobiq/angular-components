// Read while the file loads, before the hook replaces it for each test.
const realWarn = console.warn;

// The hook reports from `afterEach`, so a test that writes to the console fails even though its own body passed.
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

    // eslint-disable-next-line vitest/expect-expect -- the console hook is the assertion
    it.fails('fails a test whose own spy calls through', () => {
        vi.spyOn(console, 'warn');

        console.warn('canary');
    });

    // eslint-disable-next-line vitest/expect-expect -- the console hook is the assertion
    it.fails('fails a test that writes to the console after restoring its spy', () => {
        vi.spyOn(console, 'warn')
            .mockImplementation(() => {})
            .mockRestore();

        console.warn('canary');
    });

    // eslint-disable-next-line vitest/expect-expect -- the console hook is the assertion
    it.fails('fails a test that writes to the console after restoring every mock', () => {
        vi.restoreAllMocks();

        console.error('canary');
    });

    // eslint-disable-next-line vitest/expect-expect -- the console hook is the assertion
    it.fails('fails a test that puts the real console back', () => {
        console.warn = realWarn;
    });

    // jsdom reports an API it does not implement through its own virtual console, not `console.error`.
    (typeof window === 'undefined' ? it.skip : it.fails)('fails a test that calls an API jsdom lacks', () => {
        window.alert('canary');
    });

    describe('with every mock restored after each test', () => {
        // Hooks run in stack order: the restore runs first, then the hook registered before it, the way a spec's
        // own `afterEach` runs before the TestBed teardown that destroys its fixtures.
        afterEach(() => console.warn('canary'));
        afterEach(() => vi.restoreAllMocks());

        // eslint-disable-next-line vitest/expect-expect -- the console hook is the assertion
        it.fails('fails a test that writes to the console while it is torn down', () => {});
    });
});
