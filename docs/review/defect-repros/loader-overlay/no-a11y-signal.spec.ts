import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

@Component({
    selector: 'test-app',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="covered-block">
            <button type="button" class="covered-button">Save</button>
            <input class="covered-input" />

            <kbq-loader-overlay text="Loading" caption="Please wait" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestApp {}

describe('KbqLoaderOverlay triage: assistive technology signal', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TestApp] });
    });

    it('DEFECT: a shown overlay gives no busy, live or role signal and leaves covered controls focusable', () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const root = fixture.nativeElement as HTMLElement;
        const parent = root.querySelector('.covered-block') as HTMLElement;
        const overlay = root.querySelector('kbq-loader-overlay') as HTMLElement;
        const spinner = root.querySelector('kbq-progress-spinner') as HTMLElement;
        const button = root.querySelector('.covered-button') as HTMLButtonElement;
        const input = root.querySelector('.covered-input') as HTMLInputElement;

        // The overlay is shown and marks its parent.
        expect(overlay).not.toBeNull();
        expect(spinner).not.toBeNull();
        expect(parent.classList).toContain('kbq-loader-overlay_parent');

        // No busy state on the covered block.
        expect(parent.hasAttribute('aria-busy')).toBe(false);

        // No role, live region or name anywhere in the overlay.
        expect(overlay.hasAttribute('role')).toBe(false);
        expect(overlay.hasAttribute('aria-live')).toBe(false);
        expect(overlay.querySelector('[role], [aria-live], [aria-busy], [aria-label]')).toBeNull();
        expect(spinner.hasAttribute('role')).toBe(false);
        expect(spinner.hasAttribute('aria-label')).toBe(false);
        expect(spinner.hasAttribute('aria-valuetext')).toBe(false);

        // The covered content is neither inert nor hidden from assistive technology.
        expect(parent.closest('[inert]')).toBeNull();
        expect(button.hasAttribute('inert')).toBe(false);
        expect(button.closest('[aria-hidden="true"]')).toBeNull();
        expect(button.tabIndex).toBe(0);
        expect(input.tabIndex).toBe(0);

        // Keyboard focus still reaches the covered controls.
        button.focus();
        expect(document.activeElement).toBe(button);

        input.focus();
        expect(document.activeElement).toBe(input);
    });
});
