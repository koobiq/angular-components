import { Direction, Directionality } from '@angular/cdk/bidi';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, Injectable, Provider, signal, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import {
    fitSplitterSizes,
    KbqSplitter,
    KbqSplitterAppearance,
    kbqSplitterOptionsProvider,
    KbqSplitterOrientation,
    KbqSplitterPanel,
    KbqSplitterSize,
    resizeSplitterSizesAt,
    resolveSplitterSize,
    snapSplitterSize
} from './splitter';

/** Size the splitter measures itself as; every expectation below is expressed against it. */
const CONTAINER_SIZE = 600;

/** `SharedResizeObserver` stand-in: the real one never emits in jsdom, where `ResizeObserver` is a no-op stub. */
@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    changes = new BehaviorSubject<ResizeObserverEntry[]>([]);

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

/** jsdom computes no layout, so the padding the splitter subtracts has to be supplied. */
const windowStub: Provider = {
    provide: KBQ_WINDOW,
    useValue: {
        getComputedStyle: () => ({ paddingLeft: '0px', paddingRight: '0px', paddingTop: '0px', paddingBottom: '0px' })
    }
};

type TestPanel = {
    id: string;
    size?: KbqSplitterSize;
    minSize?: KbqSplitterSize;
    maxSize?: KbqSplitterSize;
    snapSizes?: KbqSplitterSize[];
    snapTolerance?: number;
    collapsible?: boolean;
    collapsedSize?: KbqSplitterSize;
};

@Component({
    selector: 'test-splitter',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter
            [appearance]="appearance()"
            [disabled]="disabled()"
            [orientation]="orientation()"
            [(layout)]="layout"
        >
            @for (panel of panels(); track panel.id) {
                <kbq-splitter-panel
                    [collapsedSize]="panel.collapsedSize ?? 0"
                    [collapsible]="panel.collapsible ?? false"
                    [maxSize]="panel.maxSize"
                    [minSize]="panel.minSize"
                    [size]="panel.size"
                    [snapSizes]="panel.snapSizes ?? []"
                    [snapTolerance]="panel.snapTolerance ?? 32"
                >
                    {{ panel.id }}
                </kbq-splitter-panel>
            }
        </kbq-splitter>
    `
})
class TestSplitter {
    readonly panels = signal<TestPanel[]>([{ id: 'first' }, { id: 'second' }]);
    readonly orientation = signal<KbqSplitterOrientation>('horizontal');
    readonly appearance = signal<KbqSplitterAppearance>('divider');
    readonly disabled = signal(false);
    readonly layout = signal<number[] | null>(null);
}

/** Binds neither `appearance` nor `snapTolerance`, so the options token is what decides both. */
@Component({
    selector: 'test-splitter-options',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel>first</kbq-splitter-panel>
            <kbq-splitter-panel [snapSizes]="[200]">second</kbq-splitter-panel>
        </kbq-splitter>
    `
})
class TestSplitterOptions {}

/** Writable, so a test can flip the direction the way `Dir` does at runtime. */
const directionalityStub = (value: Direction) => {
    const valueSignal = signal<Direction>(value);

    return {
        valueSignal,
        provider: { provide: Directionality, useValue: { value, valueSignal, change: EMPTY } } as Provider
    };
};

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }, windowStub, ...providers]
    });

    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getSplitter = ({ nativeElement }: ComponentFixture<unknown>): HTMLElement =>
    nativeElement.querySelector('kbq-splitter');

const getPanels = ({ nativeElement }: ComponentFixture<unknown>): HTMLElement[] => [
    ...nativeElement.querySelectorAll('kbq-splitter-panel')
];

const getSeparators = ({ nativeElement }: ComponentFixture<unknown>): HTMLElement[] => [
    ...nativeElement.querySelectorAll('.kbq-splitter-panel__separator')
];

/** Sizes the splitter resolved, in pixels, read back out of the percentage track list it writes. */
const getSizes = (fixture: ComponentFixture<unknown>): number[] => {
    const splitter = getSplitter(fixture);
    const template = splitter.style.gridTemplateColumns || splitter.style.gridTemplateRows;

    return template.split(' ').map((track) => Math.round((parseFloat(track) / 100) * splitter.clientWidth));
};

/**
 * Gives the splitter a size to resolve against and lets it measure.
 *
 * jsdom leaves every element at zero, and a splitter with no size deliberately declines to lay anything out.
 */
const measure = (fixture: ComponentFixture<unknown>, size = CONTAINER_SIZE): void => {
    const splitter = getSplitter(fixture);

    Object.defineProperty(splitter, 'clientWidth', { configurable: true, value: size });
    Object.defineProperty(splitter, 'clientHeight', { configurable: true, value: size });

    (TestBed.inject(SharedResizeObserver) as MockResizeObserver).changes.next([]);
    fixture.detectChanges();
};

const pressKey = (separator: HTMLElement, key: string, shiftKey = false): void => {
    separator.dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }));
};

describe('splitter layout', () => {
    describe(resolveSplitterSize.name, () => {
        it.each<{ size: KbqSplitterSize | undefined | null; expected: number | null }>([
            { size: 240, expected: 240 },
            { size: '240', expected: 240 },
            { size: '240px', expected: 240 },
            { size: '30%', expected: 180 },
            { size: ' 30% ', expected: 180 },
            { size: undefined, expected: null },
            { size: null, expected: null },
            { size: 'auto', expected: null },
            { size: Number.NaN, expected: null }
        ])('should resolve $size against a 600px splitter as $expected', ({ size, expected }) => {
            expect(resolveSplitterSize(size, 600)).toBe(expected);
        });
    });

    describe(fitSplitterSizes.name, () => {
        it('should leave sizes that already fit and respect their limits untouched', () => {
            expect(fitSplitterSizes([200, 400], [0, 0], [Infinity, Infinity], 600)).toEqual([200, 400]);
        });

        it('should clamp to the limits and hand the residual to the panels that still have room', () => {
            expect(fitSplitterSizes([500, 100], [0, 0], [300, Infinity], 600)).toEqual([300, 300]);
        });

        it('should stop redistributing once every panel sits at a limit', () => {
            // Both panels are pinned to 100, so 400px of the splitter cannot be spent anywhere.
            expect(fitSplitterSizes([300, 300], [100, 100], [100, 100], 600)).toEqual([100, 100]);
        });

        it('should spread the residual across several passes when a panel fills up mid-way', () => {
            // The first pass offers 100 to each; the second panel can only take 50 and the rest goes to the third.
            expect(fitSplitterSizes([100, 100, 100], [0, 0, 0], [Infinity, 150, Infinity], 600)).toEqual([
                225,
                150,
                225
            ]);
        });
    });

    describe(resizeSplitterSizesAt.name, () => {
        it('should move the boundary between the two panels it sits on', () => {
            expect(resizeSplitterSizesAt([300, 300], 0, 50, [0, 0], [Infinity, Infinity])).toEqual([350, 250]);
        });

        it('should stop the leading panel at its own maximum', () => {
            expect(resizeSplitterSizesAt([300, 300], 0, 200, [0, 0], [400, Infinity])).toEqual([400, 200]);
        });

        it('should stop at what the trailing panel can give up', () => {
            expect(resizeSplitterSizesAt([300, 300], 0, 250, [0, 100], [Infinity, Infinity])).toEqual([500, 100]);
        });

        it('should cascade onto the next panel once the neighbour reaches its minimum', () => {
            // The neighbour can only give up 100 of the 250 asked for; the panel after it gives up the other 150.
            expect(
                resizeSplitterSizesAt([200, 200, 200], 0, 250, [0, 100, 50], [Infinity, Infinity, Infinity])
            ).toEqual([450, 100, 50]);
        });

        it('should stop once every trailing panel sits at its minimum', () => {
            expect(
                resizeSplitterSizesAt([200, 200, 200], 0, 250, [0, 100, 100], [Infinity, Infinity, Infinity])
            ).toEqual([400, 100, 100]);
        });

        it('should hand the delta to the panels further out when the neighbour is at its maximum', () => {
            // The panel beside the boundary is pinned at 200, so the one before it takes the delta instead and
            // the boundary still moves. Without this the drag would do nothing at all.
            expect(resizeSplitterSizesAt([243, 200, 243], 1, 60, [0, 125, 125], [Infinity, 200, Infinity])).toEqual([
                303,
                200,
                183
            ]);
        });

        it('should stop when the far side runs out even though the near side has room', () => {
            expect(resizeSplitterSizesAt([243, 200, 243], 1, 400, [0, 125, 125], [Infinity, 200, Infinity])).toEqual([
                361,
                200,
                125
            ]);
        });

        it('should not move the panels before the boundary while the neighbour still has room', () => {
            expect(resizeSplitterSizesAt([100, 200, 300], 1, 100, [0, 0, 0], [Infinity, Infinity, Infinity])).toEqual([
                100,
                300,
                200
            ]);
        });

        it('should ignore a boundary that has no trailing panel', () => {
            expect(resizeSplitterSizesAt([300, 300], 1, 50, [0, 0], [Infinity, Infinity])).toEqual([300, 300]);
        });
    });

    describe(snapSplitterSize.name, () => {
        /** Snap points all pulling from the same distance, which is the common case. */
        const points = (sizes: number[], tolerance = 32) => sizes.map((size) => ({ size, tolerance }));

        it('should pull the target onto a snap point within its tolerance', () => {
            expect(snapSplitterSize(310, points([300]))).toBe(300);
        });

        it('should leave a target that no snap point is close enough to', () => {
            expect(snapSplitterSize(400, points([300]))).toBe(400);
        });

        it('should choose the nearest of several snap points', () => {
            expect(snapSplitterSize(310, points([300, 318, 500]))).toBe(318);
        });

        it('should ignore snap points that resolve to infinity', () => {
            expect(snapSplitterSize(310, points([Infinity]))).toBe(310);
        });

        it("should honour each snap point's own tolerance", () => {
            // The nearer point pulls from 8px only, so the further one — which reaches 60px — wins.
            expect(
                snapSplitterSize(310, [
                    { size: 290, tolerance: 8 },
                    { size: 360, tolerance: 60 }
                ])
            ).toBe(360);
        });

        it('should settle a tie by declaration order', () => {
            expect(snapSplitterSize(300, points([200, 400], 150))).toBe(200);
            expect(snapSplitterSize(300, points([400, 200], 150))).toBe(400);
        });

        it('should let a wide tolerance reach a snap point the default would not', () => {
            expect(snapSplitterSize(310, points([400]))).toBe(310);
            expect(snapSplitterSize(310, points([400], 120))).toBe(400);
        });
    });
});

describe(KbqSplitter.name, () => {
    it('should give panels an equal share when none declares a size', () => {
        const fixture = createComponent(TestSplitter);

        measure(fixture);

        expect(getSizes(fixture)).toEqual([300, 300]);
    });

    it('should render a separator after every panel but the last', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first' }, { id: 'second' }, { id: 'third' }]);
        measure(fixture);

        expect(getSeparators(fixture)).toHaveLength(2);
        expect(getPanels(fixture).at(-1)!.querySelector('.kbq-splitter-panel__separator')).toBeNull();
    });

    it('should honour declared sizes and let the rest share what is left', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first', size: 200 }, { id: 'second' }, { id: 'third' }]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([200, 200, 200]);
    });

    it('should resolve a percentage size against the splitter', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first', size: '25%' }, { id: 'second' }]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([150, 450]);
    });

    it('should resolve a size given as a px string', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first', size: '150px' }, { id: 'second' }]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([150, 450]);
    });

    it('should resolve a percentage minimum', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first', size: 100, minSize: '50%' }, { id: 'second' }]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([300, 300]);
    });

    it('should resolve a percentage maximum', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first', size: 500, maxSize: '25%' }, { id: 'second' }]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([150, 450]);
    });

    it('should resolve a percentage collapsed size', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([
            { id: 'first', size: 200, minSize: 100, collapsible: true, collapsedSize: '10%' },
            { id: 'second' }
        ]);
        measure(fixture);
        pressKey(getSeparators(fixture)[0], 'Enter');

        expect(getSizes(fixture)).toEqual([60, 540]);
    });

    it('should mix units across the panels of one splitter', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([
            { id: 'first', size: '25%' },
            { id: 'second', size: '150px' },
            { id: 'third' }
        ]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([150, 150, 300]);
    });

    it('should re-resolve percentages when the splitter is resized', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first', size: '25%', minSize: '20%' }, { id: 'second' }]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([150, 450]);

        // A percentage is a share of the splitter as it is now, not a pixel count frozen at the first measurement.
        measure(fixture, 800);

        expect(getSizes(fixture)).toEqual([200, 600]);
    });

    it('should clamp a declared size to the panel constraints', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first', size: 500, maxSize: 200 }, { id: 'second' }]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([200, 400]);
    });

    it('should settle the seeded layout onto a snap size', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([
            { id: 'first' },
            { id: 'second', minSize: 100, maxSize: 500, snapSizes: [200, 350], snapTolerance: 100 }
        ]);
        measure(fixture);

        // An equal share would put the second panel at 300, which is no size it declared.
        expect(getSizes(fixture)).toEqual([250, 350]);
    });

    it('should leave the seeded layout where no snap size is close enough', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first' }, { id: 'second', snapSizes: [200] }]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([300, 300]);
    });

    it('should leave a layout it was handed unsnapped', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first' }, { id: 'second', snapSizes: [350] }]);
        fixture.componentInstance.layout.set([45, 55]);
        measure(fixture);

        // 330 is within the default tolerance of the declared 350, and stays put all the same: settling a
        // layout the host owns would overwrite a restored one and pull the boundary onto snap points mid-drag.
        expect(getSizes(fixture)).toEqual([270, 330]);
    });

    it('should keep a track below the container when the minimums cannot fit', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([
            { id: 'first', minSize: 250 },
            { id: 'second', minSize: 250 },
            { id: 'third', minSize: 250 }
        ]);
        measure(fixture);

        // 750px of minimums in a 600px splitter cannot be satisfied. The tracks must still say 250 each and
        // overflow: rendered as ratios they would be rescaled to 200 apiece, silently breaking every minimum
        // while the layout, the drag arithmetic and `aria-valuenow` all went on believing 250.
        expect(getSizes(fixture)).toEqual([250, 250, 250]);
    });

    it('should leave the container unfilled when every panel is capped below it', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([
            { id: 'first', maxSize: 100 },
            { id: 'second', maxSize: 100 }
        ]);
        measure(fixture);

        expect(getSizes(fixture)).toEqual([100, 100]);
    });

    it('should lay panels out along the block axis when vertical', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.orientation.set('vertical');
        measure(fixture);

        expect(getSplitter(fixture).style.gridTemplateColumns).toBe('');
        expect(getSplitter(fixture).style.gridTemplateRows).not.toBe('');
        expect(getSizes(fixture)).toEqual([300, 300]);
    });

    it('should fall back to equal tracks until it has been measured', () => {
        const fixture = createComponent(TestSplitter);

        expect(getSplitter(fixture).style.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))');
    });

    describe('layout', () => {
        it('should lay panels out from a layout supplied by the host', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.layout.set([25, 75]);
            measure(fixture);

            expect(getSizes(fixture)).toEqual([150, 450]);
        });

        it('should refit a supplied layout to the panel constraints', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([{ id: 'first', minSize: 250 }, { id: 'second' }]);
            fixture.componentInstance.layout.set([10, 90]);
            measure(fixture);

            expect(getSizes(fixture)).toEqual([250, 350]);
        });

        it('should return to the declared sizes when the layout is cleared', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([{ id: 'first', size: 200 }, { id: 'second' }]);
            fixture.componentInstance.layout.set([50, 50]);
            measure(fixture);

            expect(getSizes(fixture)).toEqual([300, 300]);

            fixture.componentInstance.layout.set(null);
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([200, 400]);
        });

        it('should ignore a layout whose length does not match the panels', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.layout.set([20, 30, 50]);
            measure(fixture);

            expect(getSizes(fixture)).toEqual([300, 300]);
        });
    });

    describe('accessibility', () => {
        it('should mark the separator up as a window splitter', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);

            const [separator] = getSeparators(fixture);

            expect(separator.getAttribute('role')).toBe('separator');
            expect(separator.getAttribute('tabindex')).toBe('0');
            expect(separator.getAttribute('aria-controls')).toBe(getPanels(fixture)[0].id);
            expect(separator.getAttribute('aria-valuenow')).toBe('50');
        });

        it('should orient the separator across the axis the panels are laid out along', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);

            expect(getSeparators(fixture)[0].getAttribute('aria-orientation')).toBe('vertical');

            fixture.componentInstance.orientation.set('vertical');
            fixture.detectChanges();

            expect(getSeparators(fixture)[0].getAttribute('aria-orientation')).toBe('horizontal');
        });

        it('should report the room the boundary still has as the separator value range', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([
                { id: 'first', minSize: 100, maxSize: 400 },
                { id: 'second', minSize: 200 }
            ]);
            measure(fixture);

            const [separator] = getSeparators(fixture);

            expect(separator.getAttribute('aria-valuenow')).toBe('50');
            expect(separator.getAttribute('aria-valuemin')).toBe('17');
            expect(separator.getAttribute('aria-valuemax')).toBe('67');
        });

        it('should report the pane it controls, not the boundary, when the delta walks past that pane', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([
                { id: 'first' },
                { id: 'second', minSize: 125, maxSize: 200 },
                { id: 'third', minSize: 125 }
            ]);
            measure(fixture);

            const separator = getSeparators(fixture)[1];

            // The boundary can still travel, but the pane this separator controls is pinned at its maximum.
            expect(separator.getAttribute('aria-valuenow')).toBe('33');
            expect(separator.getAttribute('aria-valuemax')).toBe('33');
            expect(separator.getAttribute('aria-valuemin')).toBe('21');
        });

        it('should name the separator from the locale', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);

            expect(getSeparators(fixture)[0].getAttribute('aria-label')).toBe('Изменить размер панелей');
        });

        it('should take the separator out of the tab order and mark it disabled when the splitter is', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.disabled.set(true);
            measure(fixture);

            const [separator] = getSeparators(fixture);

            expect(separator.getAttribute('tabindex')).toBe('-1');
            expect(separator.getAttribute('aria-disabled')).toBe('true');
        });
    });

    describe('cursor', () => {
        it('should advertise the axis the boundary moves along', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);

            expect(getSeparators(fixture)[0].style.cursor).toBe('col-resize');

            fixture.componentInstance.orientation.set('vertical');
            fixture.detectChanges();

            expect(getSeparators(fixture)[0].style.cursor).toBe('row-resize');
        });

        it('should point at the only direction left once a panel sits at a limit', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([{ id: 'first', size: 200, maxSize: 200 }, { id: 'second' }]);
            measure(fixture);

            expect(getSeparators(fixture)[0].style.cursor).toBe('w-resize');
        });

        it('should still offer both directions when the neighbour is pinned but the boundary can move', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([
                { id: 'first' },
                { id: 'second', minSize: 125, maxSize: 200 },
                { id: 'third', minSize: 125 }
            ]);
            measure(fixture);

            // The second panel sits at its maximum, so only the outward walk keeps this boundary movable.
            expect(getSizes(fixture)).toEqual([200, 200, 200]);
            expect(getSeparators(fixture)[1].style.cursor).toBe('col-resize');
        });

        it('should fall back to the default cursor when the splitter is disabled', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.disabled.set(true);
            measure(fixture);

            expect(getSeparators(fixture)[0].style.cursor).toBe('default');
        });
    });

    describe('keyboard', () => {
        it('should move the boundary by one step per arrow press', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);
            pressKey(getSeparators(fixture)[0], 'ArrowRight');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([308, 292]);

            pressKey(getSeparators(fixture)[0], 'ArrowLeft');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([300, 300]);
        });

        it('should ignore the arrows of the other axis', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);
            pressKey(getSeparators(fixture)[0], 'ArrowDown');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([300, 300]);
        });

        it('should take the panel to its minimum on Home and to its maximum on End', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([
                { id: 'first', minSize: 100, maxSize: 400 },
                { id: 'second', minSize: 150 }
            ]);
            measure(fixture);

            pressKey(getSeparators(fixture)[0], 'Home');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([100, 500]);

            pressKey(getSeparators(fixture)[0], 'End');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([400, 200]);
        });

        it('should collapse a collapsible panel that Home finds already at its minimum', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([
                { id: 'first', minSize: 100, collapsible: true, collapsedSize: 40 },
                { id: 'second' }
            ]);
            measure(fixture);

            pressKey(getSeparators(fixture)[0], 'Home');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([100, 500]);

            pressKey(getSeparators(fixture)[0], 'Home');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([40, 560]);
        });

        it('should toggle a collapsible panel on Enter and restore the size it had', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([
                { id: 'first', size: 200, minSize: 100, collapsible: true, collapsedSize: 40 },
                { id: 'second' }
            ]);
            measure(fixture);

            pressKey(getSeparators(fixture)[0], 'Enter');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([40, 560]);

            pressKey(getSeparators(fixture)[0], 'Enter');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([200, 400]);
        });

        it('should leave a panel that cannot collapse alone on End', () => {
            const fixture = createComponent(TestSplitter);

            // `collapsed` without `collapsible` is the host-driven pattern: only the host may collapse it.
            fixture.componentInstance.panels.set([
                { id: 'first', minSize: 100, collapsedSize: 40 },
                { id: 'second' }
            ]);
            measure(fixture);

            const panel = fixture.debugElement.queryAll(By.directive(KbqSplitterPanel))[0]
                .componentInstance as KbqSplitterPanel;

            panel.collapsed.set(true);
            fixture.detectChanges();
            pressKey(getSeparators(fixture)[0], 'End');

            expect(panel.collapsed()).toBe(true);
        });

        it('should leave a panel that cannot collapse alone on Enter', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);
            pressKey(getSeparators(fixture)[0], 'Enter');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([300, 300]);
        });

        it('should move focus between panels on F6', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);
            pressKey(getSeparators(fixture)[0], 'F6');

            expect(document.activeElement).toBe(getPanels(fixture)[1]);

            pressKey(getSeparators(fixture)[0], 'F6', true);

            expect(document.activeElement).toBe(getPanels(fixture)[0]);
        });

        it('should mirror the arrows in RTL, where the leading panel grows towards the west', () => {
            const fixture = createComponent(TestSplitter, [directionalityStub('rtl').provider]);

            measure(fixture);
            pressKey(getSeparators(fixture)[0], 'ArrowRight');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([292, 308]);
        });

        it('should follow a direction that flips after the first render', () => {
            const { valueSignal, provider } = directionalityStub('ltr');
            const fixture = createComponent(TestSplitter, [provider]);

            measure(fixture);
            pressKey(getSeparators(fixture)[0], 'ArrowRight');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([308, 292]);

            // What a locale switcher does: `Dir` writes the new direction into the signal, and every computed
            // that reads it has to follow.
            valueSignal.set('rtl');
            fixture.detectChanges();
            pressKey(getSeparators(fixture)[0], 'ArrowRight');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([300, 300]);
        });

        it('should not resize while the splitter is disabled', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.disabled.set(true);
            measure(fixture);
            pressKey(getSeparators(fixture)[0], 'ArrowRight');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([300, 300]);
        });
    });

    describe('double click', () => {
        it('should reset to the declared sizes and then take the panel to its minimum', () => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.panels.set([{ id: 'first', size: 200, minSize: 100 }, { id: 'second' }]);
            measure(fixture);

            pressKey(getSeparators(fixture)[0], 'ArrowRight');
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([208, 392]);

            getSeparators(fixture)[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([200, 400]);

            getSeparators(fixture)[0].dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
            fixture.detectChanges();

            expect(getSizes(fixture)).toEqual([100, 500]);
        });
    });

    describe('appearance', () => {
        it.each<{ appearance: KbqSplitterAppearance; className: string }>([
            { appearance: 'transparent', className: 'kbq-splitter_transparent' },
            { appearance: 'handle', className: 'kbq-splitter_handle' }
        ])('should mark the $appearance appearance on the host', ({ appearance, className }) => {
            const fixture = createComponent(TestSplitter);

            fixture.componentInstance.appearance.set(appearance);
            measure(fixture);

            expect(getSplitter(fixture).classList).toContain(className);
        });

        it('should leave the default appearance unmarked', () => {
            const fixture = createComponent(TestSplitter);

            measure(fixture);

            expect(getSplitter(fixture).className).toBe('kbq-splitter');
        });
    });

    it('should keep following its declared sizes after a press that moved nothing', () => {
        const fixture = createComponent(TestSplitter);

        fixture.componentInstance.panels.set([{ id: 'first', size: 200 }, { id: 'second' }]);
        measure(fixture);
        // A press with no travel: `handleResizeStart` must not turn the derived layout into an owned one.
        getSeparators(fixture)[0].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
        fixture.detectChanges();

        expect(fixture.componentInstance.layout()).toBeNull();

        fixture.componentInstance.panels.set([{ id: 'first', size: 400 }, { id: 'second' }]);
        fixture.detectChanges();

        expect(getSizes(fixture)).toEqual([400, 200]);
    });

    describe(kbqSplitterOptionsProvider.name, () => {
        it('should fall back to the built-in defaults with no provider', () => {
            const fixture = createComponent(TestSplitterOptions);

            measure(fixture);

            expect(getSplitter(fixture).className).toBe('kbq-splitter');
            // An equal share leaves the second panel 100px from its only snap size, out of reach of the 32px
            // tolerance the defaults carry.
            expect(getSizes(fixture)).toEqual([300, 300]);
        });

        it('should take the appearance from the provider', () => {
            const fixture = createComponent(TestSplitterOptions, [
                kbqSplitterOptionsProvider({ appearance: 'handle' })
            ]);

            measure(fixture);

            expect(getSplitter(fixture).classList).toContain('kbq-splitter_handle');
        });

        it('should take the snap tolerance from the provider', () => {
            const fixture = createComponent(TestSplitterOptions, [
                kbqSplitterOptionsProvider({ snapTolerance: 120 })
            ]);

            measure(fixture);

            // Now the 100px reach to the snap size is within the tolerance, so the seeded layout settles on it.
            expect(getSizes(fixture)).toEqual([400, 200]);
        });

        it('should leave the options it was not given at their defaults', () => {
            const fixture = createComponent(TestSplitterOptions, [
                kbqSplitterOptionsProvider({ snapTolerance: 120 })
            ]);

            measure(fixture);

            expect(getSplitter(fixture).className).toBe('kbq-splitter');
        });

        it('should let an explicit binding win over the provider', () => {
            // `TestSplitter` binds both inputs, so it stands for a host that has made up its own mind.
            const fixture = createComponent(TestSplitter, [
                kbqSplitterOptionsProvider({ appearance: 'handle', snapTolerance: 120 })
            ]);

            fixture.componentInstance.panels.set([{ id: 'first' }, { id: 'second', snapSizes: [200] }]);
            measure(fixture);

            expect(getSplitter(fixture).className).toBe('kbq-splitter');
            expect(getSizes(fixture)).toEqual([300, 300]);
        });
    });
});
