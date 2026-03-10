import { Component, DebugElement, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqClampedList, KbqClampedListTrigger } from './clamped-list';

function getItems(debugElement: DebugElement) {
    return debugElement.queryAll(By.css('.item'));
}

function getTrigger(debugElement: DebugElement) {
    return debugElement.query(By.css('.trigger'));
}

function getHost(debugElement: DebugElement): HTMLElement {
    return debugElement.query(By.directive(KbqClampedList)).nativeElement;
}

@Component({
    imports: [
        KbqClampedListTrigger,
        KbqClampedList
    ],
    template: `
        <div
            #clampedList="kbqClampedList"
            kbqClampedList
            [items]="items()"
            [collapsedVisibleCount]="collapsedVisibleCount()"
            [hiddenThreshold]="hiddenThreshold()"
        >
            @for (item of clampedList.visibleItems(); track item) {
                <span class="item">{{ item }}</span>
            }

            @if (clampedList.hasToggle()) {
                <button kbqClampedListTrigger class="trigger">
                    @if (clampedList.isCollapsed()) {
                        open
                    } @else {
                        close
                    }
                </button>
            }
        </div>
    `
})
class TestHostComponent {
    items = signal(Array.from({ length: 17 }, (_, i) => `Item ${i + 1}`));
    collapsedVisibleCount = signal(10);
    hiddenThreshold = signal(6);
}

describe('KbqClampedList', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let debugElement: DebugElement;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestHostComponent]
        });

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
        debugElement = fixture.debugElement;
    });

    it('should render collapsed list by default', () => {
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.collapsedVisibleCount());
    });

    it('should render toggle when exceeded items >= threshold', () => {
        expect(getTrigger(debugElement)).toBeTruthy();
    });

    it('should expand list when trigger clicked', () => {
        getTrigger(debugElement).nativeElement.click();
        fixture.detectChanges();

        expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);
    });

    it('should toggle trigger text', () => {
        const trigger = getTrigger(debugElement).nativeElement;

        expect(trigger.textContent.trim()).toBe('open');

        trigger.click();
        fixture.detectChanges();

        expect(trigger.textContent.trim()).toBe('close');
    });

    it('should update aria-expanded attribute', () => {
        const host = getHost(debugElement);

        expect(host.getAttribute('aria-expanded')).toBe('false');

        getTrigger(debugElement).nativeElement.click();
        fixture.detectChanges();

        expect(host.getAttribute('aria-expanded')).toBe('true');
    });

    it('should not render trigger if items do not exceed threshold', () => {
        fixture.componentInstance.items.set(Array.from({ length: 9 }, (_, i) => `Item ${i + 1}`)); // 3 items
        fixture.detectChanges();

        expect(getTrigger(debugElement)).toBeNull();
    });

    it('should show all items and aria-expanded="true" when exceeded count is below hiddenThreshold', () => {
        fixture.componentInstance.items.set(Array.from({ length: 12 }, (_, i) => `Item ${i + 1}`));
        fixture.detectChanges();

        expect(getTrigger(debugElement)).toBeNull();
        expect(getItems(debugElement).length).toBe(12);
        expect(getHost(debugElement).getAttribute('aria-expanded')).toBe('true');
    });

    it('should collapse back when clicked twice', () => {
        const trigger = getTrigger(debugElement).nativeElement;

        trigger.click();
        fixture.detectChanges();
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.items().length);

        trigger.click();
        fixture.detectChanges();
        expect(getItems(debugElement).length).toBe(fixture.componentInstance.collapsedVisibleCount());
    });
});
