import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SLASH } from '@koobiq/components/core';
import { KbqNavbarModule, KbqVerticalNavbar } from '@koobiq/components/navbar';

/** `dispatchKeyboardEvent` cannot carry modifiers. */
const dispatchShortcut = (target: HTMLElement, init: KeyboardEventInit): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });

    Object.defineProperty(event, 'keyCode', { get: () => SLASH });

    target.dispatchEvent(event);

    return event;
};

@Component({
    selector: 'test-shortcut-app',
    imports: [KbqNavbarModule],
    template: `
        <textarea aria-label="Code editor"></textarea>

        <kbq-vertical-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item>
                    <kbq-navbar-title>First</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
            <button kbq-navbar-toggle></button>
        </kbq-vertical-navbar>
    `
})
class TestShortcutApp {}

describe('triage: the Ctrl+/ shortcut', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [TestShortcutApp] }));

    const setup = () => {
        const fixture = TestBed.createComponent(TestShortcutApp);

        fixture.detectChanges();

        const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
            .componentInstance as KbqVerticalNavbar;
        const editor = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

        editor.focus();

        return { fixture, navbar, editor };
    };

    it('DEFECT: Ctrl+/ typed into a text field outside the navbar toggles it, without preventing the default', () => {
        const { navbar, editor } = setup();

        expect(document.activeElement).toBe(editor);
        expect(navbar.expanded()).toBe(false);

        const event = dispatchShortcut(editor, { ctrlKey: true });

        expect(navbar.expanded()).toBe(true);
        expect(event.defaultPrevented).toBe(false);
    });

    it('DEFECT: Ctrl+Shift+/ and Ctrl+Alt+/ toggle the navbar too', () => {
        const { navbar, editor } = setup();

        dispatchShortcut(editor, { ctrlKey: true, shiftKey: true });

        expect(navbar.expanded()).toBe(true);

        dispatchShortcut(editor, { ctrlKey: true, altKey: true });

        expect(navbar.expanded()).toBe(false);
    });
});
