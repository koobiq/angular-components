import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { DOWN_ARROW, SPACE, UP_ARROW } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent } from '@koobiq/cdk/testing';
import { KbqListModule, KbqListSelection } from './index';

// should be placed in 'KbqListSelection with forms' section when it will not be skipped
describe('should update model after keyboard interaction with multiple mode = checkbox', () => {
    let fixture: ComponentFixture<SelectionListMultipleCheckbox>;
    let selectionList: DebugElement;
    let ngModel: NgModel;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqListModule, FormsModule],
            declarations: [SelectionListMultipleCheckbox]
        });

        TestBed.compileComponents();
    }));

    beforeEach(waitForAsync(() => {
        fixture = TestBed.createComponent(SelectionListMultipleCheckbox);
        fixture.detectChanges();

        selectionList = fixture.debugElement.query(By.directive(KbqListSelection));
        ngModel = selectionList.injector.get<NgModel>(NgModel);
    }));

    it('should update model when items selected by pressing SHIFT + arrows', () => {
        const manager = selectionList.componentInstance.keyManager;

        const SPACE_EVENT: KeyboardEvent = createKeyboardEvent('keydown', SPACE);
        const DOWN_EVENT: KeyboardEvent = createKeyboardEvent('keydown', DOWN_ARROW);
        const UP_EVENT: KeyboardEvent = createKeyboardEvent('keydown', UP_ARROW);

        Object.defineProperty(UP_EVENT, 'shiftKey', { get: () => true });
        Object.defineProperty(DOWN_EVENT, 'shiftKey', { get: () => true });

        expect(ngModel.value.length).toBe(0);

        manager.setFirstItemActive();
        fixture.detectChanges();

        selectionList.componentInstance.onKeyDown(SPACE_EVENT);
        selectionList.componentInstance.onKeyDown(DOWN_EVENT);
        selectionList.componentInstance.onKeyDown(DOWN_EVENT);

        fixture.detectChanges();

        expect(ngModel.value.length).toBe(3);

        selectionList.componentInstance.onKeyDown(SPACE_EVENT);
        selectionList.componentInstance.onKeyDown(UP_EVENT);

        fixture.detectChanges();

        expect(ngModel.value.length).toBe(1);
    });
});

@Component({
    template: `
        <kbq-list-selection multiple="checkbox" [autoSelect]="false" [noUnselectLast]="false" [(ngModel)]="model">
            <kbq-list-option [value]="'value1'">value1</kbq-list-option>
            <kbq-list-option [value]="'value2'">value2</kbq-list-option>
            <kbq-list-option [value]="'value3'">value3</kbq-list-option>
            <kbq-list-option [value]="'value4'">value4</kbq-list-option>
            <kbq-list-option [value]="'disabled option'" [disabled]="true">disabled option</kbq-list-option>
        </kbq-list-selection>
    `
})
class SelectionListMultipleCheckbox {
    model = [];
}
