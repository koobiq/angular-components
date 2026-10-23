/**
 * Test stub for `IntersectionObserver`, which jsdom lacks and the `on viewport` trigger of the code blocks of the API
 * tab watches their placeholders with. Installed with `vi.stubGlobal('IntersectionObserver', ...)`; a test reports a
 * placeholder in view through `enter`, and `reset` in `afterEach` drops the observers of the test that has finished.
 */
export class DocsIntersectionObserverStub {
    private static readonly instances: DocsIntersectionObserverStub[] = [];

    private readonly targets = new Set<Element>();

    constructor(private readonly callback: IntersectionObserverCallback) {
        DocsIntersectionObserverStub.instances.push(this);
    }

    /** Reports the elements as in view to the observers watching them. */
    static enter(...elements: Element[]): void {
        // A copy: a block that renders unobserves its placeholder, and a disconnect from the callback would splice the
        // list being iterated.
        for (const observer of [...DocsIntersectionObserverStub.instances]) {
            const entries = elements
                .filter((target) => observer.targets.has(target))
                .map((target) => ({ isIntersecting: true, target }) as IntersectionObserverEntry);

            if (entries.length) observer.callback(entries, observer as unknown as IntersectionObserver);
        }
    }

    /**
     * Forgets every observer. Without it the list holds one entry per deferred block of every test in the file, each
     * keeping the DOM of a destroyed fixture reachable through its targets.
     */
    static reset(): void {
        DocsIntersectionObserverStub.instances.length = 0;
    }

    observe(target: Element): void {
        this.targets.add(target);
    }

    unobserve(target: Element): void {
        this.targets.delete(target);
    }

    disconnect(): void {
        this.targets.clear();

        const { instances } = DocsIntersectionObserverStub;
        const index = instances.indexOf(this);

        if (index > -1) {
            instances.splice(index, 1);
        }
    }
}
