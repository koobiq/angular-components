import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    KbqEmptyState,
    KbqEmptyStateActions,
    KbqEmptyStateIcon,
    KbqEmptyStateModule,
    KbqEmptyStateText,
    KbqEmptyStateTitle
} from './index';

describe('KbqEmptyState', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                KbqEmptyStateModule,
                KbqIconModule,
                KbqButtonModule,
                EmptyStateWithParams
            ]
        }).compileComponents();
    });

    it('should init and set classes', () => {
        const fixture = TestBed.createComponent(EmptyStateWithParams);

        fixture.detectChanges();

        const emptyState = fixture.debugElement.query(By.directive(KbqEmptyState));
        const emptyStateIcon = fixture.debugElement.query(By.directive(KbqEmptyStateIcon));
        const emptyStateTitle = fixture.debugElement.query(By.directive(KbqEmptyStateTitle));
        const emptyStateText = fixture.debugElement.query(By.directive(KbqEmptyStateText));
        const emptyStateActions = fixture.debugElement.query(By.directive(KbqEmptyStateActions));

        expect(emptyState.nativeElement.classList).toContain('kbq-empty-state');
        expect(emptyState.nativeElement.classList).toContain('kbq-empty-state_normal');
        expect(emptyStateIcon.nativeElement.classList).toContain('kbq-empty-state-icon');
        expect(emptyStateTitle.nativeElement.classList).toContain('kbq-empty-state-title');
        expect(emptyStateText.nativeElement.classList).toContain('kbq-empty-state-text');
        expect(emptyStateActions.nativeElement.classList).toContain('kbq-empty-state-actions');
    });
});

@Component({
    selector: 'empty-state-with-params',
    imports: [CommonModule, KbqEmptyStateModule, KbqIconModule, KbqButtonModule],
    template: `
        <kbq-empty-state>
            <i kbq-icon-item="kbq-bell_16" kbq-empty-state-icon [fade]="true" [big]="true" [color]="'contrast'"></i>
            <div kbq-empty-state-title>kbq-empty-state-title</div>
            <div kbq-empty-state-text>kbq-empty-state-text</div>
            <div kbq-empty-state-actions>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme">Action 1</button>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme">Action 2</button>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme">Action 3</button>
            </div>
        </kbq-empty-state>
    `
})
class EmptyStateWithParams {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;
}
