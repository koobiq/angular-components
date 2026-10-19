import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_ANIMATIONS_CONFIG } from '@koobiq/components/core';
import { KbqDropdownItem } from './dropdown-item.component';

@Component({
    selector: 'test-dropdown-item-in-progress',
    imports: [KbqDropdownItem],
    template: `
        <div kbq-dropdown-item [progress]="true">Export</div>
    `
})
class ItemInProgress {}

@Component({
    selector: 'test-dropdown-item-disabled',
    imports: [KbqDropdownItem],
    template: `
        <div kbq-dropdown-item [disabled]="disabled()">Export</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DisableableItem {
    readonly disabled = signal(false);
}

const getShimmer = (): HTMLElement => {
    const fixture = TestBed.createComponent(ItemInProgress);

    fixture.detectChanges();

    return fixture.nativeElement.querySelector('.kbq-dropdown-item.kbq-progress .kbq-dropdown-item-overlay');
};

describe(KbqDropdownItem.name, () => {
    it('should reflect the disabled state in its attributes and class', () => {
        const fixture = TestBed.createComponent(DisableableItem);
        const item: HTMLElement = fixture.nativeElement.querySelector('.kbq-dropdown-item');
        const expectDisabled = (disabled: boolean) => {
            expect(item.getAttribute('disabled')).toBe(disabled ? 'true' : null);
            expect(item.getAttribute('aria-disabled')).toBe(disabled ? 'true' : null);
            expect(item.getAttribute('tabindex')).toBe(disabled ? '-1' : '0');
            expect(item.classList.contains('kbq-disabled')).toBe(disabled);
        };

        fixture.detectChanges();

        expectDisabled(false);

        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();

        expectDisabled(true);

        fixture.componentInstance.disabled.set(false);
        fixture.detectChanges();

        expectDisabled(false);
    });

    describe('progress shimmer', () => {
        it('should move by default', () => {
            expect(getShimmer().classList).not.toContain('kbq-animations-disabled');
        });

        it('should stand still when animations are disabled', () => {
            TestBed.configureTestingModule({
                providers: [{ provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } }]
            });

            expect(getShimmer().classList).toContain('kbq-animations-disabled');
        });
    });
});
