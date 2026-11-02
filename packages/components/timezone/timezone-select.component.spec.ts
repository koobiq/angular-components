import { OverlayContainer, ScrollDispatcher } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import { Component, OnInit, Type, effect, getDebugNode, signal, viewChild, viewChildren } from '@angular/core';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
    DOWN_ARROW,
    ESCAPE,
    KBQ_LOCALE_SERVICE,
    KBQ_PANEL_DEFAULT_MIN_WIDTH,
    KbqComponentColors,
    KbqLocaleService,
    KbqOptionModule,
    KbqOptionSelectionChange,
    KbqOverlayLayer,
    KbqPanelMaxHeight,
    KbqPanelMaxWidth,
    KbqPanelMinWidth,
    KbqPanelWidth,
    KbqRepositionScrollStrategy,
    KbqSelectFooter,
    KbqSelectMatcher,
    KbqSelectSearch,
    LEFT_ARROW,
    RIGHT_ARROW,
    UP_ARROW,
    createKeyboardEvent,
    dispatchEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    enUSLocaleData,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { Observable, Subject, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';
import {
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneOption,
    KbqTimezoneSelect,
    getKbqTimezoneSelectMultipleError,
    offsetFormatter,
    resolveZoneOffset
} from './index';
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
                                [kbqTooltipDisabled]="tooltipDisabled"
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
    tooltipDisabled: boolean | undefined;

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
                [panelMaxHeight]="panelMaxHeight"
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
    panelMaxHeight: KbqPanelMaxHeight = null;
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
                        offsetFormatter(resolveZoneOffset(zone)),
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

@Component({
    selector: 'standalone-timezone-select',
    imports: [KbqTimezoneSelect],
    template: '<kbq-timezone-select />'
})
class StandaloneTimezoneSelect {
    readonly select = viewChild.required(KbqTimezoneSelect);
}

@Component({
    selector: 'timezone-select-with-locale-configuration',
    imports: [KbqTimezoneSelect],
    template: '<kbq-timezone-select [localeOverrides]="configuration" />'
})
class TimezoneSelectWithLocaleConfiguration {
    readonly select = viewChild.required(KbqTimezoneSelect);
    readonly configuration = { timezone: { searchPlaceholder: 'Where?' } };
}

@Component({
    selector: 'timezone-select-with-footer',
    imports: [
        KbqOptionModule,
        KbqSelectFooter,
        KbqTimezoneModule
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select>
                @for (zone of zones; track zone) {
                    <kbq-timezone-option [timezone]="zone" />
                }

                <kbq-select-footer>Footer</kbq-select-footer>
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class TimezoneSelectWithFooter {
    readonly zones = groupedZones[0].zones;
    readonly select = viewChild.required(KbqTimezoneSelect);
}

@Component({
    selector: 'timezone-select-with-custom-trigger',
    imports: [
        KbqOptionModule,
        KbqTimezoneModule
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [(value)]="selected">
                <kbq-timezone-select-trigger>Custom trigger</kbq-timezone-select-trigger>

                @for (zone of zones; track zone) {
                    <kbq-timezone-option [timezone]="zone" />
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class TimezoneSelectWithCustomTrigger {
    readonly zones = groupedZones[0].zones;
    selected = groupedZones[0].zones[0].id;
}

@Component({
    selector: 'timezone-select-with-custom-matcher',
    imports: [
        KbqSelectMatcher,
        KbqTimezoneModule
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [(value)]="selected">
                <kbq-select-matcher>Custom matcher</kbq-select-matcher>

                @for (zone of zones; track zone) {
                    <kbq-timezone-option [timezone]="zone" />
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class TimezoneSelectWithCustomMatcher {
    readonly zones = groupedZones[0].zones;
    selected = groupedZones[0].zones[0].id;
}

@Component({
    selector: 'multiple-timezone-select',
    imports: [KbqTimezoneModule],
    template: '<kbq-timezone-select [multiple]="true" />'
})
class MultipleTimezoneSelect {}

@Component({
    selector: 'multiline-timezone-select',
    imports: [KbqTimezoneModule],
    template: '<kbq-timezone-select multiline />'
})
class MultilineTimezoneSelect {}

@Component({
    selector: 'timezone-select-with-locale-search',
    imports: [
        KbqInputModule,
        KbqSelectSearch,
        KbqTimezoneModule,
        ReactiveFormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [searchMinOptionsThreshold]="searchMinOptionsThreshold">
                <kbq-form-field kbqSelectSearch>
                    <input kbqInput type="text" [formControl]="searchControl" [placeholder]="placeholder" />
                </kbq-form-field>

                @for (zone of zones; track zone) {
                    <kbq-timezone-option [timezone]="zone" />
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class TimezoneSelectWithLocaleSearch {
    readonly zones = groupedZones[0].zones;
    readonly searchControl = new FormControl();
    readonly searchMinOptionsThreshold = undefined;
    placeholder: string = undefined!;
}

@Component({
    imports: [KbqFormFieldModule, KbqTimezoneModule],
    template: `
        <kbq-form-field>
            <kbq-timezone-select>
                @for (zone of zones; track zone.id) {
                    <kbq-timezone-option [value]="zone.id" [timezone]="zone" />
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
class TimezoneSelectOpenedByEffect {
    readonly zones = groupedZones[0].zones;
    readonly select = viewChild.required(KbqTimezoneSelect);
    readonly wantOpen = signal(false);
    runs = 0;

    constructor() {
        effect(() => {
            if (!this.wantOpen()) return;

            this.runs++;
            this.select().open();
        });
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
                ...declarations
            ],
            providers: [
                {
                    provide: ScrollDispatcher,
                    useFactory: () => ({
                        scrolled: () => scrolledSubject.asObservable(),
                        getAncestorScrollContainers: () => [],
                        register: () => {},
                        deregister: () => {}
                    })
                }
            ]
        }).compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    }

    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        overlayContainer.ngOnDestroy();
        vi.useRealTimers();
    });

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

            vi.spyOn(connectionContainer, 'getBoundingClientRect').mockReturnValue({
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

        it('should apply panelMaxHeight to the panel', () => {
            const pane = openPanelWithFieldWidth(
                TimezoneSelectWithPanelWidth,
                300,
                (host) => (host.panelMaxHeight = 400)
            );
            const panel = pane.querySelector<HTMLElement>('.kbq-timezone-select__panel')!;

            expect(panel.style.getPropertyValue('--kbq-select-panel-size-max-height')).toBe('400px');
        });
    });

    describe('keyboard navigation and tabindex', () => {
        describe('disabled behavior', () => {
            it('should not open the panel when the control is disabled and reopen when re-enabled', async () => {
                const fixture = TestBed.createComponent(BasicTimezoneSelect);

                fixture.detectChanges();

                fixture.componentInstance.control.disable();
                fixture.detectChanges();
                const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                trigger.click();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(overlayContainerElement.textContent).toEqual('');
                expect(fixture.componentInstance.select().panelOpen).toBe(false);

                fixture.componentInstance.control.enable();
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();

                expect(overlayContainerElement.textContent).toContain('UTC−02:00city1city4');
                expect(fixture.componentInstance.select().panelOpen).toBe(true);
            });
        });

        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let select: HTMLElement;

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

        beforeEach(async () => {
            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();
            select = fixture.debugElement.query(By.css('kbq-timezone-select')).nativeElement;
            await vi.runOnlyPendingTimersAsync();
        });

        it('should set the tabindex of the select to 0 by default', () => {
            expect(select.getAttribute('tabindex')).toEqual('0');
        });

        it('should be able to override the tabindex', async () => {
            fixture.componentInstance.tabIndexOverride = 3;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(select.getAttribute('tabindex')).toBe('3');
        });

        it('should set the tabindex of the select to -1 if disabled', async () => {
            fixture.componentInstance.control.disable();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            expect(select.getAttribute('tabindex')).toEqual('-1');

            fixture.componentInstance.control.enable();
            fixture.detectChanges();
            expect(select.getAttribute('tabindex')).toEqual('0');
        });

        it('should select options via the UP/DOWN arrow keys on a closed select', async () => {
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
            await vi.runOnlyPendingTimersAsync();

            expect(options[0].selected).toBe(true);
            expect(formControl.value).toBe(options[0].value);
        });

        it('should keep the selected option as the active one after click selection', async () => {
            const formControl = fixture.componentInstance.control;
            const options = fixture.componentInstance.options();

            expect(formControl.value).toBeFalsy();

            fixture.componentInstance.select().open();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            (overlayContainerElement.querySelectorAll('kbq-timezone-option')[2] as HTMLElement).click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(formControl.value).toBe(options[2].value);

            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(formControl.value).toBe(options[2].value);
        });

        it('should select options via LEFT/RIGHT arrow keys on a closed select', async () => {
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
            await vi.runOnlyPendingTimersAsync();

            expect(options[0].selected).toBe(true);
            expect(formControl.value).toBe(options[0].value);
        });

        it('should select an option by typing the first letters of its city', async () => {
            const formControl = fixture.componentInstance.control;
            const options = fixture.componentInstance.options();

            // `city1` is a prefix of `city17` too, so only matching on the city itself reaches the third option.
            for (const key of 'city17') {
                dispatchKeyboardEvent(select, 'keydown', key.toUpperCase().charCodeAt(0), undefined, key);
            }

            await vi.advanceTimersByTimeAsync(200);

            expect(formControl.value).toBe(options[2].value);
        });

        it.each([
            ['DOWN_ARROW', DOWN_ARROW],
            ['UP_ARROW', UP_ARROW]
        ])('should open the select using ALT + %s', async (_label: string, keyCode: number) => {
            const { control: formControl, select: selectInput } = fixture.componentInstance;
            const selectInstance = selectInput();

            expect(selectInstance.panelOpen).toBe(false);
            expect(formControl.value).toBeFalsy();

            const event = createKeyboardEvent('keydown', keyCode);

            Object.defineProperty(event, 'altKey', { get: () => true });

            dispatchEvent(select, event);
            await vi.runOnlyPendingTimersAsync();

            expect(selectInstance.panelOpen).toBe(true);
            expect(formControl.value).toBeFalsy();
        });
    });

    describe('overlay panel', () => {
        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let trigger: HTMLElement;

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

        beforeEach(async () => {
            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            await vi.runOnlyPendingTimersAsync();
        });

        it('should open the panel when trigger is clicked', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.componentInstance.select().panelOpen).toBe(true);
            expect(overlayContainerElement.textContent).toContain('city1');
            expect(overlayContainerElement.textContent).toContain('city7');
            expect(overlayContainerElement.textContent).toContain('city17');
        });

        it('should close the panel when an item is clicked', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;

            option.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(overlayContainerElement.textContent).toEqual('');
            expect(fixture.componentInstance.select().panelOpen).toBe(false);
        });

        it('should close the panel when a click occurs outside the panel', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            document.body.click();
            await vi.advanceTimersByTimeAsync(1);
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(overlayContainerElement.textContent).toEqual('');
            expect(fixture.componentInstance.select().panelOpen).toBe(false);
        });

        it('should not attempt to open a select that does not have any options', async () => {
            fixture.componentInstance.zones = [];
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            trigger.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.select().panelOpen).toBe(false);
        });

        it('should mark the overlay pane the way kbq-select does', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(overlayContainerElement.querySelector('.cdk-overlay-pane')!.classList).toContain(
                'kbq-select-overlay'
            );
        });

        it('should be able to set extra classes on the panel', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const panel = overlayContainerElement.querySelector('.kbq-select__panel') as HTMLElement;

            expect(panel.classList).toContain('custom-one');
            expect(panel.classList).toContain('custom-two');
        });
    });

    describe('selection logic', () => {
        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let trigger: HTMLElement;

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

        beforeEach(async () => {
            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            await vi.runOnlyPendingTimersAsync();
        });

        it('should select an option when it is clicked', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            let option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;

            option.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;

            expect(option.classList).toContain('kbq-selected');
            expect(fixture.componentInstance.options().at(0)!.selected).toBe(true);
            expect(fixture.componentInstance.select().selected).toBe(fixture.componentInstance.options().at(0)!);
        });

        it('should be able to select an option using the KbqOption API', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const optionInstances = fixture.componentInstance.options();
            const optionNodes: NodeListOf<HTMLElement> =
                overlayContainerElement.querySelectorAll('kbq-timezone-option');

            optionInstances[2].select();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(optionNodes[2].classList).toContain('kbq-selected');
            expect(optionInstances[2].selected).toBe(true);
            expect(fixture.componentInstance.select().selected).toBe(optionInstances[2]);
        });

        it('should display the selected option in the trigger', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;

            option.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const value = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

            expect(value.textContent).toContain('city4, city5');
        });

        it('should emit to `optionSelectionChanges` when an option is selected', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const spy = vi.fn();
            const subscription = fixture.componentInstance.select().optionSelectionChanges.subscribe(spy);
            const option = overlayContainerElement.querySelector('kbq-timezone-option') as HTMLElement;

            option.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(spy).toHaveBeenCalledWith(expect.any(KbqOptionSelectionChange));

            subscription.unsubscribe();
        });
    });

    describe('forms integration', () => {
        let fixture: ComponentFixture<BasicTimezoneSelect>;
        let trigger: HTMLElement;

        beforeEach(() => configureTestingModule([BasicTimezoneSelect]));

        beforeEach(async () => {
            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            await vi.runOnlyPendingTimersAsync();
        });

        it('should take an initial view value with reactive forms', async () => {
            fixture.componentInstance.control = new FormControl('Europe/city17');
            fixture.detectChanges();

            const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));

            expect(value.nativeElement.textContent).toContain('city17');

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const options = overlayContainerElement.querySelectorAll('kbq-timezone-option');

            expect(options[2].classList).toContain('kbq-selected');
        });

        it('should clear the selection when the control is reset', async () => {
            fixture.componentInstance.control.setValue('Europe/city17');
            fixture.componentInstance.control.reset();
            fixture.detectChanges();

            const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));

            expect(value.nativeElement.textContent.trim()).toBe('Timezones');
            expect(trigger.textContent).not.toContain('city17');

            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const options = overlayContainerElement.querySelectorAll('kbq-timezone-option');

            expect(options[1].classList).not.toContain('kbq-selected');
        });

        it('should colour the arrow when the error state changes outside the select', async () => {
            const { control } = fixture.componentInstance;
            const arrow = trigger.querySelector('.kbq-select__arrow')!;

            control.setErrors({ required: true });
            control.markAsTouched();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(arrow.classList).toContain(`kbq-${KbqComponentColors.Error}`);

            control.markAsUntouched();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(arrow.classList).toContain(`kbq-${KbqComponentColors.ContrastFade}`);
        });
    });

    describe('with a search', () => {
        let fixture: ComponentFixture<TimezoneSelectWithSearch>;
        let trigger: HTMLElement;

        beforeEach(() => configureTestingModule([TimezoneSelectWithSearch]));

        beforeEach(async () => {
            fixture = TestBed.createComponent(TimezoneSelectWithSearch);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            await vi.runOnlyPendingTimersAsync();
        });

        it('should have search input', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
        });

        it('should focus the search field after opening', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const input = fixture.debugElement.query(By.css('input')).nativeElement;

            expect(input).toBe(document.activeElement);
        });

        it('should filter options by the search input value', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'city1';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            await vi.advanceTimersByTimeAsync(1);

            const options = fixture.debugElement.queryAll(By.css('.kbq-timezone-option__offset-wrapper'));

            expect(options.length).toBe(2);
            expect(options[0].nativeElement.textContent.replace(/[\r\n]/g, ' ')).toContain('UTC−02:00');
            expect(options[1].nativeElement.textContent.replace(/[\r\n]/g, ' ')).toContain('UTC+04:00');
        });

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

        it('should hide the search input when option count is below the threshold', async () => {
            const { componentInstance } = fixture;

            componentInstance.minOptionsThreshold = 10;
            fixture.detectChanges();

            await vi.advanceTimersByTimeAsync(0);

            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.debugElement.query(By.css('input'))).toBeFalsy();
        });

        it('should show the search input when option count is at or above the threshold', async () => {
            const { componentInstance } = fixture;

            componentInstance.minOptionsThreshold = 2;
            fixture.detectChanges();

            await vi.advanceTimersByTimeAsync(0);

            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(fixture.debugElement.query(By.css('input'))).toBeTruthy();
        });
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

        beforeEach(async () => {
            originalResizeObserver = window.ResizeObserver;
            (window as any).ResizeObserver = MockedResizeObserver;

            fixture = TestBed.createComponent(BasicTimezoneSelect);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            await vi.runOnlyPendingTimersAsync();
        });

        afterEach(() => {
            window.ResizeObserver = originalResizeObserver;
        });

        it('should not display the tooltip when option text fits within the visible-rows clamp', async () => {
            trigger.click();
            fixture.detectChanges();
            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-timezone-option');

            options[0].style.width = '200px';

            dispatchMouseEvent(options[0], 'mouseenter');
            await vi.advanceTimersByTimeAsync(0);
            fixture.detectChanges();

            const tooltips = document.querySelectorAll('.kbq-tooltip__content');

            expect(tooltips.length).toEqual(0);
        });

        it('should display tooltip when option text wraps beyond the visible rows count', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(500);

            const optionInstances = fixture.componentInstance.options();
            const tooltipContentEl = optionInstances[2].tooltipContent().nativeElement;

            vi.spyOn(tooltipContentEl, 'getClientRects').mockReturnValue([
                {} as DOMRect,
                {} as DOMRect,
                {} as DOMRect,
                {} as DOMRect
            ] as unknown as DOMRectList);

            const optionEls = overlayContainerElement.querySelectorAll<HTMLElement>('kbq-timezone-option');

            dispatchMouseEvent(optionEls[2], 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(500);

            const tooltips = document.querySelectorAll('.kbq-tooltip__content');

            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toContain(longOptionText);
        });

        it('should reactively update disabled via ResizeObserver without mouseenter', async () => {
            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const optionInstances = fixture.componentInstance.options();
            const tooltipContentEl = optionInstances[2].tooltipContent().nativeElement;
            const optionEls = overlayContainerElement.querySelectorAll<HTMLElement>('kbq-timezone-option');
            const directive = getDebugNode(optionEls[2])!.injector.get(KbqTimezoneOptionTooltip);

            // JSDOM defaults: getClientRects().length = 0 ≤ TOOLTIP_VISIBLE_ROWS_COUNT → disabled
            expect(directive.disabled).toBe(true);

            vi.spyOn(tooltipContentEl, 'getClientRects').mockReturnValue(
                new Array(TOOLTIP_VISIBLE_ROWS_COUNT + 1).fill({}) as unknown as DOMRectList
            );
            window.dispatchEvent(new Event('resize'));
            await vi.advanceTimersByTimeAsync(150); // past debounceTime(100)

            expect(directive.disabled).toBe(false);

            await vi.runOnlyPendingTimersAsync();
        });

        it('should keep kbqTooltipDisabled over an option that wraps beyond the visible rows', async () => {
            fixture.componentInstance.tooltipDisabled = true;
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const tooltipContentEl = fixture.componentInstance.options()[2].tooltipContent().nativeElement;
            const optionEls = overlayContainerElement.querySelectorAll<HTMLElement>('kbq-timezone-option');
            const directive = getDebugNode(optionEls[2])!.injector.get(KbqTimezoneOptionTooltip);

            vi.spyOn(tooltipContentEl, 'getClientRects').mockReturnValue(
                new Array(TOOLTIP_VISIBLE_ROWS_COUNT + 1).fill({}) as unknown as DOMRectList
            );
            window.dispatchEvent(new Event('resize'));
            dispatchMouseEvent(optionEls[2], 'mouseenter');
            fixture.detectChanges();
            await vi.advanceTimersByTimeAsync(500);
            fixture.detectChanges();

            expect(directive.disabled).toBe(true);
            expect(document.querySelectorAll('.kbq-tooltip__content').length).toBe(0);
        });
    });

    // `KbqTimezoneSelect` is exported standalone, so `imports: [KbqTimezoneSelect]` is a legitimate way to
    // consume it — but it extends `KbqSelect` and inherits its `KBQ_SELECT_SCROLL_STRATEGY` injection, while
    // its own `imports` carry no module that provides that token. Every other suite here pulls in
    // `KbqSelectModule`, which hides the gap.
    describe('without KbqSelectModule', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [StandaloneTimezoneSelect] });

            overlayContainer = TestBed.inject(OverlayContainer);
        });

        it('should render when imported as a bare standalone component', () => {
            const fixture = TestBed.createComponent(StandaloneTimezoneSelect);

            fixture.detectChanges();

            expect(fixture.componentInstance.select().scrollStrategy).toBeInstanceOf(KbqRepositionScrollStrategy);
        });
    });

    // The select is the only component here that declares no carrier of its own: `[localeOverrides]` and
    // the `KbqLocaleOverridesDirective` behind it are inherited from `KbqSelect`, which is also why
    // re-declaring them would match the same directive twice and raise NG0309.
    describe('locale configuration', () => {
        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [TimezoneSelectWithLocaleConfiguration] });

            overlayContainer = TestBed.inject(OverlayContainer);
        });

        it('should take the strings of a single instance through the carrier inherited from the select', () => {
            const fixture = TestBed.createComponent(TimezoneSelectWithLocaleConfiguration);

            fixture.detectChanges();

            expect(fixture.componentInstance.select().timezoneLocaleConfiguration().searchPlaceholder).toBe('Where?');
        });
    });

    describe('overlay layer', () => {
        @Component({
            imports: [KbqFormFieldModule, KbqTimezoneModule, KbqOverlayLayer],
            template: `
                <div kbqOverlayLayer>
                    <kbq-form-field>
                        <kbq-timezone-select placeholder="Timezones">
                            @for (zone of zones; track zone) {
                                <kbq-timezone-option [value]="zone.id" [timezone]="zone" />
                            }
                        </kbq-timezone-select>
                    </kbq-form-field>
                </div>
            `
        })
        class TimezoneSelectInOverlayLayer {
            zones = groupedZones[0].zones;

            readonly select = viewChild.required(KbqTimezoneSelect);
        }

        beforeEach(() => configureTestingModule([TimezoneSelectInOverlayLayer]));

        it('should render the panel of a timezone select inside the element into its overlay layer', async () => {
            const fixture = TestBed.createComponent(TimezoneSelectInOverlayLayer);

            fixture.detectChanges();

            const select = fixture.componentInstance.select();

            select.open();
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            const overlayHost = select.panel()!.nativeElement.closest('.cdk-overlay-pane').parentElement;

            expect(overlayHost.parentElement).toBe(
                fixture.nativeElement.querySelector('[kbqOverlayLayer] > .kbq-overlay-layer')
            );
        });
    });

    describe('multiple selection', () => {
        it('should reject [multiple]="true" bound in the template', () => {
            configureTestingModule([MultipleTimezoneSelect]);

            const fixture = TestBed.createComponent(MultipleTimezoneSelect);

            expect(() => fixture.detectChanges()).toThrow(getKbqTimezoneSelectMultipleError().message);
        });

        it('should reject multiline, which turns on multiple selection as well', () => {
            configureTestingModule([MultilineTimezoneSelect]);

            const fixture = TestBed.createComponent(MultilineTimezoneSelect);

            expect(() => fixture.detectChanges()).toThrow(getKbqTimezoneSelectMultipleError().message);
        });
    });

    describe('footer', () => {
        let fixture: ComponentFixture<TimezoneSelectWithFooter>;

        beforeEach(() => {
            configureTestingModule([TimezoneSelectWithFooter]);

            fixture = TestBed.createComponent(TimezoneSelectWithFooter);
            fixture.detectChanges();
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();
        });

        it('should project the footer outside the scrollable option list', () => {
            expect(overlayContainerElement.querySelector('kbq-select-footer')).toBeTruthy();
            expect(overlayContainerElement.querySelector('.kbq-select__content kbq-select-footer')).toBeNull();
        });

        it('should close the panel when the footer is clicked', () => {
            overlayContainerElement.querySelector<HTMLElement>('kbq-select-footer')!.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.select().panelOpen).toBe(false);
        });
    });

    describe('custom trigger', () => {
        beforeEach(() => configureTestingModule([TimezoneSelectWithCustomTrigger]));

        it('should replace the trigger value with the projected content', async () => {
            const fixture = TestBed.createComponent(TimezoneSelectWithCustomTrigger);

            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            const matcher = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

            expect(matcher.textContent).toContain('Custom trigger');
            expect(fixture.debugElement.query(By.css('.kbq-select__matcher-text'))).toBeNull();
        });
    });

    describe('custom matcher', () => {
        beforeEach(() => configureTestingModule([TimezoneSelectWithCustomMatcher]));

        it('should replace the whole matcher with the projected one', () => {
            const fixture = TestBed.createComponent(TimezoneSelectWithCustomMatcher);

            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            expect(trigger.querySelector('kbq-select-matcher').textContent).toBe('Custom matcher');
            expect(trigger.querySelector('.kbq-select__matcher')).toBeNull();
        });
    });

    describe('search placeholder', () => {
        function createWithLocaleService(placeholder?: string) {
            // `KBQ_LOCALE_SERVICE` has no factory, so nothing follows a locale until it is provided.
            TestBed.configureTestingModule({
                imports: [TimezoneSelectWithLocaleSearch],
                providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
            });

            overlayContainer = TestBed.inject(OverlayContainer);
            overlayContainerElement = overlayContainer.getContainerElement();

            const fixture = TestBed.createComponent(TimezoneSelectWithLocaleSearch);

            fixture.componentInstance.placeholder = placeholder!;
            fixture.detectChanges();
            // The search only reaches the DOM with the panel: it is projected into the overlay template.
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();

            return fixture;
        }

        const getPlaceholder = () =>
            overlayContainerElement.querySelector('[kbqSelectSearch] input')!.getAttribute('placeholder');

        it('should apply the placeholder of the active locale', async () => {
            createWithLocaleService();
            await vi.runOnlyPendingTimersAsync();

            expect(getPlaceholder()).toBe(ruRULocaleData.timezone.searchPlaceholder);
        });

        it('should follow a locale change instead of latching to the first one', async () => {
            const fixture = createWithLocaleService();

            await vi.runOnlyPendingTimersAsync();
            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(getPlaceholder()).toBe(enUSLocaleData.timezone.searchPlaceholder);
        });

        it('should never overwrite a placeholder the consumer supplied', async () => {
            const fixture = createWithLocaleService('Consumer placeholder');

            await vi.runOnlyPendingTimersAsync();
            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(getPlaceholder()).toBe('Consumer placeholder');
        });

        it('should keep a placeholder the consumer supplies after the first render', async () => {
            const fixture = createWithLocaleService();

            await vi.runOnlyPendingTimersAsync();
            fixture.componentInstance.placeholder = 'Consumer placeholder';
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(getPlaceholder()).toBe('Consumer placeholder');

            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();

            expect(getPlaceholder()).toBe('Consumer placeholder');
        });

        it('should apply the placeholder of the active locale once the consumer drops its own', async () => {
            const fixture = createWithLocaleService('Consumer placeholder');

            await vi.runOnlyPendingTimersAsync();
            fixture.componentInstance.placeholder = undefined!;
            fixture.detectChanges();
            await vi.runOnlyPendingTimersAsync();
            fixture.detectChanges();

            expect(getPlaceholder()).toBe(ruRULocaleData.timezone.searchPlaceholder);
        });
    });

    describe('opened from an effect', () => {
        beforeEach(() => configureTestingModule([TimezoneSelectOpenedByEffect]));

        it('should not make the effect run again when the user closes it', async () => {
            const fixture = TestBed.createComponent(TimezoneSelectOpenedByEffect);
            const settle = async (): Promise<void> => {
                fixture.detectChanges();
                await vi.runOnlyPendingTimersAsync();
                fixture.detectChanges();
            };

            await settle();
            fixture.componentInstance.wantOpen.set(true);
            await settle();

            const select = fixture.componentInstance.select();

            expect(select.panelOpen).toBe(true);

            dispatchKeyboardEvent(select.elementRef.nativeElement, 'keydown', ESCAPE);
            await settle();

            expect(select.panelOpen).toBe(false);
            expect(fixture.componentInstance.runs).toBe(1);
        });
    });
});
