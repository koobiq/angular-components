import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqSidebar, KbqSidebarModule, SidebarPositions } from '@koobiq/components/sidebar';

@Component({
    imports: [KbqSidebarModule],
    template: `
        <kbq-sidebar [position]="position" [useStateSaving]="false">
            <div kbq-sidebar-opened>opened</div>
            <div kbq-sidebar-closed>closed</div>
        </kbq-sidebar>

        <div contenteditable="true" data-testid="editor">rich text</div>
        <input data-testid="input" />
    `
})
class TestApp {
    readonly sidebar = viewChild.required(KbqSidebar);

    position = SidebarPositions.Left;
}

const keypress = (init: KeyboardEventInit): KeyboardEvent =>
    new KeyboardEvent('keypress', { bubbles: true, cancelable: true, ...init });

describe('KbqSidebar shortcut filters (triage)', () => {
    let fixture: ComponentFixture<TestApp>;
    let sidebar: KbqSidebar;

    beforeEach(async () => {
        TestBed.configureTestingModule({ imports: [TestApp] });

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();
        await fixture.whenStable();

        sidebar = fixture.componentInstance.sidebar();
    });

    it('control: typing [ in an input does not toggle', () => {
        const input: HTMLInputElement = fixture.nativeElement.querySelector('[data-testid="input"]');

        input.dispatchEvent(keypress({ code: 'BracketLeft', key: '[' }));

        expect(sidebar.opened).toBe(true);
    });

    it('DEFECT: Shift + [ (typing "{") toggles the left sidebar', () => {
        // A real keypress carries the character code (123 for "{"), never the keyCode of Shift.
        document.dispatchEvent(
            keypress({ code: 'BracketLeft', key: '{', shiftKey: true, keyCode: 123, charCode: 123 })
        );

        expect(sidebar.opened).toBe(false);
    });

    it('DEFECT: Option + [ on macOS (typing a quote) toggles the left sidebar', () => {
        document.dispatchEvent(
            keypress({ code: 'BracketLeft', key: '“', altKey: true, keyCode: 8220, charCode: 8220 })
        );

        expect(sidebar.opened).toBe(false);
    });

    it('DEFECT: typing [ in a contenteditable editor toggles the left sidebar', () => {
        const editor: HTMLElement = fixture.nativeElement.querySelector('[data-testid="editor"]');

        editor.dispatchEvent(keypress({ code: 'BracketLeft', key: '[', keyCode: 91, charCode: 91 }));

        expect(sidebar.opened).toBe(false);
    });
});
