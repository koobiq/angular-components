import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

const PARENT_CLASS = 'kbq-loader-overlay_parent';

@Component({
    selector: 'two-overlays',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="shared-parent">
            @if (first()) {
                <kbq-loader-overlay class="first-overlay" text="First" />
            }
            @if (second()) {
                <kbq-loader-overlay class="second-overlay" text="Second" />
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TwoOverlays {
    readonly first = signal(true);
    readonly second = signal(true);
}

@Component({
    selector: 'consumer-parent-class',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="kbq-loader-overlay_parent consumer-parent">
            @if (shown()) {
                <kbq-loader-overlay text="Loading" />
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ConsumerParentClass {
    readonly shown = signal(true);
}

describe('KbqLoaderOverlay triage: shared parent class', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [TwoOverlays, ConsumerParentClass] });
    });

    it('DEFECT: destroying one of two overlays in a parent removes the parent class while the other is shown', () => {
        const fixture = TestBed.createComponent(TwoOverlays);

        fixture.detectChanges();

        const root = fixture.nativeElement as HTMLElement;
        const parent = root.querySelector('.shared-parent') as HTMLElement;

        expect(root.querySelectorAll('kbq-loader-overlay').length).toBe(2);
        expect(parent.classList).toContain(PARENT_CLASS);

        fixture.componentInstance.first.set(false);
        fixture.detectChanges();

        expect(root.querySelector('.first-overlay')).toBeNull();
        expect(root.querySelector('.second-overlay')).not.toBeNull();
        expect(parent.classList).not.toContain(PARENT_CLASS);
    });

    it('DEFECT: destroying the overlay removes the parent class the consumer put there', () => {
        const fixture = TestBed.createComponent(ConsumerParentClass);

        fixture.detectChanges();

        const parent = (fixture.nativeElement as HTMLElement).querySelector('.consumer-parent') as HTMLElement;

        expect(parent.classList).toContain(PARENT_CLASS);

        fixture.componentInstance.shown.set(false);
        fixture.detectChanges();

        expect(parent.querySelector('kbq-loader-overlay')).toBeNull();
        expect(parent.classList).not.toContain(PARENT_CLASS);
    });
});
