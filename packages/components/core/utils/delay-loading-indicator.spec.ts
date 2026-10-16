import { BehaviorSubject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { kbqDelayLoadingIndicator } from './delay-loading-indicator';

describe(kbqDelayLoadingIndicator.name, () => {
    let testScheduler: TestScheduler;

    beforeEach(() => {
        testScheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
    });

    const values = { t: true, f: false };

    it('should not show the indicator for an operation shorter than the delay', () => {
        testScheduler.run(({ cold, expectObservable }) => {
            const source = cold('f t 100ms f', values);

            expectObservable(source.pipe(kbqDelayLoadingIndicator())).toBe('f', values);
        });
    });

    it('should show the indicator after the delay and hide it when the operation ends', () => {
        testScheduler.run(({ cold, expectObservable }) => {
            const source = cold('f 1999ms t 1999ms f', values);

            // the operation starts at 2000ms, so the indicator appears at 2500ms and hides at 4000ms
            expectObservable(source.pipe(kbqDelayLoadingIndicator())).toBe('f 2499ms t 1499ms f', values);
        });
    });

    it('should keep the indicator for the minimum duration', () => {
        testScheduler.run(({ cold, expectObservable }) => {
            const source = cold('t 599ms f', values);

            // shown at 500ms, the operation ends at 600ms, hidden at 800ms
            expectObservable(source.pipe(kbqDelayLoadingIndicator())).toBe('500ms t 299ms f', values);
        });
    });

    it('should keep the indicator visible when an operation restarts during the minimum duration', () => {
        testScheduler.run(({ cold, expectObservable }) => {
            const source = cold('t 599ms f 99ms t 999ms f', values);

            // shown at 500ms, restarted at 700ms before the indicator hides, the last operation ends at 1700ms
            expectObservable(source.pipe(kbqDelayLoadingIndicator())).toBe('500ms t 1199ms f', values);
        });
    });

    it('should accept custom timings', () => {
        testScheduler.run(({ cold, expectObservable }) => {
            const source = cold('t 149ms f', values);

            expectObservable(source.pipe(kbqDelayLoadingIndicator({ delay: 100, minDuration: 200 }))).toBe(
                '100ms t 199ms f',
                values
            );
        });
    });

    it('should restart the delay when an operation restarts before the indicator appears', () => {
        testScheduler.run(({ cold, expectObservable }) => {
            const source = cold('t 299ms f 99ms t 999ms f', values);

            // restarted at 400ms, so the indicator appears at 900ms rather than 500ms
            expectObservable(source.pipe(kbqDelayLoadingIndicator())).toBe('300ms f 599ms t 499ms f', values);
        });
    });

    it('should toggle the indicator synchronously without a delay and a minimum duration', () => {
        const source = new BehaviorSubject(true);
        const emitted: boolean[] = [];

        source.pipe(kbqDelayLoadingIndicator({ delay: 0, minDuration: 0 })).subscribe((value) => emitted.push(value));

        expect(emitted).toEqual([true]);

        source.next(false);

        expect(emitted).toEqual([true, false]);
    });

    it('should not share timing state between subscriptions', () => {
        testScheduler.run(({ cold, expectObservable }) => {
            const delayed = cold('t 599ms f', values).pipe(kbqDelayLoadingIndicator());

            expectObservable(delayed).toBe('500ms t 299ms f', values);
            // subscribed while the first indicator is shown: has to wait for its own delay
            expectObservable(delayed, '550ms ^').toBe('1050ms t 299ms f', values);
        });
    });
});
