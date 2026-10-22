import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdown, KbqDropdownModule, KbqDropdownPositionX, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';

@Component({
    selector: 'test-app-bound-x-position',
    imports: [KbqSplitButtonModule, KbqButtonModule, KbqDropdownModule],
    template: `
        <kbq-split-button [panelAutoWidth]="panelAutoWidth">
            <button kbq-button>Action</button>
            <button kbq-button class="inner-trigger" [kbqDropdownTriggerFor]="dropdown">More</button>
        </kbq-split-button>

        <button kbq-button class="outside-trigger" [kbqDropdownTriggerFor]="dropdown">Outside</button>

        <kbq-dropdown #dropdown="kbqDropdown" [xPosition]="xPosition">
            <button kbq-dropdown-item>Item</button>
        </kbq-dropdown>
    `
})
class BoundXPosition {
    xPosition: KbqDropdownPositionX = 'after';
    panelAutoWidth = false;
}

describe('KbqSplitButton triage: xPosition overwrite', () => {
    let fixture: ComponentFixture<BoundXPosition>;

    const getDropdown = (): KbqDropdown =>
        fixture.debugElement.query(By.directive(KbqDropdown)).injector.get(KbqDropdown);

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [BoundXPosition] });
        fixture = TestBed.createComponent(BoundXPosition);
        fixture.detectChanges();
    });

    it('DEFECT: the xPosition bound by the consumer on the dropdown is overwritten with "before"', () => {
        expect(fixture.componentInstance.xPosition).toBe('after');
        expect(getDropdown().xPosition()).toBe('before');
    });

    it('DEFECT: a trigger outside the split button that shares the dropdown also gets "before"', () => {
        const outsideTrigger = fixture.debugElement.query(By.css('.outside-trigger')).injector.get(KbqDropdownTrigger);

        expect(outsideTrigger.dropdown().xPosition()).toBe('before');
    });

    it('DEFECT: toggling panelAutoWidth overwrites an xPosition the consumer changed later', () => {
        fixture.componentInstance.xPosition = 'center';
        fixture.detectChanges();

        expect(getDropdown().xPosition()).toBe('center');

        fixture.componentInstance.panelAutoWidth = true;
        fixture.detectChanges();

        expect(fixture.componentInstance.xPosition).toBe('center');
        expect(getDropdown().xPosition()).toBe('before');
    });
});
