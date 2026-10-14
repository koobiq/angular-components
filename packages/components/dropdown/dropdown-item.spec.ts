import { Component } from '@angular/core';
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

const getShimmer = (): HTMLElement => {
    const fixture = TestBed.createComponent(ItemInProgress);

    fixture.detectChanges();

    return fixture.nativeElement.querySelector('.kbq-dropdown-item.kbq-progress .kbq-dropdown-item-overlay');
};

describe(KbqDropdownItem.name, () => {
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
