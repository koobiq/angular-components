import { BidiModule } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LEFT_ARROW, RIGHT_ARROW, createKeyboardEvent, dispatchKeyboardEvent } from '@koobiq/components/core';
import { KbqTabHeader, KbqTabsModule } from '@koobiq/components/tabs';

@Component({
    imports: [KbqTabsModule, BidiModule],
    template: `
        <div dir="rtl">
            <kbq-tab-group>
                <kbq-tab label="One">One</kbq-tab>
                <kbq-tab label="Two">Two</kbq-tab>
                <kbq-tab label="Three">Three</kbq-tab>
            </kbq-tab-group>
        </div>
    `
})
class RtlTabGroup {}

describe('triage: arrow keys in a right-to-left tab group', () => {
    it('DEFECT: Right moves focus to the next tab in document order, which RTL draws on the left', () => {
        const fixture = TestBed.createComponent(RtlTabGroup);

        fixture.detectChanges();

        const header = fixture.debugElement.query(By.directive(KbqTabHeader)).componentInstance as KbqTabHeader;
        const container: HTMLElement = header.tabListContainer.nativeElement;

        // The header knows it is right-to-left.
        expect(header.getLayoutDirection()).toBe('rtl');
        expect(header.elementRef.nativeElement.classList).toContain('kbq-tab-header_rtl');

        header.focusIndex = 1;

        dispatchKeyboardEvent(container, 'keydown', RIGHT_ARROW);
        expect(header.focusIndex).toBe(2);

        dispatchKeyboardEvent(container, 'keydown', LEFT_ARROW);
        expect(header.focusIndex).toBe(1);

        // The key manager the header configured with the direction would have mirrored the key.
        (header as any).keyManager.onKeydown(createKeyboardEvent('keydown', RIGHT_ARROW));
        expect(header.focusIndex).toBe(0);
    });
});
