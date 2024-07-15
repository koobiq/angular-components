/* tslint:disable:no-magic-numbers */
/* tslint:disable:no-non-null-assertion */
/* tslint:disable:no-empty */
/* tslint:disable:no-unbound-method */
/* tslint:disable:prefer-for-of */
/* tslint:disable:no-unnecessary-type-assertion */

import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer, ScrollDispatcher } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    discardPeriodicTasks,
    fakeAsync,
    flush,
    inject,
    tick,
    waitForAsync,
} from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DOWN_ARROW, ESCAPE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, dispatchEvent, dispatchKeyboardEvent, dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KbqOptionSelectionChange } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelect, KbqSelectModule } from '@koobiq/components/select';
import { Observable, Subject, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqTimezoneGroup, KbqTimezoneModule, KbqTimezoneOption, KbqTimezoneSelect, offsetFormatter } from './index';

const longOptionText: string = [
    'Gordon Freeman Town',
    'Barney Calhoun Town',
    'G-Man Town',
    'Wallace Breen Town',
    'Eli Vance Town',
    'Isaac Kleiner Village',
    'Father Grigori Town',
    'GLaDOS',
    'Chef Vortigaunt Town',
    'Adrian Shephard Village',
    'Nihilanth Town',
    'Judith Mossman Village',
    'Walter Bennet Village',
    'city',
    'village',
    'city',
    'village',
    'city',
    'city',
    'village',
    'city',
    'village',
    'city',
    'village',
    'city',
    'village',
].join(', ');

const groupedZones: KbqTimezoneGroup[] = [
    {
        countryCode: 'ru',
        countryName: 'Russia',
        zones: [
            {
                id: 'Europe/city1',
                offset: '-02:00:00',
                city: 'city1',
                countryCode: 'ru',
                countryName: 'Russia',
                cities: 'city4, city5',
            },
            {
                id: 'Europe/city7',
                offset: '08:00:00',
                city: 'city7',
                countryCode: 'ru',
                countryName: 'Russia',
                cities: 'city9, city22',
            },
            {
                id: 'Europe/city17',
                offset: '04:00:00',
                city: 'city17',
                countryCode: 'ru',
                countryName: 'Russia',
                cities: longOptionText,
            },
        ],
    },
];

@Component({
    selector: 'basic-timezone-select',
    template: `
        <div [style.height.px]="heightAbove"></div>
        <kbq-form-field>
            <kbq-timezone-select
                placeholder="Timezones"
                [formControl]="control"
                [required]="isRequired"
                [tabIndex]="tabIndexOverride"
                [panelClass]="panelClass"
            >
                <kbq-optgroup *ngFor="let group of zones" [label]="group.countryName">
                    <kbq-timezone-option
                        *ngFor="let zone of group.zones"
                        [value]="zone.id"
                        [timezone]="zone"
                        [disabled]="zone.id === disabledFor"
                    ></kbq-timezone-option>
                </kbq-optgroup>
            </kbq-timezone-select>
        </kbq-form-field>
        <div [style.height.px]="heightBelow"></div>
    `,
})
class BasicTimezoneSelect {
    zones: KbqTimezoneGroup[] = groupedZones;
    control = new FormControl();
    isRequired: boolean;
    heightAbove = 0;
    heightBelow = 0;
    tabIndexOverride: number;
    panelClass = ['custom-one', 'custom-two'];
    disabledFor = 'Europe/city7';

    @ViewChild(KbqTimezoneSelect, { static: true }) select: KbqSelect;
    @ViewChildren(KbqTimezoneOption) options: QueryList<KbqTimezoneOption>;
}

@Component({
    selector: 'select-with-search',
    template: `
        <kbq-form-field>
            <kbq-timezone-select [(value)]="selected">
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbqPrefix kbq-icon="mc-search_16"></i>
                    <input kbqInput [formControl]="searchCtrl" [placeholder]="'Город или часовой пояс'" type="text" />
                    <kbq-cleaner></kbq-cleaner>
                </kbq-form-field>

                <kbq-cleaner #kbqSelectCleaner></kbq-cleaner>

                <div kbq-select-search-empty-result>Ничего не найдено</div>

                <ng-container *ngFor="let group of options$ | async">
                    <kbq-timezone-option
                        *ngFor="let timezone of group.zones"
                        [timezone]="timezone"
                    ></kbq-timezone-option>
                </ng-container>
            </kbq-timezone-select>
        </kbq-form-field>
    `,
})
class TimezoneSelectWithSearch {
    @ViewChild(KbqTimezoneSelect, { static: true }) select: KbqTimezoneSelect;

    selected = 'Europe/city17';

    searchCtrl: FormControl = new FormControl();
    options$: Observable<KbqTimezoneGroup[]>;

    ngOnInit(): void {
        this.options$ = merge(
            of(groupedZones),
            this.searchCtrl.valueChanges.pipe(map(() => this.getFilteredOptions())),
        );
    }

    private getFilteredOptions(): KbqTimezoneGroup[] {
        if (!this.searchCtrl.value) {
            return groupedZones;
        }

        return groupedZones
            .map((group) => {
                const zones = group.zones.filter((zone) => {
                    const fields: string[] = [
                        offsetFormatter(zone.offset),
                        zone.city,
                        zone.cities,
                    ];

                    return fields.join(' ').toLowerCase().includes(this.searchCtrl.value.toLowerCase());
                });

                return { ...group, zones };
            })
            .filter((group) => group.zones.length > 0);
    }
}

describe('KbqTimezoneSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    // @ts-ignore
    let dir: { value: 'ltr' | 'rtl' };
    // @ts-ignore
    let platform: Platform;
    const scrolledSubject: Subject<any> = new Subject();

    function configureTestingModule(declarations: any[]) {
        TestBed.configureTestingModule({
            imports: [
                KbqFormFieldModule,
                KbqSelectModule,
                KbqTimezoneModule,
                KbqInputModule,
                ReactiveFormsModule,
                FormsModule,
                NoopAnimationsModule,
            ],
            declarations,
            providers: [
                { provide: Directionality, useFactory: () => (dir = { value: 'ltr' }) },
                {
                    provide: ScrollDispatcher,
                    useFactory: () => ({
                        scrolled: () => scrolledSubject.asObservable(),
                        getAncestorScrollContainers: () => [],
                    }),
                },
            ],
        }).compileComponents();

        inject([OverlayContainer, Platform], (oc: OverlayContainer, p: Platform) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
            platform = p;
        })();
    }

    afterEach(() => overlayContainer.ngOnDestroy());

    describe('core', () => {
        beforeEach(waitForAsync(() => configureTestingModule([BasicTimezoneSelect])));

        describe('accessibility', () => {
            describe('for kbq-timezone-select', () => {
                let fixture: ComponentFixture<BasicTimezoneSelect>;
                let select: HTMLElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicTimezoneSelect);
                    fixture.detectChanges();
                    select = fixture.debugElement.query(By.css('kbq-timezone-select')).nativeElement;
                    flush();
                }));

                it('should set the tabindex of the select to 0 by default', fakeAsync(() => {
                    expect(select.getAttribute('tabindex')).toEqual('0');
                }));

                it('should be able to override the tabindex', fakeAsync(() => {
                    fixture.componentInstance.tabIndexOverride = 3;
                    fixture.detectChanges();
                    flush();

                    expect(select.getAttribute('tabindex')).toBe('3');
                }));

                it('should set the tabindex of the select to -1 if disabled', fakeAsync(() => {
                    fixture.componentInstance.control.disable();
                    fixture.detectChanges();
                    flush();
                    expect(select.getAttribute('tabindex')).toEqual('-1');

                    fixture.componentInstance.control.enable();
                    fixture.detectChanges();
                    expect(select.getAttribute('tabindex')).toEqual('0');
                }));

                it('should select options via the UP/DOWN arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy();

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    expect(options[0].selected).toBe(true);
                    expect(formControl.value).toBe(options[0].value);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[2].selected).toBe(true);
                    expect(formControl.value).toBe(options[2].value);

                    dispatchKeyboardEvent(select, 'keydown', UP_ARROW);
                    flush();

                    expect(options[0].selected).toBe(true);
                    expect(formControl.value).toBe(options[0].value);
                }));

                it('should resume focus from selected item after selecting via click', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy();

                    fixture.componentInstance.select.open();
                    fixture.detectChanges();
                    flush();

                    (overlayContainerElement.querySelectorAll('kbq-timezone-option')[2] as HTMLElement).click();
                    fixture.detectChanges();
                    flush();

                    expect(formControl.value).toBe(options[2].value);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();
                    flush();

                    expect(formControl.value).toBe(options[2].value);
                }));

                it('should select options via LEFT/RIGHT arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).toBeFalsy();

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    expect(options[0].selected).toBe(true);
                    expect(formControl.value).toBe(options[0].value);

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[2].selected).toBe(true);
                    expect(formControl.value).toBe(options[2].value);

                    dispatchKeyboardEvent(select, 'keydown', LEFT_ARROW);
                    flush();

                    expect(options[0].selected).toBe(true);
                    expect(formControl.value).toBe(options[0].value);
                }));

                it('should open a single-selection select using ALT + DOWN_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).toBe(false);
                    expect(formControl.value).toBeFalsy();

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(true);
                    expect(formControl.value).toBeFalsy();
                }));

                it('should open a single-selection select using ALT + UP_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).toBe(false);
                    expect(formControl.value).toBeFalsy();

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).toBe(true);
                    expect(formControl.value).toBeFalsy();
                }));
            });

            describe('overlay panel', () => {
                let fixture: ComponentFixture<BasicTimezoneSelect>;
                let trigger: HTMLElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicTimezoneSelect);
                    fixture.detectChanges();
                    trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                    flush();
                }));

                it('should open the panel when trigger is clicked', fakeAsync(() => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    expect(fixture.componentInstance.select.panelOpen).toBe(true);
                    expect(overlayContainerElement.textContent).toContain('city1');
                    expect(overlayContainerElement.textContent).toContain('city7');
                    expect(overlayContainerElement.textContent).toContain('city17');
                }));

                it('should close the panel when an item is clicked', fakeAsync(() => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;
                    option.click();
                    fixture.detectChanges();
                    flush();

                    expect(overlayContainerElement.textContent).toEqual('');
                    expect(fixture.componentInstance.select.panelOpen).toBe(false);
                }));

                it('should close the panel when a click occurs outside the panel', fakeAsync(() => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    document.body.click();
                    tick(1);
                    fixture.detectChanges();
                    flush();

                    expect(overlayContainerElement.textContent).toEqual('');
                    expect(fixture.componentInstance.select.panelOpen).toBe(false);
                }));

                it('should not attempt to open a select that does not have any options', fakeAsync(() => {
                    fixture.componentInstance.zones = [];
                    fixture.detectChanges();
                    flush();

                    trigger.click();
                    fixture.detectChanges();

                    expect(fixture.componentInstance.select.panelOpen).toBe(false);
                }));

                it('should be able to set extra classes on the panel', fakeAsync(() => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const panel = overlayContainerElement.querySelector('.kbq-select__panel') as HTMLElement;

                    expect(panel.classList).toContain('custom-one');
                    expect(panel.classList).toContain('custom-two');
                }));
            });

            describe('selection logic', () => {
                let fixture: ComponentFixture<BasicTimezoneSelect>;
                let trigger: HTMLElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicTimezoneSelect);
                    fixture.detectChanges();
                    trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                    flush();
                }));

                it('should select an option when it is clicked', fakeAsync(() => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    let option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;
                    option.click();
                    fixture.detectChanges();
                    flush();

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;

                    expect(option.classList).toContain('kbq-selected');
                    expect(fixture.componentInstance.options.first.selected).toBe(true);
                    expect(fixture.componentInstance.select.selected).toBe(fixture.componentInstance.options.first);
                }));

                it('should be able to select an option using the KbqOption API', fakeAsync(() => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const optionInstances = fixture.componentInstance.options.toArray();
                    const optionNodes: NodeListOf<HTMLElement> =
                        overlayContainerElement.querySelectorAll('kbq-timezone-option');

                    optionInstances[2].select();
                    fixture.detectChanges();
                    flush();

                    expect(optionNodes[2].classList).toContain('kbq-selected');
                    expect(optionInstances[2].selected).toBe(true);
                    expect(fixture.componentInstance.select.selected).toBe(optionInstances[2]);
                }));

                it('should display the selected option in the trigger', fakeAsync(() => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;
                    option.click();
                    fixture.detectChanges();
                    flush();

                    const value = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

                    expect(value.textContent).toContain('city4, city5');
                }));

                it('should emit to `optionSelectionChanges` when an option is selected', fakeAsync(() => {
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const spy = jasmine.createSpy('option selection spy');
                    const subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                    const option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;
                    option.click();
                    fixture.detectChanges();
                    flush();

                    expect(spy).toHaveBeenCalledWith(jasmine.any(KbqOptionSelectionChange));

                    subscription.unsubscribe();
                }));
            });

            describe('forms integration', () => {
                let fixture: ComponentFixture<BasicTimezoneSelect>;
                let trigger: HTMLElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicTimezoneSelect);
                    fixture.detectChanges();
                    trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                    flush();
                }));

                it('should take an initial view value with reactive forms', fakeAsync(() => {
                    fixture.componentInstance.control = new FormControl('Europe/city17');
                    fixture.detectChanges();

                    const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                    expect(value.nativeElement.textContent).toContain('city17');

                    trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const options = overlayContainerElement.querySelectorAll('kbq-timezone-option');
                    expect(options[2].classList).toContain('kbq-selected');
                }));

                it('should clear the selection when the control is reset', fakeAsync(() => {
                    fixture.componentInstance.control.setValue('Europe/city17');
                    fixture.detectChanges();

                    fixture.componentInstance.control.reset();
                    fixture.detectChanges();

                    const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                    expect(value.nativeElement.textContent.trim()).toBe('Timezones');
                    expect(trigger.textContent).not.toContain('city17');

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    const options = overlayContainerElement.querySelectorAll('kbq-timezone-option');
                    expect(options[1].classList).not.toContain('kbq-selected');
                }));
            });

            describe('disabled behavior', () => {
                it('should disable itself when control is disabled programmatically', fakeAsync(() => {
                    const fixture = TestBed.createComponent(BasicTimezoneSelect);
                    fixture.detectChanges();

                    fixture.componentInstance.control.disable();
                    fixture.detectChanges();
                    const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                    expect(getComputedStyle(trigger).getPropertyValue('cursor')).toEqual('default');

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    expect(overlayContainerElement.textContent).toEqual('');
                    expect(fixture.componentInstance.select.panelOpen).toBe(false);

                    fixture.componentInstance.control.enable();
                    fixture.detectChanges();
                    expect(getComputedStyle(trigger).getPropertyValue('cursor')).toEqual('pointer');

                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    expect(overlayContainerElement.textContent).toContain('RussiaUTC−02:00city1city4');
                    expect(fixture.componentInstance.select.panelOpen).toBe(true);
                }));
            });
        });
    });

    describe('with a search', () => {
        beforeEach(waitForAsync(() => configureTestingModule([TimezoneSelectWithSearch])));

        let fixture: ComponentFixture<TimezoneSelectWithSearch>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(TimezoneSelectWithSearch);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        it('should have search input', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeDefined();
        }));

        it('should search filed should be focused after open', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(input).toBe(document.activeElement);
        }));

        it('should search', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'city1';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            fixture.detectChanges();
            flush();
            tick(1);

            const options = fixture.debugElement.queryAll(By.css('.kbq-timezone-option__offset-wrapper'));

            expect(options.length).toBe(2);
            expect(options[0].nativeElement.innerText.replace(/[\r\n]/g, ' ')).toContain('UTC −02:00');
            expect(options[1].nativeElement.innerText.replace(/[\r\n]/g, ' ')).toContain('UTC +04:00');
        }));

        it('should clear search by esc', () => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'city1';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            fixture.detectChanges();

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            expect(inputElementDebug.nativeElement.value).toBe('');
        });

        it('should close list by esc if input is empty', () => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            const selectInstance = fixture.componentInstance.select;

            expect(selectInstance.panelOpen).toBe(false);
        });
    });

    describe('option tooltip', () => {
        beforeEach(waitForAsync(() => {
            configureTestingModule([BasicTimezoneSelect]);
        }));

        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let trigger: HTMLElement;

        class MockedResizeObserver implements ResizeObserver {
            elements: any[] = [];

            constructor(private callback: ResizeObserverCallback) {
                window.addEventListener('resize', () => this.onWindowResize());
            }

            observe(target: Element) {
                this.elements.push(target);
            }

            unobserve(target: Element) {
                const idx = this.elements.indexOf(target);

                if (idx > -1) {
                    this.elements.splice(idx, 1);
                }
            }

            disconnect() {
                window.removeEventListener('resize', this.onWindowResize);
            }

            private onWindowResize() {
                this.callback(this.elements, this);
            }
        }

        window.ResizeObserver = MockedResizeObserver;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        it('should not display tooltip if ellipse not applied', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-timezone-option');

            options[0].style.width = '200px';

            dispatchMouseEvent(options[0], 'mouseenter');
            tick();
            fixture.detectChanges();

            const tooltips = document.querySelectorAll('.kbq-tooltip__content');

            expect(tooltips.length).toEqual(0);
        }));

        it('should display tooltip if ellipse applied', fakeAsync(() => {
            trigger.click();
            fixture.autoDetectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-timezone-option');

            options[2].style.width = '200px';
            dispatchMouseEvent(options[2], 'mouseenter');
            fixture.autoDetectChanges();

            window.dispatchEvent(new Event('resize'));
            fixture.autoDetectChanges();
            flush();

            discardPeriodicTasks();

            const tooltips = document.querySelectorAll('.kbq-tooltip__content');

            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toContain(longOptionText);
        }));
    });
});
