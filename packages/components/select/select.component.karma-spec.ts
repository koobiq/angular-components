import { OverlayContainer, ScrollDispatcher } from '@angular/cdk/overlay';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    discardPeriodicTasks,
    fakeAsync,
    flush,
    inject,
    tick,
    waitForAsync
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DOWN_ARROW, END, HOME, UP_ARROW } from '@koobiq/cdk/keycodes';
import { createKeyboardEvent, dispatchEvent, dispatchKeyboardEvent, dispatchMouseEvent } from '@koobiq/cdk/testing';
import { KbqOption } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqSelectModule } from './index';
import { KbqSelect } from './select.component';

/** Finish initializing the virtual scroll component at the beginning of a test. */
function finishInit(fixture: ComponentFixture<any>) {
    // On the first cycle we render and measure the viewport.
    fixture.autoDetectChanges();
    flush();

    // On the second cycle we render the items.
    fixture.autoDetectChanges();
    flush();

    // Flush the initial fake scroll event.
    flush();
    fixture.autoDetectChanges();
}

/** The debounce interval when typing letters to select an option. */
const LETTER_KEY_DEBOUNCE_INTERVAL = 200;

const OPTIONS = [
    'Abakan',
    'Almetyevsk',
    'Anadyr',
    'Anapa',
    'Arkhangelsk',
    'Astrakhan',
    'Barnaul',
    'Belgorod',
    'Beslan',
    'Biysk',
    'Birobidzhan',
    'Blagoveshchensk',
    'Bologoye',
    'Bryansk',
    'Veliky Novgorod',
    'Veliky Ustyug',
    'Vladivostok',
    'Vladikavkaz',
    'Vladimir',
    'Volgograd',
    'Vologda',
    'Vorkuta',
    'Voronezh',
    'Gatchina',
    'Gdov',
    'Gelendzhik',
    'Gorno-Altaysk',
    'Grozny',
    'Gudermes',
    'Gus-Khrustalny',
    'Dzerzhinsk',
    'Dmitrov',
    'Dubna',
    'Yeysk',
    'Yekaterinburg',
    'Yelabuga',
    'Yelets',
    'Yessentuki',
    'Zlatoust',
    'Ivanovo',
    'Izhevsk',
    'Irkutsk',
    'Yoshkar-Ola',
    'Kazan',
    'Kaliningrad',
    'Kaluga',
    'Kemerovo',
    'Kislovodsk',
    'Komsomolsk-on-Amur',
    'Kotlas',
    'Krasnodar',
    'Krasnoyarsk',
    'Kurgan',
    'Kursk',
    'Kyzyl',
    'Leninogorsk',
    'Lensk',
    'Lipetsk',
    'Luga',
    'Lyuban',
    'Lyubertsy',
    'Magadan',
    'Maykop',
    'Makhachkala',
    'Miass',
    'Mineralnye Vody',
    'Mirny',
    'Moscow',
    'Murmansk',
    'Murom',
    'Mytishchi',
    'Naberezhnye Chelny',
    'Nadym',
    'Nalchik',
    'Nazran',
    'Naryan-Mar',
    'Nakhodka',
    'Nizhnevartovsk',
    'Nizhnekamsk',
    'Nizhny Novgorod',
    'Nizhny Tagil',
    'Novokuznetsk',
    'Novosibirsk',
    'Novy Urengoy',
    'Norilsk',
    'Obninsk',
    'Oktyabrsky',
    'Omsk',
    'Orenburg',
    'Orekhovo-Zuyevo',
    'Oryol',
    'Penza',
    'Perm',
    'Petrozavodsk',
    'Petropavlovsk-Kamchatsky',
    'Podolsk',
    'Pskov',
    'Pyatigorsk',
    'Rostov-on-Don',
    'Rybinsk',
    'Ryazan',
    'Salekhard',
    'Samara',
    'Saint Petersburg',
    'Saransk',
    'Saratov',
    'Severodvinsk',
    'Smolensk',
    'Sol-Iletsk',
    'Sochi',
    'Stavropol',
    'Surgut',
    'Syktyvkar',
    'Tambov',
    'Tver',
    'Tobolsk',
    'Tolyatti',
    'Tomsk',
    'Tuapse',
    'Tula',
    'Tynda',
    'Tyumen',
    'Ulan-Ude',
    'Ulyanovsk',
    'Ufa',
    'Khabarovsk',
    'Khanty-Mansiysk',
    'Chebarkul',
    'Cheboksary',
    'Chelyabinsk',
    'Cherepovets',
    'Cherkessk',
    'Chistopol',
    'Chita',
    'Shadrinsk',
    'Shatura',
    'Shuya',
    'Elista',
    'Engels',
    'Yuzhno-Sakhalinsk',
    'Yakutsk',
    'Yaroslavl'
];

@Component({
    selector: 'basic-select',
    template: `
        <div [style.height.px]="heightAbove"></div>
        <kbq-form-field>
            <kbq-select
                [formControl]="control"
                [required]="isRequired"
                [tabIndex]="tabIndexOverride"
                [panelClass]="panelClass"
                placeholder="Food"
            >
                <kbq-option
                    *ngFor="let food of foods"
                    [value]="food.value"
                    [disabled]="food.disabled"
                >
                    {{ food.viewValue }}
                </kbq-option>
                <ng-template
                    #kbqSelectTagContent
                    let-option
                    let-select="select"
                >
                    <kbq-tag
                        [selectable]="false"
                        [class.kbq-error]="select.errorState"
                    >
                        {{ option.viewValue }}
                        <i
                            *ngIf="!option.disabled && !select.disabled"
                            (click)="select.onRemoveMatcherItem(option, $event)"
                            kbq-icon="mc-close-S_16"
                            kbqTagRemove
                        ></i>
                    </kbq-tag>
                </ng-template>
            </kbq-select>
        </kbq-form-field>
        <div [style.height.px]="heightBelow"></div>
    `
})
class BasicSelect {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos', disabled: true },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new UntypedFormControl();
    isRequired: boolean;
    heightAbove = 0;
    heightBelow = 0;
    tabIndexOverride: number;
    panelClass = ['custom-one', 'custom-two'];

    @ViewChild(KbqSelect, { static: true }) select: KbqSelect;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;
}

@Component({
    selector: 'ng-model-select',
    template: `
        <kbq-form-field>
            <kbq-select
                [disabled]="isDisabled"
                placeholder="Food"
                ngModel
            >
                <kbq-option
                    *ngFor="let food of foods"
                    [value]="food.value"
                >
                    {{ food.viewValue }}
                </kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class NgModelSelect {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    isDisabled: boolean;

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;
}

@Component({
    selector: 'ng-if-select',
    template: `
        <div *ngIf="isShowing">
            <kbq-form-field>
                <kbq-select
                    [formControl]="control"
                    placeholder="Food I want to eat right now"
                >
                    <kbq-option
                        *ngFor="let food of foods"
                        [value]="food.value"
                    >
                        {{ food.viewValue }}
                    </kbq-option>
                </kbq-select>
            </kbq-form-field>
        </div>
    `
})
class NgIfSelect {
    isShowing = false;
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    control = new UntypedFormControl('pizza-1');

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
}

@Component({
    selector: 'basic-select-initially-hidden',
    template: `
        <kbq-form-field>
            <kbq-select [style.display]="isVisible ? 'block' : 'none'">
                <kbq-option [value]="'value'">There are no other options</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class BasicSelectInitiallyHidden {
    isVisible = false;
}

@Component({
    selector: 'basic-select-no-placeholder',
    template: `
        <kbq-form-field>
            <kbq-select>
                <kbq-option [value]="'value'">There are no other options</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class BasicSelectNoPlaceholder {}

@Component({
    selector: 'select-with-groups',
    template: `
        <kbq-form-field>
            <kbq-select
                [formControl]="control"
                placeholder="Pokemon"
            >
                <kbq-optgroup
                    *ngFor="let group of pokemonTypes"
                    [label]="group.name"
                    [disabled]="group.disabled"
                >
                    <kbq-option
                        *ngFor="let pokemon of group.pokemon"
                        [value]="pokemon.value"
                    >
                        {{ pokemon.viewValue }}
                    </kbq-option>
                </kbq-optgroup>
                <kbq-option [value]="'mime' - 11">Mr. Mime</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class SelectWithGroups {
    control = new UntypedFormControl();
    pokemonTypes = [
        {
            name: 'Grass',
            pokemon: [
                { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
                { value: 'oddish-1', viewValue: 'Oddish' },
                { value: 'bellsprout-2', viewValue: 'Bellsprout' }
            ]
        },
        {
            name: 'Water',
            disabled: true,
            pokemon: [
                { value: 'squirtle-3', viewValue: 'Squirtle' },
                { value: 'psyduck-4', viewValue: 'Psyduck' },
                { value: 'horsea-5', viewValue: 'Horsea' }
            ]
        },
        {
            name: 'Fire',
            pokemon: [
                { value: 'charmander-6', viewValue: 'Charmander' },
                { value: 'vulpix-7', viewValue: 'Vulpix' },
                { value: 'flareon-8', viewValue: 'Flareon' }
            ]
        },
        {
            name: 'Psychic',
            pokemon: [
                { value: 'mew-9', viewValue: 'Mew' },
                { value: 'mewtwo-10', viewValue: 'Mewtwo' }
            ]
        }
    ];

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;
}

@Component({
    selector: 'select-with-long-label-option',
    template: `
        <kbq-form-field>
            <kbq-select>
                <kbq-option [value]="'value1'">Not long text</kbq-option>
                <kbq-option
                    [value]="'value2'"
                    style="max-width: 200px;"
                >
                    Long long long long Long long long long Long long long long Long long long long Long long long long
                    Long long long long text
                </kbq-option>
                <kbq-option
                    [value]="'value3'"
                    style="max-width: 200px;"
                >
                    {{ changingLabel }}
                </kbq-option>
                <ng-template
                    #kbqSelectTagContent
                    let-option
                    let-select="select"
                >
                    <kbq-tag
                        [selectable]="false"
                        [class.kbq-error]="select.errorState"
                    >
                        {{ option.viewValue }}
                        <i
                            *ngIf="!option.disabled && !select.disabled"
                            (click)="select.onRemoveMatcherItem(option, $event)"
                            kbq-icon="mc-close-S_16"
                            kbqTagRemove
                        ></i>
                    </kbq-tag>
                </ng-template>
            </kbq-select>
        </kbq-form-field>
    `
})
class SelectWithLongOptionText {
    changingLabel: string =
        'Changed Long long long long Long long long long Long long long long Long long long long Long long long long Long long long long text';
    counter: number = 0;

    changeLabel(): void {
        this.changingLabel = this.changingLabel.concat((this.counter++).toString());
    }
}

@Component({
    selector: 'cdk-virtual-scroll-viewport-select',
    template: `
        <kbq-form-field>
            <kbq-select
                [(value)]="values"
                [multiple]="true"
                [style]="style"
            >
                <cdk-virtual-scroll-viewport
                    [itemSize]="itemSize"
                    [minBufferPx]="100"
                    [maxBufferPx]="400"
                >
                    <kbq-option
                        *cdkVirtualFor="let option of options; templateCacheSize: 0"
                        [value]="option"
                    >
                        {{ option }}
                    </kbq-option>
                </cdk-virtual-scroll-viewport>

                <kbq-cleaner />
            </kbq-select>
        </kbq-form-field>
    `
})
class CdkVirtualScrollViewportSelect<T = string> {
    itemSize = 32;
    control = new UntypedFormControl();
    isRequired: boolean;

    values: T[] = [];
    style = {};

    @ViewChild(KbqSelect, { static: true }) select: KbqSelect;
    @ViewChild(CdkVirtualScrollViewport) viewport: CdkVirtualScrollViewport;
    options: any[] = OPTIONS.sort();

    constructor(public scrollDispatcher: ScrollDispatcher) {}
}

describe('KbqSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    /**
     * Configures the test module for KbqSelect with the given declarations. This is broken out so
     * that we're only compiling the necessary test components for each test in order to speed up
     * overall test time.
     * @param declarations Components to declare for this block
     */
    function configureKbqSelectTestingModule(declarations: any[]) {
        TestBed.configureTestingModule({
            imports: [
                KbqFormFieldModule,
                KbqSelectModule,
                KbqInputModule,
                KbqTagsModule,
                ReactiveFormsModule,
                FormsModule,
                NoopAnimationsModule,
                ScrollingModule
            ],
            declarations
        }).compileComponents();

        inject([OverlayContainer], (oc: OverlayContainer) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
        })();
    }

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('core', () => {
        beforeEach(waitForAsync(() => {
            configureKbqSelectTestingModule([
                BasicSelect,
                SelectWithGroups
            ]);
        }));

        describe('overlay panel', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                flush();
            }));

            it('should set the width of the overlay based on the trigger', fakeAsync(() => {
                trigger.style.width = '200px';

                trigger.click();
                fixture.detectChanges();
                flush();

                const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
                expect(pane.style.minWidth).toBe('200px');
            }));
        });

        describe('disabled behavior', () => {
            it('should disable itself when control is disabled programmatically', fakeAsync(() => {
                const fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();

                fixture.componentInstance.control.disable();
                fixture.detectChanges();
                const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                    .withContext(`Expected cursor to be default arrow on disabled control.`)
                    .toEqual('default');

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent)
                    .withContext(`Expected select panel to stay closed.`)
                    .toEqual('');

                expect(fixture.componentInstance.select.panelOpen)
                    .withContext(`Expected select panelOpen property to stay false.`)
                    .toBe(false);

                fixture.componentInstance.control.enable();
                fixture.detectChanges();

                expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                    .withContext(`Expected cursor to be a pointer on enabled control.`)
                    .toEqual('pointer');

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(overlayContainerElement.textContent)
                    .withContext('Expected select panel to open normally on re-enabled control')
                    .toContain('Steak');

                expect(fixture.componentInstance.select.panelOpen)
                    .withContext(`Expected select panelOpen property to become true.`)
                    .toBe(true);
            }));
        });

        describe('keyboard scrolling', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let host: HTMLElement;
            let panel: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);

                fixture.componentInstance.foods = [];

                for (let i = 0; i < 30; i++) {
                    fixture.componentInstance.foods.push({ value: `value-${i}`, viewValue: `Option ${i}` });
                }

                fixture.detectChanges();
                fixture.componentInstance.select.open();
                fixture.detectChanges();
                flush();

                host = fixture.debugElement.query(By.css('kbq-select')).nativeElement;
                panel = overlayContainerElement.querySelector('.kbq-select__content') as HTMLElement;
            }));

            it('should scroll down to the active option', fakeAsync(() => {
                for (let i = 0; i < 15; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                    flush();
                }

                expect(panel.scrollTop).withContext('Expected scroll to be at the 16th option.').toBe(336);
            }));

            it('should scroll up to the active option', fakeAsync(() => {
                // Scroll to the bottom.
                for (let i = 0; i < fixture.componentInstance.foods.length; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                    flush();
                }

                for (let i = 0; i < 20; i++) {
                    dispatchKeyboardEvent(host, 'keydown', UP_ARROW);
                    flush();
                }

                expect(panel.scrollTop).withContext('Expected scroll to be at the 9th option.').toBe(208);
            }));

            it('should skip option group labels', fakeAsync(() => {
                fixture.destroy();

                const groupFixture = TestBed.createComponent(SelectWithGroups);

                groupFixture.detectChanges();
                groupFixture.componentInstance.select.open();
                groupFixture.detectChanges();
                flush();

                host = groupFixture.debugElement.query(By.css('kbq-select')).nativeElement;
                panel = overlayContainerElement.querySelector('.kbq-select__content') as HTMLElement;

                for (let i = 0; i < 5; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                }
                flush();

                // Note that we press down 5 times, but it will skip
                // 3 options because the second group is disabled.
                expect(panel.scrollTop).withContext('Expected scroll to be at the 9th option.').toBe(158);
            }));

            it('should scroll top the top when pressing HOME', fakeAsync(() => {
                for (let i = 0; i < 20; i++) {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();
                    flush();
                }

                expect(panel.scrollTop).withContext('Expected panel to be scrolled down.').toBeGreaterThan(0);

                dispatchKeyboardEvent(host, 'keydown', HOME);
                fixture.detectChanges();
                flush();

                expect(panel.scrollTop).withContext('Expected panel to be scrolled to the top').toBe(0);
            }));

            it('should scroll to the bottom of the panel when pressing END', fakeAsync(() => {
                dispatchKeyboardEvent(host, 'keydown', END);
                fixture.detectChanges();
                flush();

                expect(panel.scrollTop).withContext('Expected panel to be scrolled to the bottom').toBe(704);
            }));

            it('should scroll to the active option when typing', fakeAsync(() => {
                for (let i = 0; i < 15; i++) {
                    // Press the letter 'o' 15 times since all the options are named 'Option <index>'
                    dispatchEvent(host, createKeyboardEvent('keydown', 79, undefined, 'o'));
                    fixture.detectChanges();
                    tick(LETTER_KEY_DEBOUNCE_INTERVAL);
                }
                flush();

                expect(panel.scrollTop).withContext('Expected scroll to be at the 16th option.').toBe(336);
            }));
        });
    });

    describe('with ngModel', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([NgModelSelect])));

        it('should disable itself when control is disabled using the property', fakeAsync(() => {
            const fixture = TestBed.createComponent(NgModelSelect);
            fixture.detectChanges();

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();
            flush();

            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                .withContext(`Expected cursor to be default arrow on disabled control.`)
                .toEqual('default');

            trigger.click();
            fixture.detectChanges();

            expect(overlayContainerElement.textContent)
                .withContext(`Expected select panel to stay closed.`)
                .toEqual('');

            expect(fixture.componentInstance.select.panelOpen)
                .withContext(`Expected select panelOpen property to stay false.`)
                .toBe(false);

            fixture.componentInstance.isDisabled = false;
            fixture.detectChanges();
            flush();

            fixture.detectChanges();
            expect(getComputedStyle(trigger).getPropertyValue('cursor'))
                .withContext(`Expected cursor to be a pointer on enabled control.`)
                .toEqual('pointer');

            trigger.click();
            fixture.detectChanges();
            flush();

            expect(overlayContainerElement.textContent)
                .withContext('Expected select panel to open normally on re-enabled control')
                .toContain('Steak');

            expect(fixture.componentInstance.select.panelOpen)
                .withContext(`Expected select panelOpen property to become true.`)
                .toBe(true);
        }));
    });

    describe('with ngIf', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([NgIfSelect])));

        it('should handle nesting in an ngIf', fakeAsync(() => {
            const fixture = TestBed.createComponent(NgIfSelect);
            fixture.detectChanges();

            fixture.componentInstance.isShowing = true;
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            trigger.style.width = '300px';

            trigger.click();
            fixture.detectChanges();
            flush();

            const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
            expect(value.nativeElement.textContent)
                .withContext(`Expected trigger to be populated by the control's initial value.`)
                .toContain('Pizza');

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.style.minWidth).toEqual('300px');

            expect(fixture.componentInstance.select.panelOpen).toBe(true);
            expect(overlayContainerElement.textContent).toContain('Steak');
            expect(overlayContainerElement.textContent).toContain('Pizza');
            expect(overlayContainerElement.textContent).toContain('Tacos');
        }));
    });

    describe('when initially hidden', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([BasicSelectInitiallyHidden])));

        it('should set the width of the overlay if the element was hidden initially', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectInitiallyHidden);
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            trigger.style.width = '200px';
            fixture.componentInstance.isVisible = true;
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            flush();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(pane.style.minWidth).toBe('200px');
        }));
    });

    describe('with no placeholder', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([BasicSelectNoPlaceholder])));

        it('should set the width of the overlay if there is no placeholder', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectNoPlaceholder);

            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
            expect(parseInt(pane.style.minWidth as string)).toBeGreaterThan(0);
        }));
    });

    describe('option tooltip', () => {
        beforeEach(waitForAsync(() => {
            configureKbqSelectTestingModule([SelectWithLongOptionText]);
        }));

        let fixture: ComponentFixture<SelectWithLongOptionText>;
        let trigger: HTMLElement;

        class MockedResizeObserver implements ResizeObserver {
            elements: any[] = [];

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

            constructor(private callback: ResizeObserverCallback) {
                window.addEventListener('resize', () => this.onWindowResize());
            }
        }

        window.ResizeObserver = MockedResizeObserver;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithLongOptionText);
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        it('should display tooltip if ellipse applied', fakeAsync(() => {
            trigger.click();
            fixture.autoDetectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            dispatchMouseEvent(options[1], 'mouseenter');
            fixture.autoDetectChanges();

            window.dispatchEvent(new Event('resize'));
            fixture.autoDetectChanges();
            flush();

            discardPeriodicTasks();

            const tooltips = document.querySelectorAll('.kbq-tooltip__content');
            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toEqual(options[1].textContent!.trim());
            flush();
        }));
    });

    describe('with cdk-virtual-scroll-viewport', () => {
        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    KbqFormFieldModule,
                    KbqSelectModule,
                    KbqInputModule,
                    KbqTagsModule,
                    ReactiveFormsModule,
                    FormsModule,
                    NoopAnimationsModule,
                    ScrollingModule
                ],
                declarations: [CdkVirtualScrollViewportSelect]
            }).compileComponents();

            inject([OverlayContainer], (oc: OverlayContainer) => {
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
            })();
        }));

        let fixture: ComponentFixture<CdkVirtualScrollViewportSelect>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(CdkVirtualScrollViewportSelect<string>);
            finishInit(fixture);
        }));

        afterEach(fakeAsync(() => flush()));

        it('should calculate hidden items with virtual options', fakeAsync(() => {
            const triggerEl: HTMLElement = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            fixture.componentInstance.style = { width: '100px' };

            triggerEl.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            for (let step = 0; step < 2; step++) {
                if (options.item(step)) {
                    options.item(step).click();
                    tick();
                }
            }
            fixture.autoDetectChanges();
            flush();

            expect(fixture.componentInstance.select.hiddenItems).toEqual(1);

            options.item(2).click();
            fixture.autoDetectChanges();
            tick();
            flush();
            expect(fixture.componentInstance.select.hiddenItems).toEqual(2);
        }));
    });
});
