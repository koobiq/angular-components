import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { KbqFilterBarModule, KbqFilterBarSearch } from '@koobiq/components/filter-bar';

@Component({
    selector: 'test-filter-search',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="[]" [filter]="filter">
            <kbq-filter-reset />
            <kbq-filter-search
                [onSearchTimeout]="onSearchTimeout"
                [emitValueByEnter]="emitValueByEnter"
                [initialValue]="initialValue"
                [tooltip]="tooltip"
                [placeholder]="placeholder"
                (onSearch)="onSearch($event)"
            />
        </kbq-filter-bar>
    `
})
class TestFilterSearch {
    @ViewChild(KbqFilterBarSearch) search: KbqFilterBarSearch;

    filter = {
        name: 'Test',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: []
    };

    onSearchTimeout: number = 0;
    emitValueByEnter: boolean = false;
    initialValue: string;
    tooltip: string;
    placeholder: string;

    onSearch = jest.fn();
}

@Component({
    selector: 'test-filter-search-enter',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="[]" [filter]="filter">
            <kbq-filter-search [emitValueByEnter]="true" (onSearch)="onSearch($event)" />
        </kbq-filter-bar>
    `
})
class TestFilterSearchEnter {
    @ViewChild(KbqFilterBarSearch) search: KbqFilterBarSearch;

    filter = {
        name: 'Test',
        readonly: false,
        disabled: false,
        changed: false,
        saved: false,
        pipes: []
    };

    onSearch = jest.fn();
}

describe('KbqFilterBarSearch', () => {
    let fixture: ComponentFixture<TestFilterSearch>;
    let searchDebugElement: DebugElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, TestFilterSearch, TestFilterSearchEnter]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestFilterSearch);
        fixture.detectChanges();
        searchDebugElement = fixture.debugElement.query(By.directive(KbqFilterBarSearch));
    });

    describe('initialization', () => {
        it('should have kbq-filter-search class', () => {
            expect(searchDebugElement.nativeElement.classList).toContain('kbq-filter-search');
        });

        it('should not be active by default', () => {
            expect(fixture.componentInstance.search.isSearchActive).toBe(false);
        });

        it('should show button and hide form field initially', () => {
            expect(searchDebugElement.query(By.css('[kbq-button]')).nativeElement.classList).not.toContain(
                'kbq-filter_hidden'
            );
            expect(searchDebugElement.query(By.css('.kbq-form-field')).nativeElement.classList).toContain(
                'kbq-filter_hidden'
            );
        });
    });

    describe('openSearch', () => {
        it('should activate search and show form field', fakeAsync(() => {
            searchDebugElement.query(By.css('button')).nativeElement.click();
            flush();
            fixture.detectChanges();

            expect(fixture.componentInstance.search.isSearchActive).toBe(true);
            expect(searchDebugElement.query(By.css('.kbq-form-field')).nativeElement.classList).not.toContain(
                'kbq-filter_hidden'
            );
            expect(searchDebugElement.query(By.css('[kbq-button]')).nativeElement.classList).toContain(
                'kbq-filter_hidden'
            );
        }));
    });

    describe('onBlur', () => {
        it('should close search when value is empty', fakeAsync(() => {
            fixture.componentInstance.search.openSearch();
            flush();
            fixture.detectChanges();

            expect(fixture.componentInstance.search.isSearchActive).toBe(true);

            fixture.componentInstance.search.onBlur();
            fixture.detectChanges();

            expect(fixture.componentInstance.search.isSearchActive).toBe(false);
        }));

        it('should keep search open when value exists', fakeAsync(() => {
            fixture.componentInstance.search.openSearch();
            flush();
            fixture.detectChanges();

            fixture.componentInstance.search.searchControl.setValue('test');
            tick(1);
            fixture.detectChanges();

            fixture.componentInstance.search.onBlur();
            fixture.detectChanges();

            expect(fixture.componentInstance.search.isSearchActive).toBe(true);
        }));
    });

    describe('onEscape', () => {
        it('should deactivate search', fakeAsync(() => {
            fixture.componentInstance.search.openSearch();
            flush();
            fixture.detectChanges();

            fixture.componentInstance.search.onEscape();
            fixture.detectChanges();

            expect(fixture.componentInstance.search.isSearchActive).toBe(false);
        }));
    });

    describe('onEnter', () => {
        it('should not emit when emitValueByEnter is false', fakeAsync(() => {
            fixture.componentInstance.search.openSearch();
            flush();
            fixture.detectChanges();

            fixture.componentInstance.search.searchControl.setValue('test');
            tick(1);
            fixture.detectChanges();

            fixture.componentInstance.onSearch.mockClear();

            fixture.componentInstance.search.onEnter();
            fixture.detectChanges();

            expect(fixture.componentInstance.onSearch).not.toHaveBeenCalled();
        }));

        it('should emit when emitValueByEnter is true', fakeAsync(() => {
            const enterFixture = TestBed.createComponent(TestFilterSearchEnter);

            enterFixture.detectChanges();

            enterFixture.componentInstance.search.openSearch();
            flush();
            enterFixture.detectChanges();

            enterFixture.componentInstance.search.searchControl.setValue('test');
            tick(1);
            enterFixture.detectChanges();

            enterFixture.componentInstance.onSearch.mockClear();

            enterFixture.componentInstance.search.onEnter();
            enterFixture.detectChanges();

            expect(enterFixture.componentInstance.onSearch).toHaveBeenCalledWith('test');
        }));
    });

    describe('onClear', () => {
        it('should deactivate search', fakeAsync(() => {
            fixture.componentInstance.search.openSearch();
            flush();
            fixture.detectChanges();

            fixture.componentInstance.search.onClear();
            flush();
            fixture.detectChanges();

            expect(fixture.componentInstance.search.isSearchActive).toBe(false);
        }));
    });

    describe('onSearch event', () => {
        it('should emit on value changes', fakeAsync(() => {
            fixture.componentInstance.search.openSearch();
            flush();
            fixture.detectChanges();

            expect(fixture.componentInstance.onSearch).not.toHaveBeenCalled();

            fixture.componentInstance.search.searchControl.setValue('value');
            tick(1);
            fixture.detectChanges();

            expect(fixture.componentInstance.onSearch).toHaveBeenCalledWith('value');
        }));

        it('should not emit duplicate values', fakeAsync(() => {
            fixture.componentInstance.search.openSearch();
            flush();
            fixture.detectChanges();

            fixture.componentInstance.search.searchControl.setValue('value');
            tick(1);
            fixture.detectChanges();

            fixture.componentInstance.onSearch.mockClear();

            fixture.componentInstance.search.searchControl.setValue('value');
            tick(1);
            fixture.detectChanges();

            expect(fixture.componentInstance.onSearch).not.toHaveBeenCalled();
        }));

        it('should respect onSearchTimeout', fakeAsync(() => {
            const newFixture = TestBed.createComponent(TestFilterSearch);

            newFixture.componentInstance.onSearchTimeout = 300;
            newFixture.detectChanges();

            newFixture.componentInstance.search.openSearch();
            flush();
            newFixture.detectChanges();

            newFixture.componentInstance.search.searchControl.setValue('delayed');
            tick(100);
            newFixture.detectChanges();

            expect(newFixture.componentInstance.onSearch).not.toHaveBeenCalled();

            tick(200);
            newFixture.detectChanges();

            expect(newFixture.componentInstance.onSearch).toHaveBeenCalledWith('delayed');
        }));

        it('should not emit on value changes when emitValueByEnter is true', fakeAsync(() => {
            const enterFixture = TestBed.createComponent(TestFilterSearchEnter);

            enterFixture.detectChanges();

            enterFixture.componentInstance.search.openSearch();
            flush();
            enterFixture.detectChanges();

            enterFixture.componentInstance.search.searchControl.setValue('test');
            tick(1);
            enterFixture.detectChanges();

            expect(enterFixture.componentInstance.onSearch).not.toHaveBeenCalled();
        }));
    });

    describe('initialValue', () => {
        it('should set initial value on the form control', () => {
            const newFixture = TestBed.createComponent(TestFilterSearch);

            newFixture.componentInstance.initialValue = 'initial';
            newFixture.detectChanges();

            expect(newFixture.componentInstance.search.searchControl.value).toBe('initial');
        });
    });

    describe('tooltip input', () => {
        it('should use localeData tooltip by default', () => {
            const resolvedTooltip = fixture.componentInstance.search.resolvedTooltip;

            expect(resolvedTooltip).toBeTruthy();
            expect(resolvedTooltip).toBe(fixture.componentInstance.search.localeData.tooltip);
        });

        it('should use custom tooltip when provided', () => {
            fixture.componentInstance.tooltip = 'Custom Tooltip';
            fixture.detectChanges();

            expect(fixture.componentInstance.search.resolvedTooltip).toBe('Custom Tooltip');
        });

        it('should fall back to localeData when custom tooltip is cleared', () => {
            fixture.componentInstance.tooltip = 'Custom Tooltip';
            fixture.detectChanges();

            expect(fixture.componentInstance.search.resolvedTooltip).toBe('Custom Tooltip');

            fixture.componentInstance.tooltip = '';
            fixture.detectChanges();

            expect(fixture.componentInstance.search.resolvedTooltip).toBe(
                fixture.componentInstance.search.localeData.tooltip
            );
        });
    });

    describe('placeholder input', () => {
        it('should use localeData placeholder by default', () => {
            const resolvedPlaceholder = fixture.componentInstance.search.resolvedPlaceholder;

            expect(resolvedPlaceholder).toBeTruthy();
            expect(resolvedPlaceholder).toBe(fixture.componentInstance.search.localeData.placeholder);
        });

        it('should use custom placeholder when provided', () => {
            fixture.componentInstance.placeholder = 'Custom Placeholder';
            fixture.detectChanges();

            expect(fixture.componentInstance.search.resolvedPlaceholder).toBe('Custom Placeholder');
        });

        it('should render custom placeholder in the input element', () => {
            fixture.componentInstance.placeholder = 'Type here...';
            fixture.detectChanges();

            const inputEl = searchDebugElement.query(By.css('input')).nativeElement;

            expect(inputEl.placeholder).toBe('Type here...');
        });

        it('should fall back to localeData when custom placeholder is cleared', () => {
            fixture.componentInstance.placeholder = 'Custom Placeholder';
            fixture.detectChanges();

            expect(fixture.componentInstance.search.resolvedPlaceholder).toBe('Custom Placeholder');

            fixture.componentInstance.placeholder = '';
            fixture.detectChanges();

            expect(fixture.componentInstance.search.resolvedPlaceholder).toBe(
                fixture.componentInstance.search.localeData.placeholder
            );
        });
    });

    describe('onReset', () => {
        it('should call markForCheck on reset', () => {
            jest.spyOn(fixture.componentInstance.search['changeDetectorRef'], 'markForCheck');

            fixture.componentInstance.search.onReset();

            expect(fixture.componentInstance.search['changeDetectorRef'].markForCheck).toHaveBeenCalled();
        });
    });
});
