import { OverlayContainer, ScrollDispatcher } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import { Component, OnInit, Type, getDebugNode, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    DOWN_ARROW,
    ESCAPE,
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    KbqOptionModule,
    KbqOptionSelectionChange,
    KbqPanelMaxWidth,
    KbqPanelMinWidth,
    KbqPanelWidth,
    KbqSelectSearch,
    LEFT_ARROW,
    RIGHT_ARROW,
    UP_ARROW,
    createKeyboardEvent,
    dispatchEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { Observable, Subject, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { KbqTimezoneGroup, KbqTimezoneModule, KbqTimezoneOption, KbqTimezoneSelect, offsetFormatter } from './index';
import { KbqTimezoneOptionTooltip, TOOLTIP_VISIBLE_ROWS_COUNT } from './timezone-option.directive';

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
    'village'
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
                cities: 'city4, city5'
            },
            {
                id: 'Europe/city7',
                offset: '08:00:00',
                city: 'city7',
                countryCode: 'ru',
                countryName: 'Russia',
                cities: 'city9, city22'
            },
            {
                id: 'Europe/city17',
                offset: '04:00:00',
                city: 'city17',
                countryCode: 'ru',
                countryName: 'Russia',
                cities: longOptionText
            }
        ]
    }
];

@Component({
    selector: 'basic-timezone-select',
    imports: [
        KbqTimezoneModule,
        ReactiveFormsModule,
        KbqOptionModule
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select
                placeholder="Timezones"
                [formControl]="control"
                [tabIndex]="tabIndexOverride"
                [panelClass]="panelClass"
            >
                @for (group of zones; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        @for (zone of group.zones; track zone) {
                            <kbq-timezone-option
                                [value]="zone.id"
                                [timezone]="zone"
                                [disabled]="zone.id === disabledFor"
                            />
                        }
                    </kbq-optgroup>
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class BasicTimezoneSelect {
    zones: KbqTimezoneGroup[] = groupedZones;
    control = new FormControl();
    tabIndexOverride: number = 0;
    panelClass = ['custom-one', 'custom-two'];
    disabledFor = 'Europe/city7';

    readonly select = viewChild.required(KbqTimezoneSelect);
    readonly options = viewChildren(KbqTimezoneOption);
}

@Component({
    selector: 'timezone-select-with-panel-width',
    imports: [
        KbqTimezoneModule,
        KbqOptionModule
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select
                [panelMaxWidth]="panelMaxWidth"
                [panelMinWidth]="panelMinWidth"
                [panelWidth]="panelWidth"
            >
                @for (zone of zones; track zone) {
                    <kbq-timezone-option [value]="zone.id" [timezone]="zone" />
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class TimezoneSelectWithPanelWidth {
    zones = groupedZones[0].zones;
    panelWidth: KbqPanelWidth = null;
    panelMinWidth: KbqPanelMinWidth = KBQ_PANEL_DEFAULT_MIN_WIDTH;
    panelMaxWidth: KbqPanelMaxWidth = null;
}

@Component({
    selector: 'select-with-search',
    imports: [
        KbqInputModule,
        KbqSelectSearch,
        KbqTimezoneModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [searchMinOptionsThreshold]="minOptionsThreshold" [(value)]="selected">
                <kbq-form-field kbqSelectSearch>
                    <input kbqInput type="text" [formControl]="searchCtrl" />
                </kbq-form-field>

                @for (group of options$ | async; track group) {
                    @for (timezone of group.zones; track timezone) {
                        <kbq-timezone-option [timezone]="timezone" />
                    }
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class TimezoneSelectWithSearch implements OnInit {
    readonly select = viewChild.required(KbqTimezoneSelect);
    minOptionsThreshold: number;

    selected = 'Europe/city17';

    searchCtrl: FormControl = new FormControl();
    options$: Observable<KbqTimezoneGroup[]>;

    ngOnInit(): void {
        this.options$ = merge(
            of(groupedZones),
            this.searchCtrl.valueChanges.pipe(map(() => this.getFilteredOptions()))
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
                        zone.cities
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
                ...declarations
            ],
            providers: [
                {
                    provide: ScrollDispatcher,
                    useFactory: () => ({
                        scrolled: () => scrolledSubject.asObservable(),
                        getAncestorScrollContainers: () => []
                    })
                }
            ]
        }).compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    }

    afterEach(() => overlayContainer.ngOnDestroy());

    describe('panel width', () => {
        /**
         * Opens the panel with the form field measuring the given width and returns the rendered pane.
         * JSDOM does not lay out, so the connection container has to be mocked.
         */
        function openPanelWithFieldWidth<T>(host: Type<T>, fieldWidth: number, setup?: (instance: T) => void) {
            configureTestingModule([host]);

            const fixture = TestBed.createComponent(host);

            setup?.(fixture.componentInstance);
            fixture.detectChanges();

            const connectionContainer = fixture.debugElement.query(By.css('.kbq-form-field__container')).nativeElement;

            jest.spyOn(connectionContainer, 'getBoundingClientRect').mockReturnValue({
                width: fieldWidth,
                height: 32,
                top: 0,
                left: 0,
                right: fieldWidth,
                bottom: 32,
                x: 0,
                y: 0,
                toJSON: () => {}
            } as DOMRect);

            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();

            return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
        }

        // `KbqTimezoneSelect` declares no width members of its own — these pin the defaults it inherits
        // from `KbqSelect`: size to the content, but never narrower than the field or `panelMinWidth`.
        it('should size to the content rather than to the field by default', () => {
            expect(openPanelWithFieldWidth(BasicTimezoneSelect, 300).style.width).toBe('');
        });

        it('should not get narrower than the field by default', () => {
            expect(openPanelWithFieldWidth(BasicTimezoneSelect, 800).style.minWidth).toBe('800px');
        });

        it('should floor at the inherited panelMinWidth when the field is narrower', () => {
            expect(openPanelWithFieldWidth(BasicTimezoneSelect, 100).style.minWidth).toBe(
                `${KBQ_PANEL_DEFAULT_MIN_WIDTH}px`
            );
        });

        it('should match the field when panelWidth is auto', () => {
            const pane = openPanelWithFieldWidth(
                TimezoneSelectWithPanelWidth,
                300,
                (host) => (host.panelWidth = 'auto')
            );

            expect(pane.style.width).toBe('300px');
        });

        it('should use an explicit panelWidth and ignore panelMinWidth', () => {
            const pane = openPanelWithFieldWidth(TimezoneSelectWithPanelWidth, 300, (host) => (host.panelWidth = 400));

            expect(pane.style.width).toBe('400px');
            expect(pane.style.minWidth).toBe('');
        });

        it('should apply panelMaxWidth to the panel', () => {
            const pane = openPanelWithFieldWidth(
                TimezoneSelectWithPanelWidth,
                300,
                (host) => (host.panelMaxWidth = 500)
            );
            const panel = pane.querySelector<HTMLElement>('.kbq-timezone-select__panel')!;

            expect(panel.style.maxWidth).toBe('500px');
        });
    });

    describe('keyboard navigation and tabindex', () => {
        describe('disabled behavior', () => {
            it('should not open the panel when the control is disabled and reopen when re-enabled', fakeAsync(() => {
                const fixture = TestBed.createComponent(BasicTimezoneSelect);

                fixture.detectChanges();

                fixture.componentInstance.control.disable();
                fixture.detectChanges();
                const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent).toEqual('');
                expect(fixture.componentInstance.select().panelOpen).toBe(false);

                fixture.componentInstance.control.enable();
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent).toContain('UTC−02:00city1city4');
                expect(fixture.componentInstance.select().panelOpen).toBe(true);
            }));
        });

        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let select: HTMLElement;

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();
            select = fixture.debugElement.query(By.css('kbq-timezone-select')).nativeElement;
            flush();
        }));

        it('should set the tabindex of the select to 0 by default', () => {
            expect(select.getAttribute('tabindex')).toEqual('0');
        });

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
            const options = fixture.componentInstance.options();

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

        it('should keep the selected option as the active one after click selection', fakeAsync(() => {
            const formControl = fixture.componentInstance.control;
            const options = fixture.componentInstance.options();

            expect(formControl.value).toBeFalsy();

            fixture.componentInstance.select().open();
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
            const options = fixture.componentInstance.options();

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

        it.each([
            ['DOWN_ARROW', DOWN_ARROW],
            ['UP_ARROW', UP_ARROW]
        ])(
            'should open the select using ALT + %s',
            fakeAsync((_label: string, keyCode: number) => {
                const { control: formControl, select: selectInput } = fixture.componentInstance;
                const selectInstance = selectInput();

                expect(selectInstance.panelOpen).toBe(false);
                expect(formControl.value).toBeFalsy();

                const event = createKeyboardEvent('keydown', keyCode);

                Object.defineProperty(event, 'altKey', { get: () => true });

                dispatchEvent(select, event);
                flush();

                expect(selectInstance.panelOpen).toBe(true);
                expect(formControl.value).toBeFalsy();
            })
        );
    });

    describe('overlay panel', () => {
        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let trigger: HTMLElement;

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

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

            expect(fixture.componentInstance.select().panelOpen).toBe(true);
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
            expect(fixture.componentInstance.select().panelOpen).toBe(false);
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
            expect(fixture.componentInstance.select().panelOpen).toBe(false);
        }));

        it('should not attempt to open a select that does not have any options', fakeAsync(() => {
            fixture.componentInstance.zones = [];
            fixture.detectChanges();
            flush();

            trigger.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.select().panelOpen).toBe(false);
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

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

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
            expect(fixture.componentInstance.options().at(0)!.selected).toBe(true);
            expect(fixture.componentInstance.select().selected).toBe(fixture.componentInstance.options().at(0)!);
        }));

        it('should be able to select an option using the KbqOption API', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const optionInstances = fixture.componentInstance.options();
            const optionNodes: NodeListOf<HTMLElement> =
                overlayContainerElement.querySelectorAll('kbq-timezone-option');

            optionInstances[2].select();
            fixture.detectChanges();
            flush();

            expect(optionNodes[2].classList).toContain('kbq-selected');
            expect(optionInstances[2].selected).toBe(true);
            expect(fixture.componentInstance.select().selected).toBe(optionInstances[2]);
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

            const spy = jest.fn();
            const subscription = fixture.componentInstance.select().optionSelectionChanges.subscribe(spy);
            const option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;

            option.click();
            fixture.detectChanges();
            flush();

            expect(spy).toHaveBeenCalledWith(expect.any(KbqOptionSelectionChange));

            subscription.unsubscribe();
        }));
    });

    describe('forms integration', () => {
        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let trigger: HTMLElement;

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

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

    describe('with a search', () => {
        let fixture: ComponentFixture<TimezoneSelectWithSearch>;
        let trigger: HTMLElement;

        beforeEach(() => configureTestingModule([TimezoneSelectWithSearch]));

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

            expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
        }));

        it('should focus the search field after opening', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(input).toBe(document.activeElement);
        }));

        it('should filter options by the search input value', fakeAsync(() => {
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
            expect(options[0].nativeElement.textContent.replace(/[\r\n]/g, ' ')).toContain('UTC−02:00');
            expect(options[1].nativeElement.textContent.replace(/[\r\n]/g, ' ')).toContain('UTC+04:00');
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

        it('should close the panel by ESC when the search input is empty', () => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            dispatchKeyboardEvent(inputElementDebug.nativeElement, 'keydown', ESCAPE);

            fixture.detectChanges();

            const selectInstance = fixture.componentInstance.select();

            expect(selectInstance.panelOpen).toBe(false);
        });

        it('should hide the search input when option count is below the threshold', fakeAsync(() => {
            const { componentInstance } = fixture;

            componentInstance.minOptionsThreshold = 10;
            fixture.detectChanges();

            tick();

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeFalsy();
        }));

        it('should show the search input when option count is at or above the threshold', fakeAsync(() => {
            const { componentInstance } = fixture;

            componentInstance.minOptionsThreshold = 2;
            fixture.detectChanges();

            tick();

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
        }));
    });

    describe('option tooltip', () => {
        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let trigger: HTMLElement;
        let originalResizeObserver: typeof ResizeObserver;

        class MockedResizeObserver implements ResizeObserver {
            elements: Element[] = [];

            constructor(private callback: ResizeObserverCallback) {
                window.addEventListener('resize', () => this.onWindowResize());
            }

            observe(target: Element): void {
                this.elements.push(target);
            }

            unobserve(target: Element): void {
                const idx = this.elements.indexOf(target);

                if (idx > -1) {
                    this.elements.splice(idx, 1);
                }
            }

            disconnect(): void {
                window.removeEventListener('resize', this.onWindowResize.bind(this));
            }

            private onWindowResize(): void {
                const entries = this.elements.map((target) => ({ target }) as ResizeObserverEntry);

                this.callback(entries, this);
            }
        }

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

        beforeEach(fakeAsync(() => {
            originalResizeObserver = window.ResizeObserver;
            (window as any).ResizeObserver = MockedResizeObserver;

            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        afterEach(() => {
            window.ResizeObserver = originalResizeObserver;
        });

        it('should not display the tooltip when option text fits within the visible-rows clamp', fakeAsync(() => {
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

        it('should display tooltip when option text wraps beyond the visible rows count', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const optionInstances = fixture.componentInstance.options();
            const tooltipContentEl = optionInstances[2].tooltipContent().nativeElement;

            jest.spyOn(tooltipContentEl, 'getClientRects').mockReturnValue([
                {} as DOMRect,
                {} as DOMRect,
                {} as DOMRect,
                {} as DOMRect
            ] as unknown as DOMRectList);

            const optionEls = overlayContainerElement.querySelectorAll<HTMLElement>('kbq-timezone-option');

            dispatchMouseEvent(optionEls[2], 'mouseenter');
            fixture.detectChanges();
            flush();
            discardPeriodicTasks();

            const tooltips = document.querySelectorAll('.kbq-tooltip__content');

            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toContain(longOptionText);
        }));

        it('should reactively update disabled via ResizeObserver without mouseenter', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const optionInstances = fixture.componentInstance.options();
            const tooltipContentEl = optionInstances[2].tooltipContent().nativeElement;
            const optionEls = overlayContainerElement.querySelectorAll<HTMLElement>('kbq-timezone-option');
            const directive = getDebugNode(optionEls[2])!.injector.get(KbqTimezoneOptionTooltip);

            // JSDOM defaults: getClientRects().length = 0 ≤ TOOLTIP_VISIBLE_ROWS_COUNT → disabled
            expect(directive.disabled).toBe(true);

            jest.spyOn(tooltipContentEl, 'getClientRects').mockReturnValue(
                new Array(TOOLTIP_VISIBLE_ROWS_COUNT + 1).fill({}) as unknown as DOMRectList
            );
            window.dispatchEvent(new Event('resize'));
            tick(150); // past debounceTime(100)

            expect(directive.disabled).toBe(false);

            flush();
        }));
    });
});
