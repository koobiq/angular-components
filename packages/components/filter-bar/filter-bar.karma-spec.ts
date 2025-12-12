import { ChangeDetectorRef, Component, DebugElement, inject, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
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
    let filterResetDebugElement: DebugElement;
    let filterBarSearchDebugElement: DebugElement;

    window.structuredClone = (value) => JSON.parse(JSON.stringify(value));

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, KbqFilterBarModule, KbqLuxonDateModule, BaseFunctions]
        }).compileComponents();
    });

    describe('should init components', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(BaseFunctions);
            fixture.detectChanges();

            filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
            filtersDebugElement = fixture.debugElement.query(By.directive(KbqFilters));
            pipeAddDebugElement = fixture.debugElement.query(By.directive(KbqPipeAdd));
            filterResetDebugElement = fixture.debugElement.query(By.directive(KbqFilterReset));
            filterBarSearchDebugElement = fixture.debugElement.query(By.directive(KbqFilterBarSearch));
        });

        it('should add classes after init', () => {
            expect(filterBarDebugElement.nativeElement.classList).toContain('kbq-filter-bar');
            expect(filtersDebugElement.nativeElement.classList).toContain('kbq-filters');
            expect(pipeAddDebugElement.nativeElement.classList).toContain('kbq-pipe-add');
            expect(filterBarSearchDebugElement.nativeElement.classList).toContain('kbq-filter-search');
            expect(filterResetDebugElement.nativeElement.classList).toContain('kbq-filter-reset');
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

        it('should emit reset event', () => {
            fixture.componentInstance.activeFilter = fixture.componentInstance.filters[6];
            fixture.componentInstance.changeDetectorRef.detectChanges();

            const resetButton = fixture.debugElement.query(By.directive(KbqFilterReset));

            expect(fixture.componentInstance.onResetFilter).not.toHaveBeenCalled();

            resetButton.query(By.css('button')).nativeElement.click();

            expect(fixture.componentInstance.onResetFilter).toHaveBeenCalled();
        });
    });

    describe('KbqFilterBarSearch', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(BaseFunctions);
            fixture.detectChanges();

            pipeAddDebugElement = fixture.debugElement.query(By.directive(KbqPipeAdd));
        });

        it('should open search field', fakeAsync(() => {
            const searchButton = fixture.debugElement.query(By.directive(KbqFilterBarSearch));

            expect(searchButton.query(By.css('.kbq-form-field')).nativeElement.classList).toContain(
                'kbq-filter_hidden'
            );
            expect(searchButton.query(By.css('[kbq-button]')).nativeElement.classList).not.toContain(
                'kbq-filter_hidden'
            );

            searchButton.query(By.css('button')).nativeElement.click();
            flush();
            fixture.detectChanges();

            expect(searchButton.query(By.css('.kbq-form-field')).classes).not.toContain('kbq-filter_hidden');
            expect(searchButton.query(By.css('[kbq-button]')).nativeElement.classList).toContain('kbq-filter_hidden');
        }));

        it('should emit search event', fakeAsync(() => {
            const searchButton = fixture.debugElement.query(By.directive(KbqFilterBarSearch));

            searchButton.query(By.css('button')).nativeElement.click();
            flush();
            fixture.detectChanges();

            expect(fixture.componentInstance.onSearchFilter).not.toHaveBeenCalled();

            fixture.componentInstance.search.searchControl.setValue('value');
            tick(1);
            flush();
            fixture.detectChanges();

            expect(fixture.componentInstance.onSearchFilter).toHaveBeenCalled();
        }));
    });

    describe('KbqPipes', () => {
        describe('KbqPipe states for type: Select', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(BaseFunctions);
                filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
                fixture.componentInstance.activeFilter = fixture.componentInstance.filters[0];
                fixture.detectChanges();
            });

            it('Select pipes', () => {
                const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

                expect(pipes.length).toBe(5);
                pipes.forEach((pipe) => {
                    expect(pipe.nativeElement.classList).toContain('kbq-pipe__select');
                });
            });

            it('Select: state required', () => {
                const required = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[0];

                expect(required.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_removable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_disabled');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_empty');
            });

            it('Select: state empty', () => {
                const empty = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[1];

                expect(empty.nativeElement.classList).toContain('kbq-pipe_empty');
            });

            it('Select: state cleanable', () => {
                const cleanable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[2];

                expect(cleanable.nativeElement.classList).toContain('kbq-pipe_cleanable');
                expect(cleanable.nativeElement.classList).not.toContain('kbq-pipe_removable');
            });

            it('Select: state removable', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[3];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_removable');
                expect(removable.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
            });

            it('Select: state disabled', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[4];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_disabled');
            });
        });

        describe('KbqPipe states for type: MultiSelect', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(BaseFunctions);
                filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
                fixture.componentInstance.activeFilter = fixture.componentInstance.filters[1];
                fixture.detectChanges();
            });

            it('MultiSelect pipes', () => {
                const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

                expect(pipes.length).toBe(6);

                pipes.forEach((pipe) => {
                    expect(pipe.nativeElement.classList).toContain('kbq-pipe__multiselect');
                });
            });

            it('MultiSelect: state required', () => {
                const required = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[0];

                expect(required.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_removable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_disabled');
            });

            it('MultiSelect: state empty', () => {
                const empty = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[2];

                expect(empty.nativeElement.classList).toContain('kbq-pipe_empty');
            });

            it('MultiSelect: state cleanable', () => {
                const cleanable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[3];

                expect(cleanable.nativeElement.classList).toContain('kbq-pipe_cleanable');
                expect(cleanable.nativeElement.classList).not.toContain('kbq-pipe_removable');
            });

            it('MultiSelect: state removable', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[4];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_removable');
                expect(removable.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
            });

            it('MultiSelect: state disabled', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[5];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_disabled');
            });
        });

        describe('KbqPipe states for type: Text', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(BaseFunctions);
                filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
                fixture.componentInstance.activeFilter = fixture.componentInstance.filters[2];
                fixture.detectChanges();
            });

            it('Text pipes', () => {
                const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

                expect(pipes.length).toBe(5);
                pipes.forEach((pipe) => {
                    expect(pipe.nativeElement.classList).toContain('kbq-pipe__text');
                });
            });

            it('Text: state required', () => {
                const required = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[0];

                expect(required.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_removable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_disabled');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_empty');
            });

            it('Text: state empty', () => {
                const empty = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[1];

                expect(empty.nativeElement.classList).toContain('kbq-pipe_empty');
            });

            it('Text: state cleanable', () => {
                const cleanable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[2];

                expect(cleanable.nativeElement.classList).toContain('kbq-pipe_cleanable');
                expect(cleanable.nativeElement.classList).not.toContain('kbq-pipe_removable');
            });

            it('Text: state removable', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[3];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_removable');
                expect(removable.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
            });

            it('Text: state disabled', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[4];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_disabled');
            });
        });

        describe('KbqPipe states for type: Date', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(BaseFunctions);
                filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
                fixture.componentInstance.activeFilter = fixture.componentInstance.filters[3];
                fixture.detectChanges();
            });

            it('Date pipes', () => {
                const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

                expect(pipes.length).toBe(5);
                pipes.forEach((pipe) => {
                    expect(pipe.nativeElement.classList).toContain('kbq-pipe__date');
                });
            });

            it('Date: state required', () => {
                const required = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[0];

                expect(required.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_removable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_disabled');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_empty');
            });

            it('Date: state empty', () => {
                const empty = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[1];

                expect(empty.nativeElement.classList).toContain('kbq-pipe_empty');
            });

            it('Date: state cleanable', () => {
                const cleanable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[2];

                expect(cleanable.nativeElement.classList).toContain('kbq-pipe_cleanable');
                expect(cleanable.nativeElement.classList).not.toContain('kbq-pipe_removable');
            });

            it('Date: state removable', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[3];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_removable');
                expect(removable.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
            });

            it('Date: state disabled', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[4];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_disabled');
            });
        });

        describe('KbqPipe states for type: Datetime', () => {
            beforeEach(() => {
                fixture = TestBed.createComponent(BaseFunctions);
                filterBarDebugElement = fixture.debugElement.query(By.directive(KbqFilterBar));
                fixture.componentInstance.activeFilter = fixture.componentInstance.filters[4];
                fixture.detectChanges();
            });

            it('Datetime pipes', () => {
                const pipes = filterBarDebugElement.queryAll(By.css('.kbq-pipe'));

                expect(pipes.length).toBe(5);
                pipes.forEach((pipe) => {
                    expect(pipe.nativeElement.classList).toContain('kbq-pipe__datetime');
                });
            });

            it('Datetime: state required', () => {
                const required = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[0];

                expect(required.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_removable');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_disabled');
                expect(required.nativeElement.classList).not.toContain('kbq-pipe_empty');
            });

            it('Datetime: state empty', () => {
                const empty = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[1];

                expect(empty.nativeElement.classList).toContain('kbq-pipe_empty');
            });

            it('Datetime: state cleanable', () => {
                const cleanable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[2];

                expect(cleanable.nativeElement.classList).toContain('kbq-pipe_cleanable');
                expect(cleanable.nativeElement.classList).not.toContain('kbq-pipe_removable');
            });

            it('Datetime: state removable', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[3];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_removable');
                expect(removable.nativeElement.classList).not.toContain('kbq-pipe_cleanable');
            });

            it('Datetime: state disabled', () => {
                const removable = filterBarDebugElement.queryAll(By.css('.kbq-pipe'))[4];

                expect(removable.nativeElement.classList).toContain('kbq-pipe_disabled');
            });
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqFilterBarModule, KbqLuxonDateModule],
    template: `
        <kbq-filter-bar [pipeTemplates]="pipeTemplates" [(filter)]="activeFilter">
            <kbq-filters
                [filters]="filters"
                (onChangeFilter)="onChangeFilter($event)"
                (onRemoveFilter)="onDeleteFilter($event)"
                (onSave)="onSaveFilter($event)"
                (onSaveAsNew)="onSaveAsNewFilter($event)"
                (onSelectFilter)="onSelectFilter($event)"
            />

            @for (pipe of activeFilter?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }

            <kbq-pipe-add />

            <kbq-filter-reset (onResetFilter)="onResetFilter($event)" />

            <kbq-filter-search (onSearch)="onSearchFilter()" />
        </kbq-filter-bar>
    `
})
class BaseFunctions {
    readonly adapter = inject(DateAdapter<DateTime>);
    readonly changeDetectorRef = inject(ChangeDetectorRef);

    readonly onResetFilter = jasmine.createSpy('onResetFilterCallback');
    readonly onSearchFilter = jasmine.createSpy('onSearchCallback');

    @ViewChild(KbqFilters) filtersTrigger: KbqFilters;
    @ViewChild(KbqPipeAdd) pipeAdd: KbqPipeAdd;
    @ViewChild(KbqFilterBarSearch) search: KbqFilterBarSearch;

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

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Select,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Не определен', id: '1' },
                    type: KbqPipeTypes.Select,

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

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'required',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.MultiSelect,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: [{ name: 'Не определен', id: '1' }],
                    type: KbqPipeTypes.MultiSelect,

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

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    type: KbqPipeTypes.Text,
                    value: null,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'cleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanablecleanable',
                    value: 'valuevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevaluevalue',
                    type: KbqPipeTypes.Text,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: 'value',
                    type: KbqPipeTypes.Text,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: 'value',
                    type: KbqPipeTypes.Text,

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
                        start: this.adapter.today().toISO(),
                        end: this.adapter.today().minus({ days: 3 }).toISO()
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    value: null,
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: {
                        start: this.adapter.today().toISO(),
                        end: this.adapter.today().minus({ days: 3 }).toISO()
                    },
                    type: KbqPipeTypes.Date,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Date,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Date,

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
                        start: this.adapter.today().toISO(),
                        end: this.adapter.today().minus({ days: 3 }).toISO()
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'empty',
                    value: null,
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'cleanable',
                    value: {
                        start: this.adapter.today().toISO(),
                        end: this.adapter.today().minus({ days: 3 }).toISO()
                    },
                    type: KbqPipeTypes.Datetime,

                    cleanable: true,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'removable',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Datetime,

                    cleanable: false,
                    removable: true,
                    disabled: false
                },
                {
                    name: 'disabled',
                    value: { name: 'Последний день', start: { days: -1 }, end: null },
                    type: KbqPipeTypes.Datetime,

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

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

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

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

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

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

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

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: KbqPipeTypes.Select,

                    cleanable: false,
                    removable: false,
                    disabled: false
                },
                {
                    name: 'pipe 3',
                    value: ['3'],
                    type: KbqPipeTypes.MultiSelect,

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
            cleanable: false,
            removable: true,
            disabled: false
        },
        {
            name: 'Text',
            type: KbqPipeTypes.Text,

            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Date',
            type: KbqPipeTypes.Date,
            values: [
                { name: 'Последний день', start: { days: -1 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: false,
            removable: false,
            disabled: false
        },
        {
            name: 'Datetime',
            type: KbqPipeTypes.Datetime,
            values: [
                { name: 'Последний день', start: { days: -1 }, end: null },
                { name: 'Последние 3 дня', start: { days: -3 }, end: null },
                { name: 'Последние 7 дней', start: { days: -7 }, end: null },
                { name: 'Последние 30 дней', start: { days: -30 }, end: null },
                { name: 'Последние 90 дней', start: { days: -90 }, end: null },
                { name: 'Последний год', start: { years: -1 }, end: null }
            ],
            cleanable: true,
            removable: false,
            disabled: false
        }
    ];

    onSelectFilter(filter: KbqFilter) {
        this.activeFilter = filter;
    }

    onSaveAsNewFilter({ filter, filterBar }) {
        this.filters.push(filter);

        filterBar.filters.filterSavedSuccessfully();
    }

    onSaveFilter({ filter, filterBar }) {
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            filter
        );

        filterBar.filters.filterSavedSuccessfully();
    }

    onChangeFilter({ filter, filterBar }) {
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1,
            filter
        );

        filterBar.filters.filterSavedSuccessfully();
    }

    onDeleteFilter(filter: KbqFilter | null) {
        this.filters.splice(
            this.filters.findIndex(({ name }) => name === filter?.name),
            1
        );

        this.activeFilter = null;
    }
}
