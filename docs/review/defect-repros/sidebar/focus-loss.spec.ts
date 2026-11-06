import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqSidebar, KbqSidebarModule, SidebarPositions } from '@koobiq/components/sidebar';

@Component({
    imports: [KbqSidebarModule],
    template: `
        <kbq-sidebar #sidebarRef="kbqSidebar" [position]="position" [useStateSaving]="false">
            <div kbq-sidebar-opened>
                <button data-testid="collapse" type="button" (click)="sidebarRef.toggle()">Collapse</button>
            </div>
            <div kbq-sidebar-closed>
                <button data-testid="expand" type="button" (click)="sidebarRef.toggle()">Expand</button>
            </div>
        </kbq-sidebar>
    `
})
class TestApp {
    readonly sidebar = viewChild.required(KbqSidebar);

    position = SidebarPositions.Left;
}

describe('KbqSidebar focus and ARIA (triage)', () => {
    let fixture: ComponentFixture<TestApp>;
    let sidebar: KbqSidebar;
    let host: HTMLElement;

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
        await fixture.whenStable();

        sidebar = fixture.componentInstance.sidebar();
        host = fixture.nativeElement.querySelector('kbq-sidebar');
    });

    it('DEFECT: closing from a button inside the opened content drops focus to <body>', async () => {
        const collapse: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="collapse"]');

        collapse.focus();
        expect(document.activeElement).toBe(collapse);

        collapse.click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(sidebar.opened).toBe(false);
        expect(fixture.nativeElement.querySelector('[data-testid="expand"]')).not.toBeNull();
        expect(collapse.isConnected).toBe(false);
        expect(document.activeElement).toBe(document.body);
    });

    it('DEFECT: closing with the [ shortcut while focus is inside the opened content drops focus to <body>', async () => {
        const collapse: HTMLButtonElement = fixture.nativeElement.querySelector('[data-testid="collapse"]');

        collapse.focus();
        collapse.dispatchEvent(new KeyboardEvent('keypress', { code: 'BracketLeft', key: '[', bubbles: true }));
        fixture.detectChanges();
        await fixture.whenStable();

        expect(sidebar.opened).toBe(false);
        expect(document.activeElement).toBe(document.body);
    });

    it('DEFECT: the host exposes no role and no ARIA state in either state', async () => {
        const ariaOf = (element: Element) =>
            element.getAttributeNames().filter((name) => name === 'role' || name.startsWith('aria-'));

        expect(ariaOf(host)).toEqual([]);

        sidebar.toggle();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(ariaOf(host)).toEqual([]);
    });
});
