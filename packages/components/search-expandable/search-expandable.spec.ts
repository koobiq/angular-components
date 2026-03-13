import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { KbqButton } from '@koobiq/components/button';
import { KbqInput } from '@koobiq/components/input';
import { KbqSearchExpandable, KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

describe('KbqSearchExpandable', () => {
    let debugElement: DebugElement;
    let nativeElement: HTMLElement;
    let fixture: ComponentFixture<TestSearchExpandable>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [KbqSearchExpandableModule, TestSearchExpandable, TestSearchExpandableWithFormControl]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestSearchExpandable);
        debugElement = fixture.debugElement.query(By.directive(KbqSearchExpandable));
        nativeElement = debugElement.nativeElement;
        fixture.detectChanges();
    });

    it('should init', () => {
        expect(nativeElement.classList.contains('kbq-search-expandable')).toBe(true);
    });

    it('should toggle', () => {
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(1);
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(0);

        debugElement.query(By.css('.kbq-search-expandable__button')).nativeElement.click();
        fixture.detectChanges();

        expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(0);
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(1);

        debugElement.query(By.css('.kbq-icon-button.kbq-icon.kbq-suffix')).nativeElement.click();
        fixture.detectChanges();

        expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(1);
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(0);
    });

    it('should open by [isOpened]', () => {
        fixture.componentInstance.openedState = true;
        fixture.detectChanges();

        expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(0);
        expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(1);
    });

    it('disabled state', () => {
        expect(debugElement.query(By.directive(KbqInput))).toBe(null);
        expect(debugElement.query(By.directive(KbqButton)).nativeElement.hasAttribute('disabled')).toBe(false);

        fixture.componentInstance.disabled = true;
        fixture.detectChanges();
        expect(debugElement.query(By.directive(KbqButton)).nativeElement.hasAttribute('disabled')).toBe(true);

        fixture.componentInstance.openedState = true;
        fixture.detectChanges();

        expect(debugElement.query(By.directive(KbqButton))).toBe(null);
        expect(debugElement.query(By.directive(KbqInput)).nativeElement.hasAttribute('disabled')).toBe(true);
    });

    describe('with formControl', () => {
        let fixture: ComponentFixture<TestSearchExpandableWithFormControl>;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestSearchExpandableWithFormControl);
            debugElement = fixture.debugElement.query(By.directive(KbqSearchExpandable));
            nativeElement = debugElement.nativeElement;
            fixture.detectChanges();
        });

        it('disabled state', () => {
            expect(debugElement.query(By.directive(KbqInput))).toBe(null);
            expect(debugElement.componentInstance.disabled).toBe(false);

            fixture.componentInstance.searchControl.disable();
            fixture.componentInstance.openedState = true;
            fixture.detectChanges();

            expect(debugElement.componentInstance.disabled).toBe(true);
            expect(debugElement.query(By.directive(KbqButton))).toBe(null);
            expect(debugElement.query(By.directive(KbqInput)).nativeElement.hasAttribute('disabled')).toBe(true);
        });
    });
});

@Component({
    standalone: true,
    selector: 'test-app',
    imports: [KbqSearchExpandableModule, FormsModule],
    template: `
        <kbq-search-expandable [isOpened]="openedState" [disabled]="disabled" [(ngModel)]="search" />
    `
})
class TestSearchExpandable {
    openedState: boolean = false;
    disabled: boolean = false;
    search: string;
}

@Component({
    standalone: true,
    selector: 'test-app-search-expandable-with-form-control',
    imports: [KbqSearchExpandableModule, ReactiveFormsModule],
    template: `
        <kbq-search-expandable [isOpened]="openedState" [formControl]="searchControl" />
    `
})
class TestSearchExpandableWithFormControl {
    searchControl = new FormControl<string>('');

    openedState: boolean = false;
}
