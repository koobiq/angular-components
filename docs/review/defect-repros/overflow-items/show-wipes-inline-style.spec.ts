import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqOverflowItem, KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { EMPTY } from 'rxjs';

@Component({
    selector: 'triage-item-inline-style',
    imports: [KbqOverflowItemsModule],
    template: `
        <div kbqOverflowItems style="width: 100px">
            <div kbqOverflowItem="A" [style.position]="position()" [style.visibility]="visibility()">A</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ItemInlineStyle {
    readonly position = signal('relative');
    readonly visibility = signal('visible');
}

describe('triage: ElementVisibilityManager.show()', () => {
    afterEach(() => vi.useRealTimers());

    it('DEFECT: the first recalculation removes the [style.position] and [style.visibility] bound on a visible item', async () => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({
            imports: [ItemInlineStyle],
            providers: [{ provide: SharedResizeObserver, useValue: { observe: () => EMPTY } }]
        });
        const fixture = TestBed.createComponent(ItemInlineStyle);

        fixture.detectChanges();

        const itemDebugElement = fixture.debugElement.query(By.directive(KbqOverflowItem));
        const element = itemDebugElement.nativeElement as HTMLElement;

        expect(element.style.position).toBe('relative');
        expect(element.style.visibility).toBe('visible');

        await vi.advanceTimersByTimeAsync(20);
        fixture.detectChanges();

        // Nothing overflows (jsdom reports zero sizes), so the item was never hidden, only shown.
        expect(itemDebugElement.injector.get(KbqOverflowItem).hidden()).toBe(false);
        expect(fixture.componentInstance.position()).toBe('relative');
        expect(element.style.position).toBe('');
        expect(element.style.visibility).toBe('');
    });
});
