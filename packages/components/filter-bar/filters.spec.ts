import { ChangeDetectorRef, Component, DebugElement, inject, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    KBQ_FILTER_BAR_DEFAULT_CONFIGURATION,
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqFilters,
    KbqPipe,
    KbqPipeTemplate,
    KbqPipeTypes,
    KbqSaveFilterStatuses
} from '@koobiq/components/filter-bar';

const PIPE_TEMPLATE_ID = 'TestText';

const createPipe = (overrides: Partial<KbqPipe> = {}): KbqPipe => ({
    name: 'test',
    id: PIPE_TEMPLATE_ID,
    type: KbqPipeTypes.Text,
    value: null,
    search: false,
    cleanable: false,
    removable: false,
    disabled: false,
    ...overrides
});

const createFilter = (pipes: KbqPipe[], overrides: Partial<KbqFilter> = {}): KbqFilter => ({
    name: 'TestFilter',
    readonly: false,
    disabled: false,
    changed: false,
    saved: false,
    pipes,
    ...overrides
});

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter">
            <kbq-filters
                [filters]="filters"
                (onSelectFilter)="onSelectFilterSpy($event)"
                (onSave)="onSaveSpy($event)"
                (onSaveAsNew)="onSaveAsNewSpy($event)"
                (onRemoveFilter)="onRemoveFilterSpy($event)"
                (onResetFilterChanges)="onResetFilterChangesSpy($event)"
            />
            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
            <kbq-pipe-add />
            <kbq-filter-reset />
        </kbq-filter-bar>
    `
})
class TestComponent {
    readonly changeDetectorRef = inject(ChangeDetectorRef);

    @ViewChild(KbqFilters) filtersComponent: KbqFilters;

    activeFilter: KbqFilter | null = null;

    filters: KbqFilter[] = [];

    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Text',
            id: PIPE_TEMPLATE_ID,
            type: KbqPipeTypes.Text,
            cleanable: false,
            removable: false,
            disabled: false
        }
    ];

    onSelectFilterSpy = jest.fn();
    onSaveSpy = jest.fn();
    onSaveAsNewSpy = jest.fn();
    onRemoveFilterSpy = jest.fn();
    onResetFilterChangesSpy = jest.fn();
}

describe('KbqFilters', () => {
    let fixture: ComponentFixture<TestComponent>;
    let filterBarDebugElement: DebugElement;
    let filtersDebugElement: DebugElement;

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqFilterBarModule, TestComponent]
        }).compileComponents();
    });

    const getFiltersComponent = (): KbqFilters => {
        return filtersDebugElement.componentInstance;
    };

    const getFilterBar = (): KbqFilterBar => {
        return filterBarDebugElement.componentInstance;
    };

    const initFixture = (activeFilter: KbqFilter | null = null, filters: KbqFilter[] = []) => {
        fixture = TestBed.createComponent(TestComponent);
        fixture.componentInstance.activeFilter = activeFilter;
        fixture.componentInstance.filters = filters;
        fixture.detectChanges();
        filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
        filtersDebugElement = fixture.debugElement.query(By.directive(KbqFilters));
    };

    describe('Getters', () => {
        describe('isEmpty', () => {
            it('should return true when filters array is empty', () => {
                initFixture(null, []);

                expect(getFiltersComponent().isEmpty).toBe(true);
            });

            it('should return false when filters array has items', () => {
                initFixture(null, [createFilter([createPipe()])]);

                expect(getFiltersComponent().isEmpty).toBe(false);
            });
        });

        describe('filter', () => {
            it('should return filterBar.filter', () => {
                const filter = createFilter([]);

                initFixture(filter);

                expect(getFiltersComponent().filter).toBe(getFilterBar().filter);
            });

            it('should return null when filterBar has no filter', () => {
                initFixture(null);

                expect(getFiltersComponent().filter).toBeNull();
            });
        });

        describe('localeData', () => {
            it('should return filterBar.configuration.filters', () => {
                initFixture();

                expect(getFiltersComponent().localeData).toEqual(KBQ_FILTER_BAR_DEFAULT_CONFIGURATION.filters);
            });
        });

        describe('popoverHeader', () => {
            it('should return saveAsNew text when saveNewFilter is true', () => {
                initFixture();
                const component = getFiltersComponent();

                component.saveNewFilter = true;

                expect(component.popoverHeader).toBe(component.localeData.saveAsNew);
            });

            it('should return saveChanges text when saveNewFilter is false', () => {
                initFixture();
                const component = getFiltersComponent();

                component.saveNewFilter = false;

                expect(component.popoverHeader).toBe(component.localeData.saveChanges);
            });
        });

        describe('opened', () => {
            it('should return false when neither popover nor dropdown is open', () => {
                initFixture();

                expect(getFiltersComponent().opened).toBeFalsy();
            });
        });

        describe('filterActionsOpened', () => {
            it('should return false by default', () => {
                initFixture();

                expect(getFiltersComponent().filterActionsOpened).toBeFalsy();
            });
        });

        describe('focusOrigin', () => {
            it('should default to null', () => {
                initFixture();

                expect(getFiltersComponent().focusOrigin).toBeNull();
            });
        });
    });

    describe('selectFilter', () => {
        it('should emit onSelectFilter with the selected filter', () => {
            const filter = createFilter([], { name: 'Selected' });

            initFixture(createFilter([]), [filter]);

            getFiltersComponent().selectFilter(filter);

            expect(fixture.componentInstance.onSelectFilterSpy).toHaveBeenCalledWith(filter);
        });

        it('should push structuredClone to filterBar.internalFilterChanges', () => {
            const filter = createFilter([], { name: 'Selected' });

            initFixture(createFilter([]), [filter]);

            const spy = jest.spyOn(getFilterBar().internalFilterChanges, 'next');

            getFiltersComponent().selectFilter(filter);

            expect(spy).toHaveBeenCalled();
            const clonedFilter = spy.mock.calls[0][0];

            expect(clonedFilter).not.toBe(filter);
            expect(clonedFilter!.name).toBe('Selected');
        });
    });

    describe('saveChanges', () => {
        it('should set filter.saved to true and filter.changed to false', () => {
            const filter = createFilter([], { saved: false, changed: true });

            initFixture(filter);

            getFiltersComponent().saveChanges();

            expect(getFilterBar().filter!.saved).toBe(true);
            expect(getFilterBar().filter!.changed).toBe(false);
        });

        it('should emit onSave with status OnlyChanges', () => {
            const filter = createFilter([], { saved: true, changed: true });

            initFixture(filter);

            getFiltersComponent().saveChanges();

            expect(fixture.componentInstance.onSaveSpy).toHaveBeenCalledWith(
                expect.objectContaining({ status: KbqSaveFilterStatuses.OnlyChanges })
            );
        });

        it('should push the filter to filterBar.internalFilterChanges', () => {
            const filter = createFilter([], { saved: true, changed: true });

            initFixture(filter);

            const spy = jest.spyOn(getFilterBar().internalFilterChanges, 'next');

            getFiltersComponent().saveChanges();

            expect(spy).toHaveBeenCalled();
        });

        it('should return early when filterBar.filter is null', () => {
            initFixture(null);

            getFiltersComponent().saveChanges();

            expect(fixture.componentInstance.onSaveSpy).not.toHaveBeenCalled();
        });
    });

    describe('saveAsNew', () => {
        it('should return early when filterName is invalid', fakeAsync(() => {
            const filter = createFilter([], { name: 'Existing', saved: true });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            Object.defineProperty(component.filterName, 'invalid', { get: () => true });
            component.saveAsNew();

            expect(fixture.componentInstance.onSaveSpy).not.toHaveBeenCalled();
        }));

        describe('when saveNewFilter is true', () => {
            it('should emit both onSaveAsNew and onSave with status NewFilter', fakeAsync(() => {
                const filter = createFilter([], { name: 'Existing', saved: true });

                initFixture(filter);

                const component = getFiltersComponent();

                component.openSaveAsNewFilterPopover();
                fixture.detectChanges();
                flush();

                component.filterName.setValue('New Filter');
                component.saveAsNew();

                expect(fixture.componentInstance.onSaveAsNewSpy).toHaveBeenCalled();
                expect(fixture.componentInstance.onSaveSpy).toHaveBeenCalledWith(
                    expect.objectContaining({ status: KbqSaveFilterStatuses.NewFilter })
                );
            }));

            it('should set isSaving to true', fakeAsync(() => {
                const filter = createFilter([], { name: 'Existing' });

                initFixture(filter);

                const component = getFiltersComponent();

                component.openSaveAsNewFilterPopover();
                fixture.detectChanges();
                flush();

                component.filterName.setValue('New');
                component.saveAsNew();

                expect(component.isSaving).toBe(true);
            }));

            it('should disable filterName control', fakeAsync(() => {
                const filter = createFilter([], { name: 'Existing' });

                initFixture(filter);

                const component = getFiltersComponent();

                component.openSaveAsNewFilterPopover();
                fixture.detectChanges();
                flush();

                component.filterName.setValue('New');
                component.saveAsNew();

                expect(component.filterName.disabled).toBe(true);
            }));

            it('should set filter name, saved=true, changed=false on emitted filter', fakeAsync(() => {
                const filter = createFilter([], { name: 'Existing' });

                initFixture(filter);

                const component = getFiltersComponent();

                component.openSaveAsNewFilterPopover();
                fixture.detectChanges();
                flush();

                component.filterName.setValue('Brand New');
                component.saveAsNew();

                const emittedEvent = fixture.componentInstance.onSaveSpy.mock.calls[0][0];

                expect(emittedEvent.filter.name).toBe('Brand New');
                expect(emittedEvent.filter.saved).toBe(true);
                expect(emittedEvent.filter.changed).toBe(false);
            }));

            it('should call event.preventDefault when event is provided', fakeAsync(() => {
                const filter = createFilter([], { name: 'Existing' });

                initFixture(filter);

                const component = getFiltersComponent();

                component.openSaveAsNewFilterPopover();
                fixture.detectChanges();
                flush();

                component.filterName.setValue('New');
                const event = new Event('submit');
                const preventSpy = jest.spyOn(event, 'preventDefault');

                component.saveAsNew(event);

                expect(preventSpy).toHaveBeenCalled();
            }));
        });

        describe('when saveNewFilter is false (renaming)', () => {
            it('should emit onSave with status NewName', fakeAsync(() => {
                const filter = createFilter([], { name: 'Existing', saved: true });

                initFixture(filter);

                const component = getFiltersComponent();

                component.openChangeFilterNamePopover();
                fixture.detectChanges();
                flush();

                component.filterName.setValue('Renamed');
                component.saveAsNew();

                expect(fixture.componentInstance.onSaveSpy).toHaveBeenCalledWith(
                    expect.objectContaining({ status: KbqSaveFilterStatuses.NewName })
                );
            }));

            it('should NOT emit onSaveAsNew', fakeAsync(() => {
                const filter = createFilter([], { name: 'Existing', saved: true });

                initFixture(filter);

                const component = getFiltersComponent();

                component.openChangeFilterNamePopover();
                fixture.detectChanges();
                flush();

                component.filterName.setValue('Renamed');
                component.saveAsNew();

                expect(fixture.componentInstance.onSaveAsNewSpy).not.toHaveBeenCalled();
            }));
        });
    });

    describe('showError', () => {
        it('should set showFilterSavingError to true', () => {
            initFixture();
            const component = getFiltersComponent();

            component.showError();

            expect(component.showFilterSavingError).toBe(true);
        });

        it('should set filterName error when nameAlreadyExists is true', fakeAsync(() => {
            const filter = createFilter([], { name: 'Existing' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            const setErrorsSpy = jest.spyOn(component.filterName, 'setErrors');

            component.showError({ nameAlreadyExists: true });

            expect(setErrorsSpy).toHaveBeenCalledWith({ filterNameAlreadyExist: true });
        }));

        it('should use error text from argument when provided', () => {
            initFixture();
            const component = getFiltersComponent();

            component.showError({ text: 'Custom error' });

            expect(component.filterSavingErrorText).toBe('Custom error');
        });

        it('should fall back to localeData.errorHint when no text provided', () => {
            initFixture();
            const component = getFiltersComponent();

            component.showError();

            expect(component.filterSavingErrorText).toBe(component.localeData.errorHint);
        });
    });

    describe('resetFilterChanges', () => {
        it('should call filterBar.resetFilterChangedState', () => {
            const filter = createFilter([], { changed: true, saved: true });

            initFixture(filter);

            const spy = jest.spyOn(getFilterBar(), 'resetFilterChangedState');

            getFiltersComponent().resetFilterChanges();

            expect(spy).toHaveBeenCalled();
        });

        it('should emit onResetFilterChanges with current filter', () => {
            const filter = createFilter([], { changed: true, saved: true });

            initFixture(filter);

            getFiltersComponent().resetFilterChanges();

            expect(fixture.componentInstance.onResetFilterChangesSpy).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'TestFilter' })
            );
        });
    });

    describe('removeFilter', () => {
        it('should emit onRemoveFilter with current filter', () => {
            const filter = createFilter([], { name: 'ToRemove', saved: true });

            initFixture(filter);

            getFiltersComponent().removeFilter();

            expect(fixture.componentInstance.onRemoveFilterSpy).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'ToRemove' })
            );
        });
    });

    describe('filterSavedSuccessfully', () => {
        it('should reset isSaving to false', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            component.isSaving = true;
            component.filterSavedSuccessfully();

            expect(component.isSaving).toBe(false);
        }));

        it('should set popover.preventClose to false', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            (component as any).popover.preventClose = true;
            component.filterSavedSuccessfully();

            expect((component as any).popover.preventClose).toBe(false);
        }));
    });

    describe('filterSavedUnsuccessfully', () => {
        it('should reset isSaving to false', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            component.isSaving = true;
            component.filterSavedUnsuccessfully();

            expect(component.isSaving).toBe(false);
        }));

        it('should set popover.preventClose to false', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            (component as any).popover.preventClose = true;
            component.filterSavedUnsuccessfully();

            expect((component as any).popover.preventClose).toBe(false);
        }));

        it('should show error with provided error', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            const showErrorSpy = jest.spyOn(component, 'showError');

            component.filterSavedUnsuccessfully({ text: 'Failed' });

            expect(showErrorSpy).toHaveBeenCalledWith({ text: 'Failed' });
        }));

        it('should re-enable filterName', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            component.filterName.disable();
            component.filterSavedUnsuccessfully();

            expect(component.filterName.enabled).toBe(true);
        }));
    });

    describe('getFilteredOptions (via searchControl)', () => {
        const filtersList = [
            createFilter([], { name: 'Alpha' }),
            createFilter([], { name: 'Beta' }),
            createFilter([], { name: 'Gamma' })
        ];

        it('should return all filters when search is null', fakeAsync(() => {
            initFixture(null, filtersList);

            const component = getFiltersComponent();
            let result: KbqFilter[] = [];

            component.filteredOptions.subscribe((v) => (result = v));
            component.searchControl.setValue(null);
            flush();

            expect(result.length).toBe(3);
        }));

        it('should filter by name case-insensitively', fakeAsync(() => {
            initFixture(null, filtersList);

            const component = getFiltersComponent();
            let result: KbqFilter[] = [];

            component.filteredOptions.subscribe((v) => (result = v));
            component.searchControl.setValue('alp');
            flush();

            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Alpha');
        }));

        it('should return empty array when no match', fakeAsync(() => {
            initFixture(null, filtersList);

            const component = getFiltersComponent();
            let result: KbqFilter[] = [];

            component.filteredOptions.subscribe((v) => (result = v));
            component.searchControl.setValue('xyz');
            flush();

            expect(result.length).toBe(0);
        }));
    });

    describe('searchKeydownHandler', () => {
        it('should call closePopover when Escape is pressed', fakeAsync(() => {
            initFixture(createFilter([], { name: 'Test' }));

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            const closePopoverSpy = jest.spyOn(component, 'closePopover');
            const event = new KeyboardEvent('keydown', { key: 'Escape' });

            component.searchKeydownHandler(event);

            expect(closePopoverSpy).toHaveBeenCalled();
        }));

        it('should stop propagation for non-Escape keys', () => {
            initFixture();

            const component = getFiltersComponent();
            const event = new KeyboardEvent('keydown', { key: 'a' });
            const stopSpy = jest.spyOn(event, 'stopPropagation');

            component.searchKeydownHandler(event);

            expect(stopSpy).toHaveBeenCalled();
        });
    });

    describe('onDropdownOpen', () => {
        it('should reset searchControl value to null', () => {
            initFixture();

            const component = getFiltersComponent();

            component.searchControl.setValue('test');

            component.onDropdownOpen();

            expect(component.searchControl.value).toBeNull();
        });
    });

    describe('saveFocusedElement / focusedElementBeforeIs', () => {
        it('should save reference and return true for same button', () => {
            initFixture(createFilter([], { saved: true }));
            fixture.detectChanges();

            const component = getFiltersComponent();
            const button = (component as any).mainButton;

            component.saveFocusedElement(button);

            expect(component.focusedElementBeforeIs(button)).toBe(true);
        });

        it('should return false for different button', () => {
            initFixture(createFilter([], { saved: true }));
            fixture.detectChanges();

            const component = getFiltersComponent();
            const mainButton = (component as any).mainButton;
            const filterActionsButton = (component as any).filterActionsButton;

            component.saveFocusedElement(mainButton);

            expect(component.focusedElementBeforeIs(filterActionsButton)).toBe(false);
        });

        it('should set to null when called without argument', () => {
            initFixture(createFilter([], { saved: true }));
            fixture.detectChanges();

            const component = getFiltersComponent();
            const button = (component as any).mainButton;

            component.saveFocusedElement(button);
            component.saveFocusedElement();

            expect(component.focusedElementBeforeIs(button)).toBe(false);
        });
    });

    describe('closePopover', () => {
        it('should hide the popover', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            const hideSpy = jest.spyOn((component as any).popover, 'hide');

            component.closePopover(false);
            flush();

            expect(hideSpy).toHaveBeenCalled();
        }));

        it('should reset showFilterSavingError to false', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            component.showFilterSavingError = true;

            component.closePopover(false);
            flush();

            expect(component.showFilterSavingError).toBe(false);
        }));

        it('should restore focus when restoreFocus is true', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            const restoreSpy = jest.spyOn(component, 'restoreFocus');

            component.closePopover(true);
            flush();

            expect(restoreSpy).toHaveBeenCalled();
        }));

        it('should not restore focus when restoreFocus is false', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            const restoreSpy = jest.spyOn(component, 'restoreFocus');

            component.closePopover(false);
            flush();

            expect(restoreSpy).not.toHaveBeenCalled();
        }));
    });

    describe('preparePopover / openSaveAsNewFilterPopover / openChangeFilterNamePopover', () => {
        it('openSaveAsNewFilterPopover should set saveNewFilter to true', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            expect(component.saveNewFilter).toBe(true);
        }));

        it('openChangeFilterNamePopover should set saveNewFilter to false', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openChangeFilterNamePopover();
            fixture.detectChanges();
            flush();

            expect(component.saveNewFilter).toBe(false);
        }));

        it('should create filterName FormControl with Validators.required', fakeAsync(() => {
            initFixture(null);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();

            // before flush, filterName is just created with empty value and required validator
            expect(component.filterName.hasError('required')).toBe(true);
            expect(component.filterName.invalid).toBe(true);

            component.filterName.setValue('Valid');
            expect(component.filterName.valid).toBe(true);

            fixture.detectChanges();
            flush();
        }));

        it('should initialize filterName with current filter name', fakeAsync(() => {
            const filter = createFilter([], { name: 'Existing Filter' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            expect(component.filterName.value).toBe('Existing Filter');
        }));

        it('should initialize filterName with empty string when filter has no name', fakeAsync(() => {
            initFixture(null);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            expect(component.filterName.value).toBe('');
        }));

        it('should show the popover', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();
            const showSpy = jest.spyOn((component as any).popover, 'show');

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            expect(showSpy).toHaveBeenCalled();
        }));

        it('changing filterName value should reset showFilterSavingError', fakeAsync(() => {
            const filter = createFilter([], { name: 'Test' });

            initFixture(filter);

            const component = getFiltersComponent();

            component.openSaveAsNewFilterPopover();
            fixture.detectChanges();
            flush();

            component.showFilterSavingError = true;

            component.filterName.setValue('Changed');
            flush();

            expect(component.showFilterSavingError).toBe(false);
        }));
    });

    describe('ngOnInit', () => {
        it('should set up filteredOptions observable', fakeAsync(() => {
            const filters = [createFilter([], { name: 'A' }), createFilter([], { name: 'B' })];

            initFixture(null, filters);

            const component = getFiltersComponent();
            let result: KbqFilter[] = [];

            component.filteredOptions.subscribe((v) => (result = v));
            flush();

            expect(result.length).toBe(2);
        }));
    });

    describe('Template integration', () => {
        it('should show filter name in main button when filter is set', () => {
            initFixture(createFilter([], { name: 'MyFilter' }));
            fixture.detectChanges();

            const button = filtersDebugElement.query(By.css('.kbq-filters__filter-name'));

            expect(button.nativeElement.textContent.trim()).toContain('MyFilter');
        });

        it('should show default text when no filter name', () => {
            initFixture(null);
            fixture.detectChanges();

            const component = getFiltersComponent();
            const button = filtersDebugElement.query(By.css('.kbq-filters__filter-name'));

            expect(button.nativeElement.textContent.trim()).toContain(component.localeData.defaultName);
        });

        it('should show save button when filter is changed and not saved', () => {
            initFixture(createFilter([], { changed: true, saved: false }));
            fixture.detectChanges();

            const saveButton = filtersDebugElement.queryAll(By.css('.kbq-button_action'));

            expect(saveButton.length).toBeGreaterThan(0);
        });

        it('should show filter actions button when filter is saved', () => {
            initFixture(createFilter([], { saved: true }));
            fixture.detectChanges();

            const actionsButton = filtersDebugElement.queryAll(By.css('.kbq-button_action'));

            expect(actionsButton.length).toBeGreaterThan(0);
        });

        it('should show chevron arrow when filter is saved', () => {
            initFixture(createFilter([], { saved: true }));
            fixture.detectChanges();

            const arrow = filtersDebugElement.query(By.css('.kbq-filter-bar__arrow'));

            expect(arrow).toBeTruthy();
        });

        it('should show divider separator when filter is not saved', () => {
            initFixture(createFilter([], { saved: false }));
            fixture.detectChanges();

            const separator = filtersDebugElement.query(By.css('.kbq-filter-bar__separator'));

            expect(separator).toBeTruthy();
        });

        it('should not show chevron arrow when filter is not saved', () => {
            initFixture(createFilter([], { saved: false }));
            fixture.detectChanges();

            const arrow = filtersDebugElement.query(By.css('.kbq-filter-bar__arrow'));

            expect(arrow).toBeFalsy();
        });
    });
});
