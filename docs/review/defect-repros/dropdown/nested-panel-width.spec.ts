import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';

@Component({
    imports: [KbqDropdownModule],
    template: `
        <button #plainTrigger="kbqDropdownTrigger" [kbqDropdownTriggerFor]="plain">Plain</button>
        <kbq-dropdown #plain="kbqDropdown" [panelWidth]="300">
            <button kbq-dropdown-item>Plain item</button>
        </kbq-dropdown>

        <button #rootTrigger="kbqDropdownTrigger" [kbqDropdownTriggerFor]="root">Root</button>
        <kbq-dropdown #root="kbqDropdown">
            <button #nestedTrigger="kbqDropdownTrigger" kbq-dropdown-item [kbqDropdownTriggerFor]="nested">
                Nested trigger
            </button>
        </kbq-dropdown>
        <kbq-dropdown #nested="kbqDropdown" [panelWidth]="300">
            <button kbq-dropdown-item>Nested item</button>
        </kbq-dropdown>

        <button #verticalTrigger="kbqDropdownTrigger" [kbqDropdownTriggerFor]="vertical">Vertical</button>
        <kbq-dropdown #vertical="kbqDropdown" [panelWidth]="300" [overlapTriggerY]="true" [overlapTriggerX]="false">
            <button kbq-dropdown-item>Vertical item</button>
        </kbq-dropdown>
    `
})
class TestApp {
    readonly plainTrigger = viewChild.required<KbqDropdownTrigger>('plainTrigger');
    readonly rootTrigger = viewChild.required<KbqDropdownTrigger>('rootTrigger');
    readonly nestedTrigger = viewChild.required<KbqDropdownTrigger>('nestedTrigger');
    readonly verticalTrigger = viewChild.required<KbqDropdownTrigger>('verticalTrigger');
}

describe('triage: explicit panelWidth on panels not matched to the trigger', () => {
    function setup() {
        TestBed.configureTestingModule({ imports: [TestApp] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const container = TestBed.inject(OverlayContainer).getContainerElement();
        const paneWith = (text: string) =>
            Array.from(container.querySelectorAll<HTMLElement>('.cdk-overlay-pane')).find((pane) =>
                pane.textContent?.includes(text)
            )!;

        return { fixture, paneWith };
    }

    it('control: a top-level panel gets the explicit width on its pane', () => {
        const { fixture, paneWith } = setup();

        fixture.componentInstance.plainTrigger().open();
        fixture.detectChanges();

        expect(paneWith('Plain item').style.width).toBe('300px');
    });

    it('DEFECT: a nested panel ignores [panelWidth]="300" and its CSS floor drops to 0px', () => {
        const { fixture, paneWith } = setup();

        fixture.componentInstance.rootTrigger().open();
        fixture.detectChanges();
        fixture.componentInstance.nestedTrigger().open();
        fixture.detectChanges();

        const pane = paneWith('Nested item');
        const panel = pane.querySelector<HTMLElement>('.kbq-dropdown__panel')!;

        expect(fixture.componentInstance.nestedTrigger().opened).toBe(true);
        expect(pane.style.width).toBe('');
        expect(panel.style.width).toBe('');
        expect(panel.style.getPropertyValue('--kbq-dropdown-size-container-width-min')).toBe('0px');
    });

    it('DEFECT: a panel with overlapTriggerY and without overlapTriggerX ignores [panelWidth]="300"', () => {
        const { fixture, paneWith } = setup();

        fixture.componentInstance.verticalTrigger().open();
        fixture.detectChanges();

        const pane = paneWith('Vertical item');
        const panel = pane.querySelector<HTMLElement>('.kbq-dropdown__panel')!;

        expect(pane.style.width).toBe('');
        expect(panel.style.getPropertyValue('--kbq-dropdown-size-container-width-min')).toBe('0px');
    });
});
