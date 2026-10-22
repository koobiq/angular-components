import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqContentPanelContainer, KbqContentPanelModule } from '@koobiq/components/content-panel';

@Component({
    selector: 'test-app',
    imports: [KbqContentPanelModule],
    template: `
        <kbq-content-panel-container [useStateSaving]="false">
            <button id="trigger" type="button" (click)="container().open()">Open</button>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Title</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>body</kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `
})
class TestApp {
    readonly container = viewChild.required(KbqContentPanelContainer);
}

describe('content-panel triage: accessibility and focus', () => {
    let fixture: ComponentFixture<TestApp>;

    const query = <T extends Element>(selector: string): T | null => fixture.nativeElement.querySelector(selector);

    beforeEach(async () => {
        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('DEFECT: the opened panel has no role or accessible name and opening leaves focus on the trigger', async () => {
        const trigger = query<HTMLButtonElement>('#trigger')!;

        trigger.focus();
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const panel = query<HTMLElement>('.kbq-content-panel-container__panel')!;
        const contentPanel = query<HTMLElement>('kbq-content-panel')!;

        expect(panel).not.toBeNull();

        for (const element of [panel, contentPanel]) {
            expect(element.getAttribute('role')).toBeNull();
            expect(element.getAttribute('aria-label')).toBeNull();
            expect(element.getAttribute('aria-labelledby')).toBeNull();
        }

        expect(document.activeElement).toBe(trigger);
    });

    it('DEFECT: closing with the close button drops focus to body instead of returning it to the trigger', async () => {
        const trigger = query<HTMLButtonElement>('#trigger')!;

        trigger.focus();
        trigger.click();
        fixture.detectChanges();
        await fixture.whenStable();

        const closeButton = query<HTMLButtonElement>('.kbq-content-panel-header__close-button')!;

        closeButton.focus();
        expect(document.activeElement).toBe(closeButton);

        closeButton.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(query('.kbq-content-panel-container__panel')).toBeNull();
        expect(closeButton.isConnected).toBe(false);
        expect(document.activeElement).toBe(document.body);
    });
});
