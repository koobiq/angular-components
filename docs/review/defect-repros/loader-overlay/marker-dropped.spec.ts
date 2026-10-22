import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqLoaderOverlay, KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

@Component({
    selector: 'overlay-only-import',
    imports: [KbqLoaderOverlay],
    template: `
        <kbq-loader-overlay>
            <span class="custom-indicator" kbq-loader-overlay-indicator>Custom indicator</span>
            <div class="custom-text" kbq-loader-overlay-text>Custom text</div>
            <div class="custom-caption" kbq-loader-overlay-caption>Custom caption</div>
        </kbq-loader-overlay>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class OverlayOnlyImport {}

@Component({
    selector: 'nested-markers',
    imports: [KbqLoaderOverlayModule],
    template: `
        <kbq-loader-overlay text="Bound text" caption="Bound caption">
            <div class="wrapper">
                <span class="custom-indicator" kbq-loader-overlay-indicator>Custom indicator</span>
                <span class="custom-text" kbq-loader-overlay-text>Nested text</span>
                <span class="custom-caption" kbq-loader-overlay-caption>Nested caption</span>
            </div>
        </kbq-loader-overlay>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class NestedMarkers {}

describe('KbqLoaderOverlay triage: marker attributes', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [OverlayOnlyImport, NestedMarkers] });
    });

    it('DEFECT: markers whose directives are not imported are silently dropped and the default part is shown', () => {
        const fixture = TestBed.createComponent(OverlayOnlyImport);

        fixture.detectChanges();

        const root = fixture.nativeElement as HTMLElement;
        const overlay = root.querySelector('kbq-loader-overlay') as HTMLElement;

        // The default spinner is shown instead of the marked indicator.
        expect(overlay.querySelector('kbq-progress-spinner')).not.toBeNull();
        // The marked elements are not in the document at all.
        expect(root.querySelector('.custom-indicator')).toBeNull();
        expect(root.querySelector('.custom-text')).toBeNull();
        expect(root.querySelector('.custom-caption')).toBeNull();
        expect(overlay.textContent).not.toContain('Custom');
        expect(overlay.classList).toContain('kbq-loader-overlay_empty');
    });

    it('DEFECT: markers nested in a wrapper hide the default parts but are not projected, so nothing shows', () => {
        const fixture = TestBed.createComponent(NestedMarkers);

        fixture.detectChanges();

        const root = fixture.nativeElement as HTMLElement;
        const overlay = root.querySelector('kbq-loader-overlay') as HTMLElement;

        // The content queries see the nested markers, so the default parts are hidden...
        expect(overlay.classList).not.toContain('kbq-loader-overlay_empty');
        expect(overlay.querySelector('kbq-progress-spinner')).toBeNull();
        expect(overlay.textContent).not.toContain('Bound text');
        expect(overlay.textContent).not.toContain('Bound caption');
        // ...but projection matches only top-level nodes, so the nested markers are not rendered either.
        expect(root.querySelector('.wrapper')).toBeNull();
        expect(root.querySelector('.custom-indicator')).toBeNull();
        expect(root.querySelector('.custom-text')).toBeNull();
        expect(root.querySelector('.custom-caption')).toBeNull();
        expect(overlay.textContent!.trim()).toBe('');
    });
});
