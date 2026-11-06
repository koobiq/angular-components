import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, Injectable, Provider, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqSplitter, KbqSplitterPanel } from '@koobiq/components/splitter';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    changes = new BehaviorSubject<ResizeObserverEntry[]>([]);

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

const windowStub: Provider = {
    provide: KBQ_WINDOW,
    useValue: {
        getComputedStyle: () => ({ paddingLeft: '0px', paddingRight: '0px', paddingTop: '0px', paddingBottom: '0px' })
    }
};

/** The collapsible panel comes after its separator, like the Terminal panel of the `splitter-collapsible` example. */
@Component({
    selector: 'test-trailing-collapsible',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel>first</kbq-splitter-panel>
            <kbq-splitter-panel minSize="100" collapsible collapsedSize="40" [(collapsed)]="collapsed">
                second
            </kbq-splitter-panel>
        </kbq-splitter>
    `
})
class TestTrailingCollapsible {
    readonly collapsed = signal(false);
}

const createComponent = (): ComponentFixture<TestTrailingCollapsible> => {
    TestBed.configureTestingModule({
        imports: [TestTrailingCollapsible],
        providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }, windowStub]
    });

    const fixture = TestBed.createComponent(TestTrailingCollapsible);

    fixture.autoDetectChanges();

    return fixture;
};

const getSplitter = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('kbq-splitter');

const getSeparator = (fixture: ComponentFixture<unknown>): HTMLElement =>
    fixture.nativeElement.querySelector('.kbq-splitter-panel__separator');

const getSizes = (fixture: ComponentFixture<unknown>): number[] => {
    const splitter = getSplitter(fixture);

    return splitter.style.gridTemplateColumns
        .split(' ')
        .map((track) => Math.round((parseFloat(track) / 100) * splitter.clientWidth));
};

const measure = (fixture: ComponentFixture<unknown>, width = 600): void => {
    const splitter = getSplitter(fixture);

    Object.defineProperty(splitter, 'clientWidth', { configurable: true, value: width });
    Object.defineProperty(splitter, 'clientHeight', { configurable: true, value: width });

    (TestBed.inject(SharedResizeObserver) as MockResizeObserver).changes.next([]);
    fixture.detectChanges();
};

const pressKey = (separator: HTMLElement, key: string): void => {
    separator.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
};

describe('splitter triage: collapsible panel after its separator', () => {
    it('DEFECT: no key on the separator collapses a trailing collapsible panel', () => {
        const fixture = createComponent();

        measure(fixture);

        expect(getSizes(fixture)).toEqual([300, 300]);

        // Every key the splitter handles, each pressed enough times to reach a limit.
        for (const key of ['End', 'End', 'ArrowRight', 'ArrowRight', 'Home', 'End', 'Enter', 'End', 'Enter']) {
            pressKey(getSeparator(fixture), key);
            fixture.detectChanges();
        }

        for (let press = 0; press < 40; press++) pressKey(getSeparator(fixture), 'ArrowRight');
        fixture.detectChanges();

        // The trailing panel stops at its 100px minimum and never collapses; a drag past 50px would.
        expect(fixture.componentInstance.collapsed()).toBe(false);
        expect(getSizes(fixture)).toEqual([500, 100]);
    });

    it('DEFECT: no key on the separator expands a collapsed trailing panel', () => {
        const fixture = createComponent();

        measure(fixture);

        // What a drag or the host leaves behind.
        fixture.componentInstance.collapsed.set(true);
        fixture.detectChanges();

        expect(getSizes(fixture)).toEqual([560, 40]);

        for (const key of ['Enter', 'End', 'Home', 'Enter', 'ArrowLeft', 'ArrowLeft', 'Home', 'Enter']) {
            pressKey(getSeparator(fixture), key);
            fixture.detectChanges();
        }

        expect(fixture.componentInstance.collapsed()).toBe(true);
        expect(getSizes(fixture)).toEqual([560, 40]);
    });
});
