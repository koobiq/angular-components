import { OverlayContainer } from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqSplitButton, KbqSplitButtonModule } from '@koobiq/components/split-button';

@Component({
    selector: 'test-app-bare-panel-auto-width',
    imports: [KbqSplitButtonModule, KbqButtonModule, KbqDropdownModule],
    template: `
        <kbq-split-button panelAutoWidth>
            <button kbq-button>Action</button>
            <button kbq-button [kbqDropdownTriggerFor]="dropdown">More</button>
        </kbq-split-button>

        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Item</button>
        </kbq-dropdown>
    `
})
class BarePanelAutoWidth {}

describe('KbqSplitButton triage: bare panelAutoWidth attribute', () => {
    it('DEFECT: a bare panelAutoWidth attribute reads as "" and the panel still measures the trigger', () => {
        TestBed.configureTestingModule({ imports: [BarePanelAutoWidth] });

        const fixture = TestBed.createComponent(BarePanelAutoWidth);
        const splitButtonDebugEl = fixture.debugElement.query(By.directive(KbqSplitButton));
        const triggerDebugEl = fixture.debugElement.query(By.directive(KbqDropdownTrigger));
        const trigger = triggerDebugEl.injector.get(KbqDropdownTrigger);

        // Host 600px, chevron 50px: with panelAutoWidth honoured the pane would get min-width 600px.
        vi.spyOn(splitButtonDebugEl.nativeElement, 'getBoundingClientRect').mockReturnValue({
            width: 600
        } as DOMRect);
        vi.spyOn(triggerDebugEl.nativeElement, 'getBoundingClientRect').mockReturnValue({ width: 50 } as DOMRect);

        fixture.detectChanges();

        expect(splitButtonDebugEl.injector.get(KbqSplitButton).panelAutoWidth()).toBe('');
        expect(trigger.widthOrigin).toBeUndefined();

        trigger.open();
        fixture.detectChanges();

        const pane = TestBed.inject(OverlayContainer)
            .getContainerElement()
            .querySelector<HTMLElement>('.cdk-overlay-pane')!;

        expect(pane.style.minWidth).toBe('200px');
    });
});
