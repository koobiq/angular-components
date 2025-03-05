import { ChangeDetectorRef, Component, DebugElement, inject, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter } from '@koobiq/components/core';
import {
    KbqFilter,
    KbqFilterBar,
    KbqFilterBarModule,
    KbqFilterBarSearch,
    KbqFilterReset,
    KbqFilters,
    KbqPipeAdd,
    KbqPipeTemplate,
    KbqPipeTypes
} from '@koobiq/components/filter-bar';
import { DateTime } from 'luxon';

describe('KbqFilterBar', () => {
    let fixture: ComponentFixture<BaseFunctions>;
    let filterBarDebugElement: DebugElement;
    let filtersDebugElement: DebugElement;
    let pipeAddDebugElement: DebugElement;
    // let filterResetDebugElement: DebugElement;
    let filterBarSearchDebugElement: DebugElement;

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, KbqFilterBarModule, KbqLuxonDateModule],
            declarations: [BaseFunctions]
        }).compileComponents();
    });

    describe('should init components', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(BaseFunctions);
            fixture.detectChanges();

            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            filtersDebugElement = fixture.debugElement.query(By.directive(KbqFilters));
            pipeAddDebugElement = fixture.debugElement.query(By.directive(KbqPipeAdd));
            // filterResetDebugElement = fixture.debugElement.query(By.directive(KbqFilterReset));
            filterBarSearchDebugElement = fixture.debugElement.query(By.directive(KbqFilterBarSearch));
        });

        it('should add classes after init', () => {
            expect(filterBarDebugElement.nativeElement.classList).toContain('kbq-filter-bar');
            expect(filtersDebugElement.nativeElement.classList).toContain('kbq-filters');
            expect(pipeAddDebugElement.nativeElement.classList).toContain('kbq-pipe-add');
            expect(filterBarSearchDebugElement.nativeElement.classList).toContain('kbq-filter-bar-search');
        });
    });

    describe('KbqFilters', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(BaseFunctions);
            fixture.detectChanges();

            filtersDebugElement = fixture.debugElement.query(By.directive(KbqFilters));
        });

        it('should have default text (empty)', () => {
            expect(filtersDebugElement.nativeElement.innerText).toBe('Фильтры');
        });

        it('should have selected filter name', () => {
            expect(filtersDebugElement.nativeElement.innerText).toBe('Фильтры');

            fixture.componentInstance.activeFilter = fixture.componentInstance.filters[0];
            fixture.componentInstance.changeDetectorRef.detectChanges();
            expect(filtersDebugElement.nativeElement.innerText).toBe('Select');
        });

        it('should open filters', () => {
            expect(fixture.componentInstance.filtersTrigger.opened).toBeFalse();
            filtersDebugElement.query(By.css('.kbq-dropdown-trigger')).nativeElement.click();
            expect(fixture.componentInstance.filtersTrigger.opened).toBeTrue();
        });

        it('should have focus on search input', fakeAsync(() => {
            filtersDebugElement.query(By.css('.kbq-dropdown-trigger')).nativeElement.click();
            flush();
            expect(document.activeElement?.classList).toContain('kbq-input');
        }));

        it('should have items and button saveAsNewFilter', () => {
            filtersDebugElement.query(By.css('.kbq-dropdown-trigger')).nativeElement.click();
            const filterItems = document.querySelectorAll('.kbq-dropdown-item');

            expect(filterItems.length).toBe(10);
            expect(filterItems[filterItems.length - 1].innerHTML).toContain('Сохранить как новый фильтр');
        });
    });

    describe('KbqPipeAdd', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(BaseFunctions);
            fixture.detectChanges();

            filtersDebugElement = fixture.debugElement.query(By.directive(KbqFilters));
            pipeAddDebugElement = fixture.debugElement.query(By.directive(KbqPipeAdd));
        });

        it('should open', () => {
            expect(fixture.componentInstance.pipeAdd.select.panelOpen).toBeFalse();
            pipeAddDebugElement.query(By.css('.kbq-select')).nativeElement.click();
            expect(fixture.componentInstance.pipeAdd.select.panelOpen).toBeTrue();
        });

        it('should contain templates', () => {
            pipeAddDebugElement.query(By.css('.kbq-select')).nativeElement.click();
            fixture.componentInstance.changeDetectorRef.detectChanges();

            const templates = fixture.debugElement.queryAll(By.css('.kbq-option'));
            expect(templates.length).toBe(5);

            for (let index = 0; index < templates.length; index++) {
                expect(templates[index].nativeElement.innerText).toContain(
                    fixture.componentInstance.pipeTemplates[index].name
                );
            }
        });

        it('should add pipe from template', () => {
            pipeAddDebugElement.query(By.css('.kbq-select')).nativeElement.click();
            fixture.componentInstance.changeDetectorRef.detectChanges();

            expect(fixture.componentInstance.activeFilter).toEqual(null);

            const templates = fixture.debugElement.queryAll(By.css('.kbq-option'));

            templates[0].nativeElement.click();

            expect(fixture.componentInstance.activeFilter!.pipes.length).toBe(1);
        });

        it('should not add already added pipe', () => {
            pipeAddDebugElement.query(By.css('.kbq-select')).nativeElement.click();
            fixture.componentInstance.changeDetectorRef.detectChanges();

            expect(fixture.componentInstance.activeFilter).toBeNull();

            let templates = fixture.debugElement.queryAll(By.css('.kbq-option'));

            templates[0].nativeElement.click();

            expect(fixture.componentInstance.activeFilter!.pipes.length).toBe(1);

            pipeAddDebugElement.query(By.css('.kbq-select')).nativeElement.click();
            fixture.componentInstance.changeDetectorRef.detectChanges();

            templates = fixture.debugElement.queryAll(By.css('.kbq-option'));

            templates[0].nativeElement.click();

            expect(fixture.componentInstance.activeFilter!.pipes.length).toBe(1);
        });
    });

    describe('KbqFilterReset', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(BaseFunctions);
            fixture.detectChanges();

            pipeAddDebugElement = fixture.debugElement.query(By.directive(KbqPipeAdd));
        });

        it('should hide KbqResetButton on empty filter', () => {
            expect(fixture.debugElement.query(By.directive(KbqFilterReset))).toBeNull();
            expect(fixture.componentInstance.activeFilter).toEqual(null);

            pipeAddDebugElement.query(By.css('.kbq-select')).nativeElement.click();
            fixture.componentInstance.changeDetectorRef.detectChanges();

            fixture.debugElement.query(By.css('.kbq-option')).nativeElement.click();
            fixture.componentInstance.changeDetectorRef.detectChanges();

            expect(fixture.componentInstance.activeFilter!.pipes.length).toBe(1);
            expect(fixture.debugElement.query(By.directive(KbqFilterReset))).not.toBeNull();

            fixture.componentInstance.activeFilter = null;
            fixture.componentInstance.changeDetectorRef.detectChanges();
            expect(fixture.debugElement.query(By.directive(KbqFilterReset))).toBeNull();
        });

        it('should emit reset event', () => {
            fixture.componentInstance.activeFilter = fixture.componentInstance.filters[6];
            fixture.componentInstance.changeDetectorRef.detectChanges();

            const resetButton = fixture.debugElement.query(By.directive(KbqFilterReset));

            expect(fixture.componentInstance.onResetFilter).not.toHaveBeenCalled();

            resetButton.query(By.css('button')).nativeElement.click();

            expect(fixture.componentInstance.onResetFilter).toHaveBeenCalled();
        });
    });

    // describe('KbqFilterBarSearch', () => {});

    // describe('KbqPipes', () => {
    //     describe('KbqFilterBarSearch', () => {});
    // });
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-filter-bar
            [(filter)]="activeFilter"
            [pipeTemplates]="pipeTemplates"
            (filterChange)="onFilterChange($event)"
            (onChangeFilter)="onChangeFilter($event)"
            (onDeleteFilter)="onDeleteFilter($event)"
            (onResetFilter)="onResetFilter($event)"
            (onSave)="onSaveFilter($event)"
            (onSaveAsNew)="onSaveAsNewFilter($event)"
            (onSelectFilter)="onSelectFilter($event)"
        >
            <kbq-filters [filters]="filters" />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add (onAddPipe)="onAddPipe($event)" />

            <kbq-filter-reset />

            <kbq-filter-bar-search (onSearch)="onSearch($event)" />
        </kbq-filter-bar>
    `
})
class BaseFunctions {
    readonly adapter = inject(DateAdapter<DateTime>);
    readonly changeDetectorRef = inject(ChangeDetectorRef);

    readonly onResetFilter = jasmine.createSpy('onResetFilterCallback');

    @ViewChild(KbqFilters) filtersTrigger: KbqFilters;
    @ViewChild(KbqPipeAdd) pipeAdd: KbqPipeAdd;

    filters: KbqFilter[] = [
        {
            name: 'Select',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Select,
                    value: null,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'MultiSelect',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: [
                        { name: 'Не определен', id: '1' },
                        { name: 'Легитимное действие', id: '2' }
                    ],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'Text',
            readonly: false,
            disabled: false,
            changed: true,
            saved: false,
            pipes: [
                {
                    name: 'requiredrequiredrequiredrequiredrequiredrequiredrequiredrequiredrequiredrequiredrequired',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Text,
                    value: 'valuevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevalue',

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanable',
                    value: 'valuevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevalue',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'Date',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: {
                        start: this.adapter.today(),
                        end: this.adapter.today().minus({ days: 3 })
                    },
                    type: KbqPipeTypes.Date,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    value: null,
                    type: KbqPipeTypes.Date,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: {
                        start: this.adapter.today(),
                        end: this.adapter.today().minus({ days: 3 })
                    },
                    type: KbqPipeTypes.Date,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Последний день', start: null, end: null },
                    type: KbqPipeTypes.Date,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Последний день', start: null, end: null },
                    type: KbqPipeTypes.Date,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'Datetime',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [
                {
                    name: 'required',
                    value: {
                        start: this.adapter.today(),
                        end: this.adapter.today().minus({ days: 3 })
                    },
                    type: KbqPipeTypes.Datetime,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    value: null,
                    type: KbqPipeTypes.Datetime,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: {
                        start: this.adapter.today(),
                        end: this.adapter.today().minus({ days: 3 })
                    },
                    type: KbqPipeTypes.Datetime,

                    required: false,
                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Последний день', start: null, end: null },
                    type: KbqPipeTypes.Datetime,

                    required: false,
                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Последний день', start: null, end: null },
                    type: KbqPipeTypes.Datetime,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: true
                }
            ]
        },
        {
            name: 'SAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVEDSAVED',
            readonly: false,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        },
        {
            name: 'CHANGED',
            readonly: false,
            disabled: false,
            changed: true,
            saved: false,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        },
        {
            name: 'SAVED/CHANGED',
            readonly: false,
            disabled: false,
            changed: true,
            saved: true,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    required: false,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        },
        {
            name: 'READONLY',
            readonly: true,
            disabled: false,
            changed: false,
            saved: true,
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: KbqPipeTypes.Text,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

                    required: true,
                    cleanable: false,
                    removable: false,
                    disabled: false
                }
            ]
        }
    ];
    activeFilter: KbqFilter | null = null;
    pipeTemplates: KbqPipeTemplate[] = [
        {
            name: 'Select',
            type: KbqPipeTypes.Select,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' },
                { name: 'Option 8', id: '8' },
                { name: 'Option 9', id: '9' },
                { name: 'Option 10', id: '10' }
            ],

            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'MultiSelect',
            type: KbqPipeTypes.MultiSelect,
            values: [
                { name: 'Option 1', id: '1' },
                { name: 'Option 2', id: '2' },
                { name: 'Option 3', id: '3' },
                { name: 'Option 4', id: '4' },
                { name: 'Option 5', id: '5' },
                { name: 'Option 6', id: '6' },
                { name: 'Option 7', id: '7' },
                { name: 'Option 8', id: '8' },
                { name: 'Option 9', id: '9' },
                { name: 'Option 10', id: '10' }
            ],
            required: false,
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,

            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: [
                { name: 'Последний день', start: null, end: { days: -1 } },
                { name: 'Последние 3 дня', start: null, end: { days: -3 } },
                { name: 'Последние 7 дней', start: null, end: { days: -7 } },
                { name: 'Последние 30 дней', start: null, end: { days: -30 } },
                { name: 'Последние 90 дней', start: null, end: { days: -90 } },
                { name: 'Последний год', start: null, end: { years: -1 } }
            ],
            required: false,
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний день', start: null, end: { days: -1 } },
                { name: 'Последние 3 дня', start: null, end: { days: -3 } },
                { name: 'Последние 7 дней', start: null, end: { days: -7 } },
                { name: 'Последние 30 дней', start: null, end: { days: -30 } },
                { name: 'Последние 90 дней', start: null, end: { days: -90 } },
                { name: 'Последний год', start: null, end: { years: -1 } }
            ],
            required: false,
            cleanable: true,
            removable: false,
            disabled: false
        }
    ];

    onAddPipe(pipe: KbqPipeTemplate) {
        console.log('onAddPipe: ', pipe);
    }

    onFilterChange(filter: KbqFilter | null) {
        console.log('onFilterChange: ', filter);
    }

    onSelectFilter(filter: KbqFilter) {
        console.log('onSelectFilter: ', filter);

        this.activeFilter = filter;
    }

    onSaveAsNewFilter({ filter, filterBar }) {
        this.filters.push(filter);

        filterBar.filterSavedSuccessfully();
        // filterBar.filterSavedUnsuccessfully({ nameAlreadyExists: true, text: 'custom error text' });
    }

    onSaveFilter({ filter, filterBar }) {
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            filter
        );

        filterBar.filterSavedSuccessfully();
    }

    onChangeFilter({ filter, filterBar }) {
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            filter
        );

        filterBar.filterSavedSuccessfully();
    }

    onDeleteFilter(filter: KbqFilter | null) {
        console.log('filter to delete: ', filter);

        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1
        );

        this.activeFilter = null;
    }

    onSearch(value: string) {
        console.log('onSearch: ', value);
    }
}
