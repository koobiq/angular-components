import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { KbqButton } from '@koobiq/components/button';
import { KbqInput } from '@koobiq/components/input';
import { defaultValue, KbqSearchExpandable, KbqSearchExpandableModule } from '@koobiq/components/search-expandable';

describe('KbqSearchExpandable', () => {
    let debugElement: DebugElement;
    let nativeElement: HTMLElement;
    let fixture: ComponentFixture<TestSearchExpandable>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                KbqSearchExpandableModule,
                TestSearchExpandable,
                TestSearchExpandableWithFormControl,
                TestSearchExpandableWithPlaceholder,
                TestSearchExpandableWithTooltip
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestSearchExpandable);
        debugElement = fixture.debugElement.query(By.directive(KbqSearchExpandable));
        nativeElement = debugElement.nativeElement;
        fixture.detectChanges();
    });

    describe('initialization', () => {
        it('should have kbq-search-expandable class', () => {
            expect(nativeElement.classList.contains('kbq-search-expandable')).toBe(true);
        });

        it('should show button when closed', () => {
            expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(1);
            expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(0);
        });

        it('should not have opened class by default', () => {
            expect(nativeElement.classList.contains('kbq-search-expandable_opened')).toBe(false);
        });
    });

    describe('toggle', () => {
        it('should open on button click', () => {
            debugElement.query(By.css('.kbq-search-expandable__button')).nativeElement.click();
            fixture.detectChanges();

            expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(0);
            expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(1);
        });

        it('should close on close icon click', () => {
            debugElement.query(By.css('.kbq-search-expandable__button')).nativeElement.click();
            fixture.detectChanges();

            debugElement.query(By.css('.kbq-icon-button.kbq-icon.kbq-suffix')).nativeElement.click();
            fixture.detectChanges();

            expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(1);
            expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(0);
        });

        it('should add opened class when opened', () => {
            expect(nativeElement.classList.contains('kbq-search-expandable_opened')).toBe(false);

            fixture.componentInstance.openedState = true;
            fixture.detectChanges();

            expect(nativeElement.classList.contains('kbq-search-expandable_opened')).toBe(true);
        });

        it('should not toggle when disabled', () => {
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            debugElement.query(By.css('.kbq-search-expandable__button')).nativeElement.click();
            fixture.detectChanges();

            expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(1);
            expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(0);
        });

        it('should reset value when closing', fakeAsync(() => {
            fixture.componentInstance.openedState = true;
            fixture.detectChanges();

            const component = debugElement.componentInstance as KbqSearchExpandable;

            component.value.next('some value');
            tick(300);
            fixture.detectChanges();

            component.toggle();
            fixture.detectChanges();

            expect(component.value.getValue()).toBe(defaultValue);
        }));

        it('should emit isOpenedChange on toggle', () => {
            const component = debugElement.componentInstance as KbqSearchExpandable;
            const spy = jest.fn();

            component.isOpenedChange.subscribe(spy);

            component.toggle();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith(true);

            component.toggle();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith(false);
        });
    });

    describe('isOpened input', () => {
        it('should open by [isOpened]', () => {
            fixture.componentInstance.openedState = true;
            fixture.detectChanges();

            expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(0);
            expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(1);
        });
    });

    describe('disabled state', () => {
        it('should disable button when disabled', () => {
            expect(debugElement.query(By.directive(KbqButton)).nativeElement.hasAttribute('disabled')).toBe(false);

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(debugElement.query(By.directive(KbqButton)).nativeElement.hasAttribute('disabled')).toBe(true);
        });

        it('should disable input when opened and disabled', () => {
            fixture.componentInstance.disabled = true;
            fixture.componentInstance.openedState = true;
            fixture.detectChanges();

            expect(debugElement.query(By.directive(KbqButton))).toBe(null);
            expect(debugElement.query(By.directive(KbqInput)).nativeElement.hasAttribute('disabled')).toBe(true);
        });

        it('should not show input when closed', () => {
            expect(debugElement.query(By.directive(KbqInput))).toBe(null);
        });
    });

    describe('placeholder', () => {
        it('should use localeData placeholder by default', () => {
            const component = debugElement.componentInstance as KbqSearchExpandable;

            expect(component.placeholder).toBeTruthy();
            expect(component.placeholder).toBe(component.localeData.placeholder);
        });

        it('should render localeData placeholder in the input', () => {
            fixture.componentInstance.openedState = true;
            fixture.detectChanges();

            const component = debugElement.componentInstance as KbqSearchExpandable;
            const inputEl = debugElement.query(By.css('input')).nativeElement;

            expect(inputEl.placeholder).toBe(component.localeData.placeholder);
        });

        it('should use custom placeholder when provided', () => {
            const placeholderFixture = TestBed.createComponent(TestSearchExpandableWithPlaceholder);

            placeholderFixture.detectChanges();

            const placeholderDebug = placeholderFixture.debugElement.query(By.directive(KbqSearchExpandable));
            const component = placeholderDebug.componentInstance as KbqSearchExpandable;

            expect(component.placeholder).toBe('Custom search...');
        });

        it('should render custom placeholder in the input element', () => {
            const placeholderFixture = TestBed.createComponent(TestSearchExpandableWithPlaceholder);

            placeholderFixture.componentInstance.openedState = true;
            placeholderFixture.detectChanges();

            const placeholderDebug = placeholderFixture.debugElement.query(By.directive(KbqSearchExpandable));
            const inputEl = placeholderDebug.query(By.css('input')).nativeElement;

            expect(inputEl.placeholder).toBe('Custom search...');
        });

        it('should fall back to localeData when placeholder is reset to undefined', () => {
            const placeholderFixture = TestBed.createComponent(TestSearchExpandableWithPlaceholder);

            placeholderFixture.detectChanges();

            const placeholderDebug = placeholderFixture.debugElement.query(By.directive(KbqSearchExpandable));
            const component = placeholderDebug.componentInstance as KbqSearchExpandable;

            expect(component.placeholder).toBe('Custom search...');

            component.placeholder = null;

            expect(component.placeholder).toBe(component.localeData.placeholder);
        });
    });

    describe('tooltipText', () => {
        it('should use localeData tooltip by default', () => {
            const component = debugElement.componentInstance as KbqSearchExpandable;

            expect(component.tooltipText).toBeTruthy();
            expect(component.tooltipText).toBe(component.localeData.tooltip);
        });

        it('should use custom tooltipText when provided', () => {
            const tooltipFixture = TestBed.createComponent(TestSearchExpandableWithTooltip);

            tooltipFixture.detectChanges();

            const tooltipDebug = tooltipFixture.debugElement.query(By.directive(KbqSearchExpandable));
            const component = tooltipDebug.componentInstance as KbqSearchExpandable;

            expect(component.tooltipText).toBe('Custom tooltip');
        });

        it('should fall back to localeData when tooltipText is reset to null', () => {
            const tooltipFixture = TestBed.createComponent(TestSearchExpandableWithTooltip);

            tooltipFixture.detectChanges();

            const tooltipDebug = tooltipFixture.debugElement.query(By.directive(KbqSearchExpandable));
            const component = tooltipDebug.componentInstance as KbqSearchExpandable;

            expect(component.tooltipText).toBe('Custom tooltip');

            component.tooltipText = null;

            expect(component.tooltipText).toBe(component.localeData.tooltip);
        });
    });

    describe('value', () => {
        it('should have default empty value', () => {
            const component = debugElement.componentInstance as KbqSearchExpandable;

            expect(component.value.getValue()).toBeFalsy();
        });

        it('should update value via ngModel', fakeAsync(() => {
            fixture.componentInstance.openedState = true;
            fixture.componentInstance.search = 'test value';
            fixture.detectChanges();
            flush();

            const component = debugElement.componentInstance as KbqSearchExpandable;

            expect(component.value.getValue()).toBe('test value');
        }));
    });

    describe('with formControl', () => {
        let formFixture: ComponentFixture<TestSearchExpandableWithFormControl>;

        beforeEach(() => {
            formFixture = TestBed.createComponent(TestSearchExpandableWithFormControl);
            debugElement = formFixture.debugElement.query(By.directive(KbqSearchExpandable));
            nativeElement = debugElement.nativeElement;
            formFixture.detectChanges();
        });

        it('should disable via formControl', () => {
            expect(debugElement.componentInstance.disabled).toBe(false);

            formFixture.componentInstance.searchControl.disable();
            formFixture.componentInstance.openedState = true;
            formFixture.detectChanges();

            expect(debugElement.componentInstance.disabled).toBe(true);
            expect(debugElement.query(By.directive(KbqButton))).toBe(null);
            expect(debugElement.query(By.directive(KbqInput)).nativeElement.hasAttribute('disabled')).toBe(true);
        });

        it('should update value via formControl', fakeAsync(() => {
            formFixture.componentInstance.openedState = true;
            formFixture.detectChanges();

            formFixture.componentInstance.searchControl.setValue('form value');
            tick();
            formFixture.detectChanges();

            const component = debugElement.componentInstance as KbqSearchExpandable;

            expect(component.value.getValue()).toBe('form value');
        }));
    });

    describe('escape key', () => {
        it('should close on escape keyup', () => {
            fixture.componentInstance.openedState = true;
            fixture.detectChanges();

            expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(1);

            const inputEl = debugElement.query(By.css('input')).nativeElement;

            inputEl.dispatchEvent(new KeyboardEvent('keyup', { key: 'Escape' }));
            fixture.detectChanges();

            expect(nativeElement.querySelectorAll('.kbq-search-expandable__button').length).toBe(1);
            expect(nativeElement.querySelectorAll('.kbq-search-expandable__search').length).toBe(0);
        });
    });
});

@Component({
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

@Component({
    selector: 'test-app-search-expandable-with-placeholder',
    imports: [KbqSearchExpandableModule, FormsModule],
    template: `
        <kbq-search-expandable [isOpened]="openedState" [placeholder]="'Custom search...'" [(ngModel)]="search" />
    `
})
class TestSearchExpandableWithPlaceholder {
    openedState: boolean = false;
    search: string;
}

@Component({
    selector: 'test-app-search-expandable-with-tooltip',
    imports: [KbqSearchExpandableModule, FormsModule],
    template: `
        <kbq-search-expandable [isOpened]="openedState" [tooltipText]="'Custom tooltip'" [(ngModel)]="search" />
    `
})
class TestSearchExpandableWithTooltip {
    openedState: boolean = false;
    search: string;
}
