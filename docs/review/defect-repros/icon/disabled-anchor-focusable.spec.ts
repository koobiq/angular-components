import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, ENTER } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    imports: [KbqIconModule],
    template: `
        <a kbq-icon-button="kbq-gear_16" aria-label="Settings" href="#settings" disabled></a>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DisabledAnchorIconButton {}

describe('triage: disabled KbqIconButton on <a href>', () => {
    it('DEFECT: a disabled anchor icon button stays focusable and its keyboard/click activation is not prevented', () => {
        const fixture = TestBed.createComponent(DisabledAnchorIconButton);

        fixture.detectChanges();

        const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');

        expect(anchor.classList).toContain('kbq-disabled');
        expect(anchor.getAttribute('aria-disabled')).toBe('true');
        // Only the attribute is removed; an `<a href>` is in the tab order without one.
        expect(anchor.hasAttribute('tabindex')).toBe(false);
        expect(anchor.tabIndex).toBe(0);

        anchor.focus();
        expect(document.activeElement).toBe(anchor);

        expect(dispatchKeyboardEvent(anchor, 'keydown', ENTER, undefined, 'Enter').defaultPrevented).toBe(false);

        // Enter on a focused link fires a click; nothing in the icon button cancels its navigation. The
        // document listener records the outcome after every other handler and then stops jsdom from navigating.
        let clickPrevented: boolean | undefined;
        const guard = (event: Event) => {
            clickPrevented = event.defaultPrevented;
            event.preventDefault();
        };

        document.addEventListener('click', guard);
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        document.removeEventListener('click', guard);

        expect(clickPrevented).toBe(false);
    });
});
