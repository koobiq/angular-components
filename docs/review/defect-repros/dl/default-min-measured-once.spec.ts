import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, Injectable, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqDlModule } from '@koobiq/components/dl';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    readonly changes = new BehaviorSubject<ResizeObserverEntry[]>([]);

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

const LIST_WIDTH = 600;
const HORIZONTAL_TERM_WIDTH = 120;

@Component({
    imports: [KbqDlModule],
    template: `
        <kbq-dl resizable [vertical]="vertical()">
            @if (showTerms()) {
                <kbq-dt>Term</kbq-dt>
                <kbq-dd>Description</kbq-dd>
            }
        </kbq-dl>
    `
})
class TestApp {
    readonly vertical = signal<boolean | null>(false);
    readonly showTerms = signal(true);
}

const createApp = (vertical: boolean, showTerms: boolean): ComponentFixture<TestApp> => {
    TestBed.configureTestingModule({
        imports: [TestApp],
        providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
    });

    const fixture = TestBed.createComponent(TestApp);

    fixture.componentInstance.vertical.set(vertical);
    fixture.componentInstance.showTerms.set(showTerms);
    fixture.autoDetectChanges();
    fixture.detectChanges();

    return fixture;
};

const getList = (fixture: ComponentFixture<TestApp>): HTMLElement => fixture.nativeElement.querySelector('.kbq-dl');

describe('triage dl: default minimums are measured once', () => {
    beforeEach(() => {
        // jsdom has no layout: model it. A term fills its column, which is the whole row in the vertical layout.
        const original = Element.prototype.getBoundingClientRect;

        vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
            if (this.classList.contains('kbq-dt')) {
                const vertical = this.closest('.kbq-dl')!.classList.contains('kbq-dl_vertical');

                return { width: vertical ? LIST_WIDTH : HORIZONTAL_TERM_WIDTH, height: 20 } as DOMRect;
            }

            return original.call(this);
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('control: a term present at the first render becomes the default minimum', () => {
        const fixture = createApp(false, true);
        const list = getList(fixture);

        fixture.detectChanges();

        expect(list.querySelector('.kbq-dl__resize-handle')!.getAttribute('aria-valuemin')).toBe('120');
        expect(list.style.getPropertyValue('--kbq-description-list-dt-min-width')).toBe('120px');
    });

    it('DEFECT: terms that arrive after the first render leave the default minimum at 0', () => {
        const fixture = createApp(false, false);
        const list = getList(fixture);

        fixture.componentInstance.showTerms.set(true);
        fixture.detectChanges();

        expect(list.querySelectorAll('.kbq-dt').length).toBe(1);
        expect(list.querySelector('.kbq-dl__resize-handle')!.getAttribute('aria-valuemin')).toBe('0');
        expect(list.style.getPropertyValue('--kbq-description-list-dt-min-width')).toBe('0px');
    });

    it('DEFECT: a list first rendered vertical keeps the full-row term width as its minimum once it turns horizontal', () => {
        const fixture = createApp(true, true);
        const list = getList(fixture);

        Object.defineProperty(list, 'clientWidth', { configurable: true, value: LIST_WIDTH });
        expect(list.classList).toContain('kbq-dl_vertical');

        fixture.componentInstance.vertical.set(false);
        fixture.detectChanges();

        const handle = list.querySelector('.kbq-dl__resize-handle')!;

        expect(list.classList).toContain('kbq-dl_resizable');
        // `minmax(600px, 1fr)` for the term column of a 600 px list: it takes the whole row.
        expect(list.style.getPropertyValue('--kbq-description-list-dt-min-width')).toBe('600px');
        expect(handle.getAttribute('aria-valuemin')).toBe('600');
        // ddMinWidth defaults to the same 600 px, so there is no room left to resize.
        expect(handle.getAttribute('aria-valuemax')).toBe('600');
    });
});
