import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, Injectable, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqClampedList, KbqClampedListTrigger, KbqClampedText } from '@koobiq/components/clamped-text';
import { KbqLink } from '@koobiq/components/link';
import { Observable, Subject } from 'rxjs';

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    private readonly changes = new Subject<ResizeObserverEntry[]>();

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }

    emit(): void {
        this.changes.next([]);
    }
}

const mockRenderedRows = (rows: number): void => {
    const rects = Object.assign(
        Array.from({ length: rows }, (_, index) => ({ top: index * 20 })),
        { item: () => null }
    ) as unknown as DOMRectList;

    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(rects);
};

const pressSpace = (target: HTMLElement, repeat: boolean): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', repeat, bubbles: true, cancelable: true });

    target.dispatchEvent(event);

    return event;
};

@Component({
    selector: 'clamped-text-test',
    imports: [KbqClampedText],
    template: `
        <kbq-clamped-text [rows]="5" (isCollapsedChange)="changes.push($event)">{{ text }}</kbq-clamped-text>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ClampedTextTest {
    protected readonly text = Array.from({ length: 100 }, (_, index) => `Text ${index}`).join(' ');
    readonly changes: (boolean | undefined)[] = [];
}

@Component({
    selector: 'clamped-list-test',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqLink],
    template: `
        <div #list="kbqClampedList" kbqClampedList [items]="items()" (isCollapsedChange)="changes.push($event)">
            @for (item of list.visibleItems(); track item) {
                <span class="item">{{ item }}</span>
            }
            @if (list.hasToggle()) {
                <a class="trigger" kbqLink kbqClampedListTrigger pseudo>more</a>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ClampedListTest {
    readonly items = signal(Array.from({ length: 17 }, (_, i) => `Item ${i + 1}`));
    readonly changes: boolean[] = [];
}

@Component({
    selector: 'plain-link-test',
    imports: [KbqLink],
    template: `
        <a class="link" kbqLink pseudo (click)="clicks = clicks + 1">pseudo link</a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class PlainLinkTest {
    clicks = 0;
}

describe('triage: the clamped trigger toggles on every auto-repeated Space keydown', () => {
    afterEach(() => vi.restoreAllMocks());

    it('control: a KbqLink pseudo link alone ignores the auto-repeat of a held Space', async () => {
        TestBed.configureTestingModule({ imports: [PlainLinkTest] });
        const fixture = TestBed.createComponent(PlainLinkTest);

        fixture.detectChanges();
        await fixture.whenStable();

        const link: HTMLElement = fixture.nativeElement.querySelector('.link');

        pressSpace(link, false);
        pressSpace(link, true);
        pressSpace(link, true);
        pressSpace(link, true);

        expect(fixture.componentInstance.clicks).toBe(1);
    });

    it('DEFECT: holding Space on the kbq-clamped-text toggle flips the state on each repeat', async () => {
        mockRenderedRows(20);
        TestBed.configureTestingModule({
            imports: [ClampedTextTest],
            providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
        });
        const fixture: ComponentFixture<ClampedTextTest> = TestBed.createComponent(ClampedTextTest);

        fixture.detectChanges();
        await fixture.whenStable();
        (TestBed.inject(SharedResizeObserver) as unknown as MockResizeObserver).emit();
        await new Promise((resolve) => setTimeout(resolve));
        await fixture.whenStable();

        const toggle: HTMLElement = fixture.nativeElement.querySelector('.kbq-clamped-text__toggle');

        expect(toggle).not.toBeNull();

        pressSpace(toggle, false);
        pressSpace(toggle, true);
        pressSpace(toggle, true);
        pressSpace(toggle, true);
        await fixture.whenStable();

        // One press of a native button would give [false]
        expect(fixture.componentInstance.changes).toEqual([false, true, false, true]);
        expect(
            fixture.nativeElement
                .querySelector('.kbq-clamped-text__content')
                .classList.contains('kbq-clamped-text__content_collapsed')
        ).toBe(true);
    });

    it('DEFECT: holding Space on a kbqLink kbqClampedListTrigger flips the list on each repeat', async () => {
        TestBed.configureTestingModule({ imports: [ClampedListTest] });
        const fixture = TestBed.createComponent(ClampedListTest);

        fixture.detectChanges();
        await fixture.whenStable();

        const trigger: HTMLElement = fixture.nativeElement.querySelector('.trigger');

        pressSpace(trigger, false);
        pressSpace(trigger, true);
        pressSpace(trigger, true);
        await fixture.whenStable();

        expect(fixture.componentInstance.changes).toEqual([false, true, false]);
        expect(fixture.nativeElement.querySelectorAll('.item').length).toBe(17);
    });
});
