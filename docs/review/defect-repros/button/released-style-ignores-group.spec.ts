import { Component, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqButton, KbqButtonModule, KbqButtonStyleInput, KbqButtonStyles } from '@koobiq/components/button';

@Component({
    imports: [KbqButtonModule],
    template: `
        <div kbqButtonGroupRoot [kbqStyle]="groupStyle">
            <button kbq-button [kbqStyle]="ownStyle">Own</button>
            <button kbq-button>Inherited</button>
        </div>
    `
})
class OutlineGroupWithOwnStyle {
    readonly buttons = viewChildren(KbqButton);

    groupStyle: KbqButtonStyleInput = KbqButtonStyles.Outline;
    ownStyle: KbqButtonStyleInput | undefined = KbqButtonStyles.Transparent;
}

describe('triage: KbqButton style released inside a non-filled group', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [OutlineGroupWithOwnStyle] });
    });

    it('DEFECT: a button whose own kbqStyle turns undefined becomes filled instead of taking the outline group style', () => {
        const fixture = TestBed.createComponent(OutlineGroupWithOwnStyle);

        fixture.detectChanges();

        const [own, inherited] = fixture.componentInstance.buttons();
        const ownHost: HTMLElement = own.getHostElement();

        expect(own.kbqStyle).toBe(`kbq-button_${KbqButtonStyles.Transparent}`);
        expect(inherited.kbqStyle).toBe(`kbq-button_${KbqButtonStyles.Outline}`);

        fixture.componentInstance.ownStyle = undefined;
        fixture.detectChanges();
        fixture.detectChanges();

        expect(own.kbqStyle).toBe(`kbq-button_${KbqButtonStyles.Filled}`);
        expect(ownHost.classList).toContain(`kbq-button_${KbqButtonStyles.Filled}`);
        expect(ownHost.classList).not.toContain(`kbq-button_${KbqButtonStyles.Outline}`);
        expect(inherited.kbqStyle).toBe(`kbq-button_${KbqButtonStyles.Outline}`);

        // It only follows the group again once the group style itself changes.
        fixture.componentInstance.groupStyle = KbqButtonStyles.Transparent;
        fixture.detectChanges();

        expect(own.kbqStyle).toBe(`kbq-button_${KbqButtonStyles.Transparent}`);
    });
});
