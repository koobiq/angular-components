import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

import {
    KbqEmptyState,
    KbqEmptyStateTitle,
    KbqEmptyStateText,
    KbqEmptyStateActions,
    KbqEmptyStateModule, KbqEmptyStateIcon
} from './index';


describe('KbqEmptyState', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserModule,
                CommonModule,
                KbqEmptyStateModule
            ],
            declarations: [EmptyStateWithParams]
        });

        TestBed.compileComponents();
    }));

    it('should init and set classes', () => {
        const fixture = TestBed.createComponent(EmptyStateWithParams);

        const emptyState = fixture.debugElement.query(By.directive(KbqEmptyState))
        const emptyStateIcon = fixture.debugElement.query(By.directive(KbqEmptyStateIcon))
        const emptyStateTitle = fixture.debugElement.query(By.directive(KbqEmptyStateTitle))
        const emptyStateText = fixture.debugElement.query(By.directive(KbqEmptyStateText))
        const emptyStateActions = fixture.debugElement.query(By.directive(KbqEmptyStateActions))

        expect(emptyState.nativeElement.classList).toContain('kbq-empty-state');
        expect(emptyStateIcon.nativeElement.classList).toContain('kbq-empty-state-icon');
        expect(emptyStateTitle.nativeElement.classList).toContain('kbq-empty-state-title');
        expect(emptyStateText.nativeElement.classList).toContain('kbq-empty-state-text');
        expect(emptyStateActions.nativeElement.classList).toContain('kbq-empty-state-actions');
    });
});


@Component({
    selector: 'empty-state-with-params',
    template: `
        <kbq-empty-state>
            <i kbq-icon-item="mc-bell_16" [fade]="true" [big]="true" [color]="'contrast'" kbq-empty-state-icon></i>
            <div kbq-empty-state-title>kbq-empty-state-title</div>
            <div kbq-empty-state-text>kbq-empty-state-text</div>
            <div kbq-empty-state-actions>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme"> Action 1</button>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme"> Action 2</button>
                <button kbq-button [kbqStyle]="styles.Transparent" [color]="colors.Theme"> Action 3</button>
            </div>
        </kbq-empty-state>`
})
class EmptyStateWithParams {
    protected readonly styles = KbqButtonStyles;
    protected readonly colors = KbqComponentColors;
}
