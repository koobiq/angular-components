/* tslint:disable:no-magic-numbers */
/* tslint:disable:no-non-null-assertion */
/* tslint:disable:no-empty */
/* tslint:disable:no-unbound-method */
/* tslint:disable:prefer-for-of */

// TODO: fix linter
// tslint:disable
import { Directionality } from '@angular/cdk/bidi';
import { OverlayContainer, ScrollDispatcher } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    Component,
    DebugElement,
    OnInit,
    QueryList,
    TemplateRef,
    ViewChild,
    ViewChildren
} from '@angular/core';
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
import {
    ControlValueAccessor,
    FormGroupDirective,
    FormsModule,
    NG_VALUE_ACCESSOR,
    ReactiveFormsModule,
    UntypedFormControl,
    UntypedFormGroup,
    Validators
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    A,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SPACE,
    TAB,
    UP_ARROW
} from '@koobiq/cdk/keycodes';
import {
    createKeyboardEvent,
    dispatchEvent,
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    dispatchMouseEvent,
    wrappedErrorMessage
} from '@koobiq/cdk/testing';
import {
    ErrorStateMatcher,
    KbqOption,
    KbqOptionSelectionChange,
    KbqVirtualOption,
    ThemePalette,
    getKbqSelectDynamicMultipleError,
    getKbqSelectNonArrayValueError,
    getKbqSelectNonFunctionValueError
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagsModule } from '@koobiq/components/tags';
import { Observable, Subject, Subscription, merge, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
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
    selector: 'basic-events',
    template: `
        <kbq-form-field>
            <kbq-select
                (openedChange)="openedChangeListener($event)"
                (opened)="openedListener()"
                (closed)="closedListener()"
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
    `
})
class BasicEvents {
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

    @ViewChild(KbqSelect, { static: true }) select: KbqSelect;

    openedChangeListener = jasmine.createSpy('KbqSelect openedChange listener');
    openedListener = jasmine.createSpy('KbqSelect opened listener');
    closedListener = jasmine.createSpy('KbqSelect closed listener');
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
    selector: 'many-selects',
    template: `
        <kbq-form-field>
            <kbq-select placeholder="First">
                <kbq-option [value]="'one'">one</kbq-option>
                <kbq-option [value]="'two'">two</kbq-option>
            </kbq-select>
        </kbq-form-field>
        <kbq-form-field>
            <kbq-select placeholder="Second">
                <kbq-option [value]="'three'">three</kbq-option>
                <kbq-option [value]="'four'">four</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class ManySelects {}

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
    selector: 'select-with-change-event',
    template: `
        <kbq-form-field>
            <kbq-select (selectionChange)="changeListener($event)">
                <kbq-option
                    *ngFor="let food of foods"
                    [value]="food"
                >
                    {{ food }}
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
class SelectWithChangeEvent {
    foods: string[] = [
        'steak-0',
        'pizza-1',
        'tacos-2',
        'sandwich-3',
        'chips-4',
        'eggs-5',
        'pasta-6',
        'sushi-7'
    ];

    changeListener = jasmine.createSpy('KbqSelect change listener');
}

@Component({
    selector: 'select-with-search',
    template: `
        <kbq-form-field>
            <kbq-select
                #select
                [(value)]="singleSelectedWithSearch"
            >
                <kbq-form-field kbqSelectSearch>
                    <input
                        [formControl]="searchCtrl"
                        kbqInput
                        type="text"
                    />
                </kbq-form-field>

                <kbq-option
                    *ngFor="let option of options$ | async"
                    [value]="option"
                >
                    {{ option }}
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
class SelectWithSearch {
    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;

    singleSelectedWithSearch = 'Moscow';

    searchCtrl: UntypedFormControl = new UntypedFormControl();
    options$: Observable<string[]>;

    private options: string[] = OPTIONS;

    ngOnInit(): void {
        this.options$ = merge(
            of(OPTIONS),
            this.searchCtrl.valueChanges.pipe(map((value) => this.getFilteredOptions(value)))
        );
    }

    private getFilteredOptions(value): string[] {
        const searchFilter = value && value.new ? value.value : value;

        return searchFilter
            ? this.options.filter((option) => option.toLowerCase().includes(searchFilter.toLowerCase()))
            : this.options;
    }
}

@Component({
    selector: 'custom-select-accessor',
    template: `
        <kbq-form-field>
            <kbq-select></kbq-select>
        </kbq-form-field>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CustomSelectAccessor,
            multi: true
        }
    ]
})
class CustomSelectAccessor implements ControlValueAccessor {
    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;

    writeValue: (value?: any) => void = () => {};
    registerOnChange: (changeFn?: (value: any) => void) => void = () => {};
    registerOnTouched: (touchedFn?: () => void) => void = () => {};
}

@Component({
    selector: 'comp-with-custom-select',
    template: `
        <custom-select-accessor [formControl]="ctrl"></custom-select-accessor>
    `,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: CustomSelectAccessor,
            multi: true
        }
    ]
})
class CompWithCustomSelect {
    ctrl = new UntypedFormControl('initial value');
    @ViewChild(CustomSelectAccessor, { static: true }) customAccessor: CustomSelectAccessor;
}

@Component({
    selector: 'select-infinite-loop',
    template: `
        <kbq-form-field>
            <kbq-select [(ngModel)]="value"></kbq-select>
        </kbq-form-field>
        <throws-error-on-init></throws-error-on-init>
    `
})
class SelectWithErrorSibling {
    value: string;
}

@Component({
    selector: 'throws-error-on-init',
    template: ''
})
class ThrowsErrorOnInit implements OnInit {
    ngOnInit() {
        throw Error('Oh no!');
    }
}

@Component({
    selector: 'basic-select-on-push',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select
                [formControl]="control"
                placeholder="Food"
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
class BasicSelectOnPush {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    control = new UntypedFormControl();
}

@Component({
    selector: 'basic-select-on-push-preselected',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-form-field>
            <kbq-select
                [formControl]="control"
                placeholder="Food"
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
class BasicSelectOnPushPreselected {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    control = new UntypedFormControl('pizza-1');
}

@Component({
    selector: 'multi-select',
    template: `
        <kbq-form-field>
            <kbq-select
                [formControl]="control"
                [sortComparator]="sortComparator"
                multiple
                placeholder="Food"
            >
                <kbq-option
                    *ngFor="let food of foods"
                    [value]="food.value"
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
    `
})
class MultiSelect {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new UntypedFormControl();

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;
    sortComparator: (a: KbqOption, b: KbqOption, options: KbqOption[]) => number;
}

@Component({
    selector: 'multi-select-narrow',
    template: `
        <kbq-form-field>
            <kbq-select
                [formControl]="control"
                [sortComparator]="sortComparator"
                multiple
                placeholder="Food"
                style="width: 100px;"
            >
                <kbq-option
                    *ngFor="let food of foods"
                    [value]="food.value"
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
    `
})
class MultiSelectNarrow {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new UntypedFormControl();

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;
    sortComparator: (a: KbqOption, b: KbqOption, options: KbqOption[]) => number;
}

@Component({
    selector: 'select-with-plain-tabindex',
    template: `
        <kbq-form-field>
            <kbq-select [tabIndex]="5"></kbq-select>
        </kbq-form-field>
    `
})
class SelectWithPlainTabindex {}

@Component({
    selector: 'select-early-sibling-access',
    template: `
        <kbq-form-field>
            <kbq-select #select="kbqSelect"></kbq-select>
        </kbq-form-field>
        <div *ngIf="select.selected"></div>
    `
})
class SelectEarlyAccessSibling {}

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
    selector: 'basic-select-with-theming',
    template: `
        <kbq-form-field [color]="theme">
            <kbq-select placeholder="Food">
                <kbq-option [value]="'steak' - 0">Steak</kbq-option>
                <kbq-option [value]="'pizza' - 1">Pizza</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class BasicSelectWithTheming {
    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    theme: ThemePalette;
}

@Component({
    selector: 'reset-values-select',
    template: `
        <kbq-form-field>
            <kbq-select
                [formControl]="control"
                placeholder="Food"
            >
                <kbq-option
                    *ngFor="let food of foods"
                    [value]="food.value"
                >
                    {{ food.viewValue }}
                </kbq-option>
                <kbq-option>None</kbq-option>
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
class ResetValuesSelect {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' },
        { value: false, viewValue: 'Falsy' },
        { viewValue: 'Undefined' },
        { value: null, viewValue: 'Null' }];
    control = new UntypedFormControl();

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
}

@Component({
    template: `
        <kbq-form-field>
            <kbq-select [formControl]="control">
                <kbq-option
                    *ngFor="let food of foods"
                    [value]="food.value"
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
    `
})
class FalsyValueSelect {
    foods: any[] = [
        { value: 0, viewValue: 'Steak' },
        { value: 1, viewValue: 'Pizza' }
    ];
    control = new UntypedFormControl();
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;
}

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
                    <ng-container *ngFor="let pokemon of group.pokemon">
                        <kbq-option [value]="pokemon.value">{{ pokemon.viewValue }}</kbq-option>
                    </ng-container>
                </kbq-optgroup>
            </kbq-select>
        </kbq-form-field>
    `
})
class SelectWithGroupsAndNgContainer {
    control = new UntypedFormControl();
    pokemonTypes = [
        {
            name: 'Grass',
            pokemon: [{ value: 'bulbasaur-0', viewValue: 'Bulbasaur' }]
        }
    ];
}

@Component({
    template: `
        <form>
            <kbq-form-field>
                <kbq-select [(ngModel)]="value"></kbq-select>
            </kbq-form-field>
        </form>
    `
})
class InvalidSelectInForm {
    value: any;
}

@Component({
    template: `
        <form
            [formGroup]="formGroup"
            (ngSubmit)="submitReactive()"
        >
            <kbq-form-field>
                <kbq-select
                    placeholder="Food"
                    formControlName="food"
                >
                    <kbq-option [value]="'steak' - 0">Steak</kbq-option>
                    <kbq-option [value]="'pizza' - 1">Pizza</kbq-option>
                </kbq-select>

                <!--<kbq-error>This field is required</kbq-error>-->
            </kbq-form-field>
        </form>
    `
})
class SelectInsideFormGroup {
    @ViewChild(FormGroupDirective, { static: false }) formGroupDirective: FormGroupDirective;
    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    formControl = new UntypedFormControl('', Validators.required);
    formGroup = new UntypedFormGroup({
        food: this.formControl
    });
    submitResult: string;

    // tslint:disable-next-line:no-empty
    submitReactive() {
        this.submitResult = this.formGroup.invalid ? 'invalid' : 'valid';
    }
}

@Component({
    template: `
        <kbq-form-field>
            <kbq-select
                [(value)]="selectedFood"
                placeholder="Food"
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
class BasicSelectWithoutForms {
    selectedFood: string | null;
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'sandwich-2', viewValue: 'Sandwich' }
    ];

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;

    avoidCollisionMockTarget() {}
}

@Component({
    template: `
        <kbq-form-field>
            <kbq-select
                [(value)]="selectedFood"
                placeholder="Food"
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
class BasicSelectWithoutFormsPreselected {
    selectedFood = 'pizza-1';
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' }
    ];

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
}

@Component({
    template: `
        <kbq-form-field>
            <kbq-select
                [(value)]="selectedFoods"
                placeholder="Food"
                multiple
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
class BasicSelectWithoutFormsMultiple {
    selectedFoods: string[];
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'sandwich-2', viewValue: 'Sandwich' }
    ];

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
}

@Component({
    selector: 'select-with-custom-trigger',
    template: `
        <kbq-form-field>
            <kbq-select
                #select="kbqSelect"
                [formControl]="control"
                placeholder="Food"
            >
                <kbq-select__trigger>
                    {{ select.selected?.viewValue.split('').reverse().join('') }}
                </kbq-select__trigger>
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
class SelectWithCustomTrigger {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' }
    ];
    control = new UntypedFormControl();
}

@Component({
    selector: 'ng-model-compare-with',
    template: `
        <kbq-form-field>
            <kbq-select
                [ngModel]="selectedFood"
                [compareWith]="comparator"
                (ngModelChange)="setFoodByCopy($event)"
            >
                <kbq-option
                    *ngFor="let food of foods"
                    [value]="food"
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
    `
})
class NgModelCompareWithSelect {
    foods: { value: string; viewValue: string }[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' }
    ];
    selectedFood: { value: string; viewValue: string } = { value: 'pizza-1', viewValue: 'Pizza' };
    comparator: ((f1: any, f2: any) => boolean) | null = this.compareByValue;

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;

    useCompareByValue() {
        this.comparator = this.compareByValue;
    }

    useCompareByReference() {
        this.comparator = this.compareByReference;
    }

    useNullComparator() {
        this.comparator = null;
    }

    compareByValue(f1: any, f2: any) {
        return f1 && f2 && f1.value === f2.value;
    }

    compareByReference(f1: any, f2: any) {
        return f1 === f2;
    }

    setFoodByCopy(newValue: { value: string; viewValue: string }) {
        this.selectedFood = { ...{}, ...newValue };
    }
}

@Component({
    template: `
        <kbq-select
            [formControl]="control"
            [errorStateMatcher]="errorStateMatcher"
            placeholder="Food"
        >
            <kbq-option
                *ngFor="let food of foods"
                [value]="food.value"
            >
                {{ food.viewValue }}
            </kbq-option>
        </kbq-select>
    `
})
class CustomErrorBehaviorSelect {
    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    control = new UntypedFormControl();
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' }
    ];
    errorStateMatcher: ErrorStateMatcher;
}

@Component({
    template: `
        <kbq-form-field>
            <kbq-select
                [(ngModel)]="selectedFoods"
                placeholder="Food"
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
class SingleSelectWithPreselectedArrayValues {
    foods: any[] = [
        { value: ['steak-0', 'steak-1'], viewValue: 'Steak' },
        { value: ['pizza-1', 'pizza-2'], viewValue: 'Pizza' },
        { value: ['tacos-2', 'tacos-3'], viewValue: 'Tacos' }
    ];

    selectedFoods = this.foods[1].value;

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;
}

@Component({
    selector: 'select-without-option-centering',
    template: `
        <kbq-form-field>
            <kbq-select
                [formControl]="control"
                placeholder="Food"
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
class SelectWithoutOptionCentering {
    foods: any[] = [
        { value: 'steak-0', viewValue: 'Steak' },
        { value: 'pizza-1', viewValue: 'Pizza' },
        { value: 'tacos-2', viewValue: 'Tacos' },
        { value: 'sandwich-3', viewValue: 'Sandwich' },
        { value: 'chips-4', viewValue: 'Chips' },
        { value: 'eggs-5', viewValue: 'Eggs' },
        { value: 'pasta-6', viewValue: 'Pasta' },
        { value: 'sushi-7', viewValue: 'Sushi' }
    ];
    control = new UntypedFormControl('pizza-1');

    @ViewChild(KbqSelect, { static: false }) select: KbqSelect;
    @ViewChildren(KbqOption) options: QueryList<KbqOption>;
}

@Component({
    template: `
        <kbq-form-field>
            <!--<kbq-label>Select a thing</kbq-label>-->

            <kbq-select [placeholder]="placeholder">
                <kbq-option [value]="'thing'">A thing</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `
})
class SelectWithFormFieldLabel {
    placeholder: string;
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
    selector: 'multiple-select-with-customized-tag-content',
    template: `
        <kbq-form-field>
            <kbq-select
                #select
                [multiple]="true"
                [value]="selected"
                style="max-width: 300px"
            >
                <kbq-option [value]="'value1'">value</kbq-option>
                <kbq-option [value]="'value2'">value2</kbq-option>
                <kbq-option [value]="'value3'">value3</kbq-option>
                <kbq-option [value]="'value4'">Not long text</kbq-option>
                <kbq-option [value]="'value5'">Not long text</kbq-option>
                <kbq-option [value]="'value6'">Not long text</kbq-option>
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
class MultiSelectWithCustomizedTagContent {
    @ViewChild('select') kbqSelect: KbqSelect;
    @ViewChild('tagUpdated') nextTemplate: TemplateRef<any>;
    selected = ['value1', 'value2', 'value3', 'value4', 'value5'];
    customizedTextToken = 'customizedTagContent';
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

                <kbq-cleaner></kbq-cleaner>
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

@Component({
    selector: 'cdk-virtual-scroll-viewport-select-option-as-object',
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
                        {{ option.name }}
                    </kbq-option>
                </cdk-virtual-scroll-viewport>

                <ng-template
                    #kbqSelectTagContent
                    let-option
                    let-select="select"
                >
                    <kbq-tag
                        [selectable]="false"
                        [class.kbq-error]="select.errorState"
                    >
                        {{ option.value.name }}
                        <i
                            *ngIf="!option.disabled && !select.disabled"
                            (click)="select.onRemoveMatcherItem(option, $event)"
                            kbq-icon="mc-close-S_16"
                            mcTagRemove
                        ></i>
                    </kbq-tag>
                </ng-template>

                <kbq-cleaner></kbq-cleaner>
            </kbq-select>
        </kbq-form-field>
    `
})
class CdkVirtualScrollViewportSelectOptionAsObject extends CdkVirtualScrollViewportSelect<{
    id: number;
    name: string;
}> {
    values: any[] = [
        { id: 3, name: 'Anapa' },
        { id: 55, name: 'Lyubertsy' },
        { id: 114, name: 'Tomsk' }
    ];

    options: { id: number; name: string }[] = OPTIONS.sort().map((option, index) => {
        return { id: index, name: option, active: true };
    });

    constructor(public scrollDispatcher: ScrollDispatcher) {
        super(scrollDispatcher);
    }
}

describe('KbqSelect', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let dir: { value: 'ltr' | 'rtl' };
    const scrolledSubject: Subject<any> = new Subject();
    let platform: Platform;

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
            declarations,
            providers: [
                { provide: Directionality, useFactory: () => (dir = { value: 'ltr' }) },
                {
                    provide: ScrollDispatcher,
                    useFactory: () => ({
                        scrolled: () => scrolledSubject.asObservable(),
                        getAncestorScrollContainers: () => []
                    })
                }
            ]
        }).compileComponents();

        inject([OverlayContainer, Platform], (oc: OverlayContainer, p: Platform) => {
            overlayContainer = oc;
            overlayContainerElement = oc.getContainerElement();
            platform = p;
        })();
    }

    afterEach(() => {
        overlayContainer.ngOnDestroy();
    });

    describe('core', () => {
        beforeEach(waitForAsync(() => {
            configureKbqSelectTestingModule([
                BasicSelect,
                BasicEvents,
                MultiSelect,
                SelectWithGroups,
                SelectWithGroupsAndNgContainer,
                SelectWithFormFieldLabel,
                SelectWithChangeEvent
            ]);
        }));

        describe('accessibility', () => {
            describe('for select', () => {
                let fixture: ComponentFixture<BasicSelect>;
                let select: HTMLElement;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicSelect);
                    fixture.detectChanges();
                    select = fixture.debugElement.query(By.css('kbq-select')).nativeElement;
                    flush();
                }));

                afterEach(fakeAsync(() => flush()));

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

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    expect(options[0].selected).withContext('Expected first option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from first option to have been set on the model.')
                        .toBe(options[0].value);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[3].selected).withContext('Expected fourth option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from fourth option to have been set on the model.')
                        .toBe(options[3].value);

                    dispatchKeyboardEvent(select, 'keydown', UP_ARROW);
                    flush();

                    expect(options[1].selected).withContext('Expected second option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from second option to have been set on the model.')
                        .toBe(options[1].value);
                }));

                it('should resume focus from selected item after selecting via click', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    fixture.componentInstance.select.open();
                    fixture.detectChanges();
                    flush();

                    (overlayContainerElement.querySelectorAll('kbq-option')[3] as HTMLElement).click();
                    fixture.detectChanges();
                    flush();

                    expect(formControl.value).toBe(options[3].value);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    fixture.detectChanges();
                    flush();

                    expect(formControl.value).toBe(options[4].value);
                }));

                it('should select options via LEFT/RIGHT arrow keys on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    expect(options[0].selected).withContext('Expected first option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from first option to have been set on the model.')
                        .toBe(options[0].value);

                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                    dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);

                    // Note that the third option is skipped, because it is disabled.
                    expect(options[3].selected).withContext('Expected fourth option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from fourth option to have been set on the model.')
                        .toBe(options[3].value);

                    dispatchKeyboardEvent(select, 'keydown', LEFT_ARROW);
                    flush();

                    expect(options[1].selected).withContext('Expected second option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from second option to have been set on the model.')
                        .toBe(options[1].value);
                }));

                it('should open a single-selection select using ALT + DOWN_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).withContext('Expected select to be closed.').toBe(false);

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).withContext('Expected select to be open.').toBe(true);

                    expect(formControl.value).withContext('Expected value not to have changed.').toBeFalsy();
                }));

                it('should open a single-selection select using ALT + UP_ARROW', fakeAsync(() => {
                    const { control: formControl, select: selectInstance } = fixture.componentInstance;

                    expect(selectInstance.panelOpen).withContext('Expected select to be closed.').toBe(false);

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).withContext('Expected select to be open.').toBe(true);

                    expect(formControl.value).withContext('Expected value not to have changed.').toBeFalsy();
                }));

                it('should should close when pressing ALT + DOWN_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).withContext('Expected select to be open.').toBe(true);

                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).withContext('Expected select to be closed.').toBe(false);

                    expect(event.defaultPrevented).withContext('Expected default action to be prevented.').toBe(true);
                }));

                it('should should close when pressing ALT + UP_ARROW', fakeAsync(() => {
                    const { select: selectInstance } = fixture.componentInstance;

                    selectInstance.open();

                    expect(selectInstance.panelOpen).withContext('Expected select to be open.').toBe(true);

                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'altKey', { get: () => true });

                    dispatchEvent(select, event);
                    flush();

                    expect(selectInstance.panelOpen).withContext('Expected select to be closed.').toBe(false);

                    expect(event.defaultPrevented).withContext('Expected default action to be prevented.').toBe(true);
                }));

                it('should be able to select options by typing on a closed select', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;
                    const options = fixture.componentInstance.options.toArray();

                    expect(formControl.value).withContext('Expected no initial value.').toBeFalsy();

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    tick(200);

                    expect(options[1].selected).withContext('Expected second option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from second option to have been set on the model.')
                        .toBe(options[1].value);

                    dispatchEvent(select, createKeyboardEvent('keydown', 69, undefined, 'e'));
                    tick(200);

                    expect(options[5].selected).withContext('Expected sixth option to be selected.').toBe(true);

                    expect(formControl.value)
                        .withContext('Expected value from sixth option to have been set on the model.')
                        .toBe(options[5].value);
                }));

                it('should open the panel when pressing a vertical arrow key on a closed multiple select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).withContext('Expected panel to be closed.').toBe(false);

                    const event = dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    flush();

                    expect(instance.select.panelOpen).withContext('Expected panel to be open.').toBe(true);

                    expect(instance.control.value).withContext('Expected value to stay the same.').toBe(initialValue);

                    expect(event.defaultPrevented).withContext('Expected default to be prevented.').toBe(true);
                }));

                it('should open the panel when pressing a horizontal arrow key on closed multiple select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).withContext('Expected panel to be closed.').toBe(false);

                    const event = dispatchKeyboardEvent(select, 'keydown', RIGHT_ARROW);
                    flush();

                    expect(instance.select.panelOpen).withContext('Expected panel to be open.').toBe(true);

                    expect(instance.control.value).withContext('Expected value to stay the same.').toBe(initialValue);

                    expect(event.defaultPrevented).withContext('Expected default to be prevented.').toBe(true);
                }));

                it('should do nothing when typing on a closed multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-select')).nativeElement;

                    const initialValue = instance.control.value;

                    expect(instance.select.panelOpen).withContext('Expected panel to be closed.').toBe(false);

                    dispatchEvent(select, createKeyboardEvent('keydown', 80, undefined, 'p'));
                    flush();

                    expect(instance.select.panelOpen).withContext('Expected panel to stay closed.').toBe(false);

                    expect(instance.control.value).withContext('Expected value to stay the same.').toBe(initialValue);
                }));

                it('should do nothing if the key manager did not change the active item', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    expect(formControl.value).withContext('Expected form control value to be empty.').toBeNull();

                    expect(formControl.pristine).withContext('Expected form control to be clean.').toBe(true);

                    dispatchKeyboardEvent(select, 'keydown', 16); // Press a random key.

                    expect(formControl.value).withContext('Expected form control value to stay empty.').toBeNull();

                    expect(formControl.pristine).withContext('Expected form control to stay clean.').toBe(true);
                }));

                it('should continue from the selected option when the value is set programmatically', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    formControl.setValue('eggs-5');

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    flush();

                    expect(formControl.value).toBe('pasta-6');
                    expect(fixture.componentInstance.options.toArray()[6].selected).toBe(true);
                }));

                xit(
                    'should not shift focus when the selected options are updated programmatically ' +
                        'in a multi select',
                    fakeAsync(() => {
                        fixture.destroy();

                        const multiFixture = TestBed.createComponent(MultiSelect);

                        multiFixture.detectChanges();
                        select = multiFixture.debugElement.query(By.css('kbq-select')).nativeElement;
                        multiFixture.componentInstance.select.open();

                        const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

                        options[3].focus();
                        expect(document.activeElement)
                            .withContext('Expected fourth option to be focused.')
                            .toBe(options[3]);

                        multiFixture.componentInstance.control.setValue(['steak-0', 'sushi-7']);

                        expect(document.activeElement)
                            .withContext('Expected fourth option to remain focused.')
                            .toBe(options[3]);
                    })
                );

                it('should not cycle through the options if the control is disabled', fakeAsync(() => {
                    const formControl = fixture.componentInstance.control;

                    formControl.setValue('eggs-5');
                    formControl.disable();

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    flush();

                    expect(formControl.value).withContext('Expected value to remain unchanged.').toBe('eggs-5');
                }));

                it('should not wrap selection after reaching the end of the options', fakeAsync(() => {
                    const lastOption = fixture.componentInstance.options.last;

                    fixture.componentInstance.options.forEach(() => {
                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    });

                    expect(lastOption.selected).withContext('Expected last option to be selected.').toBe(true);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    flush();

                    expect(lastOption.selected).withContext('Expected last option to stay selected.').toBe(true);
                }));

                it('should not open a multiple select when tabbing through', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-select')).nativeElement;

                    expect(multiFixture.componentInstance.select.panelOpen)
                        .withContext('Expected panel to be closed initially.')
                        .toBe(false);

                    dispatchKeyboardEvent(select, 'keydown', TAB);
                    flush();

                    expect(multiFixture.componentInstance.select.panelOpen)
                        .withContext('Expected panel to stay closed.')
                        .toBe(false);
                }));

                it('should toggle the next option when pressing shift + DOWN_ARROW on a multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const event = createKeyboardEvent('keydown', DOWN_ARROW);
                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-select')).nativeElement;
                    multiFixture.autoDetectChanges();
                    multiFixture.detectChanges();

                    multiFixture.componentInstance.select.open();
                    multiFixture.detectChanges();
                    flush();

                    expect(multiFixture.componentInstance.select.value).toBeFalsy();

                    dispatchEvent(select, event);
                    expect(multiFixture.componentInstance.select.value).toEqual(['pizza-1']);

                    dispatchEvent(select, event);
                    flush();

                    expect(multiFixture.componentInstance.select.value).toEqual(['pizza-1', 'tacos-2']);
                }));

                xit('should toggle the previous option when pressing shift + UP_ARROW on a multi-select', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const event = createKeyboardEvent('keydown', UP_ARROW);
                    Object.defineProperty(event, 'shiftKey', { get: () => true });

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-select')).nativeElement;

                    multiFixture.componentInstance.select.open();
                    multiFixture.detectChanges();
                    flush();

                    // Move focus down first.
                    for (let i = 0; i < 5; i++) {
                        dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                        multiFixture.detectChanges();
                    }

                    expect(multiFixture.componentInstance.select.value).toBeFalsy();

                    dispatchEvent(select, event);
                    expect(multiFixture.componentInstance.select.value).toEqual(['chips-4']);

                    dispatchEvent(select, event);
                    expect(multiFixture.componentInstance.select.value).toEqual(['sandwich-3', 'chips-4']);
                }));

                it('should prevent the default action when pressing space', fakeAsync(() => {
                    const event = dispatchKeyboardEvent(select, 'keydown', SPACE);
                    flush();

                    expect(event.defaultPrevented).toBe(true);
                }));

                it('should consider the selection a result of a user action when closed', fakeAsync(() => {
                    const option = fixture.componentInstance.options.first;
                    const spy = jasmine.createSpy('option selection spy');
                    const subscription = option.onSelectionChange.pipe(map((e) => e.isUserInput)).subscribe(spy);

                    dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
                    expect(spy).toHaveBeenCalledWith(true);
                    flush();

                    subscription.unsubscribe();
                }));

                it('should be able to focus the select trigger', fakeAsync(() => {
                    document.body.focus(); // ensure that focus isn't on the trigger already

                    fixture.componentInstance.select.focus();

                    expect(document.activeElement).withContext('Expected select element to be focused.').toBe(select);
                }));

                xit('should restore focus to the trigger after selecting an option in multi-select mode', fakeAsync(() => {
                    fixture.destroy();

                    const multiFixture = TestBed.createComponent(MultiSelect);
                    const instance = multiFixture.componentInstance;

                    multiFixture.detectChanges();
                    select = multiFixture.debugElement.query(By.css('kbq-select')).nativeElement;
                    instance.select.open();

                    // Ensure that the select isn't focused to begin with.
                    select.blur();
                    expect(document.activeElement).withContext('Expected trigger not to be focused.').not.toBe(select);

                    const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
                    option.click();
                    expect(document.activeElement).withContext('Expected trigger to be focused.').toBe(select);
                }));
            });

            describe('for options', () => {
                let fixture: ComponentFixture<BasicSelect>;
                let trigger: HTMLElement;
                let options: NodeListOf<HTMLElement>;

                beforeEach(fakeAsync(() => {
                    fixture = TestBed.createComponent(BasicSelect);
                    fixture.detectChanges();
                    trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                    trigger.click();
                    fixture.detectChanges();
                    flush();

                    options = overlayContainerElement.querySelectorAll('kbq-option');
                }));

                afterEach(fakeAsync(() => flush()));

                it('should set the tabindex of each option according to disabled state', fakeAsync(() => {
                    expect(options[0].getAttribute('tabindex')).toEqual('0');
                    expect(options[1].getAttribute('tabindex')).toEqual('0');
                    expect(options[2].getAttribute('tabindex')).toEqual('-1');
                }));
            });
        });

        describe('overlay panel', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                flush();
            }));

            it('should not throw when attempting to open too early', () => {
                // Create component and then immediately open without running change detection
                fixture = TestBed.createComponent(BasicSelect);
                expect(() => fixture.componentInstance.select.open()).not.toThrow();
            });

            it('should open the panel when trigger is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);
                expect(overlayContainerElement.textContent).toContain('Steak');
                expect(overlayContainerElement.textContent).toContain('Pizza');
                expect(overlayContainerElement.textContent).toContain('Tacos');
            }));

            it('should close the panel when an item is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
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

            it('should set the width of the overlay based on the trigger', fakeAsync(() => {
                trigger.style.width = '200px';

                trigger.click();
                fixture.detectChanges();
                flush();

                const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
                expect(pane.style.minWidth).toBe('200px');
            }));

            it('should not attempt to open a select that does not have any options', fakeAsync(() => {
                fixture.componentInstance.foods = [];
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should close the panel when tabbing out', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should restore focus to the host before tabbing away', fakeAsync(() => {
                const select = fixture.nativeElement.querySelector('.kbq-select');

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                // Use a spy since focus can be flaky in unit tests.
                spyOn(select, 'focus').and.callThrough();

                dispatchKeyboardEvent(trigger, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(select.focus).toHaveBeenCalled();
            }));

            it('should close when tabbing out from inside the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);

                const panel = overlayContainerElement.querySelector('.kbq-select__panel')!;
                dispatchKeyboardEvent(panel, 'keydown', TAB);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(false);
            }));

            it('should focus the first option when pressing HOME', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const event = dispatchKeyboardEvent(trigger, 'keydown', HOME);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.keyManager.activeItemIndex).toBe(0);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should focus the last option when pressing END', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const event = dispatchKeyboardEvent(trigger, 'keydown', END);
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.keyManager.activeItemIndex).toBe(7);
                expect(event.defaultPrevented).toBe(true);
            }));

            it('should be able to set extra classes on the panel', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const panel = overlayContainerElement.querySelector('.kbq-select__panel') as HTMLElement;

                expect(panel.classList).toContain('custom-one');
                expect(panel.classList).toContain('custom-two');
            }));

            it('should prevent the default action when pressing SPACE on an option', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-option') as Node;
                const event = dispatchKeyboardEvent(option, 'keydown', SPACE);
                flush();

                expect(event.defaultPrevented).toBe(true);
            }));

            it('should prevent the default action when pressing ENTER on an option', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-option') as Node;
                const event = dispatchKeyboardEvent(option, 'keydown', ENTER);
                flush();

                expect(event.defaultPrevented).toBe(true);
            }));

            it('should be able to render options inside groups with an ng-container', fakeAsync(() => {
                fixture.destroy();

                const groupFixture = TestBed.createComponent(SelectWithGroupsAndNgContainer);
                groupFixture.detectChanges();
                trigger = groupFixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                trigger.click();
                groupFixture.detectChanges();
                flush();

                expect(document.querySelectorAll('.cdk-overlay-container kbq-option').length)
                    .withContext('Expected at least one option to be rendered.')
                    .toBeGreaterThan(0);
            }));

            it(
                'should not consider itself as blurred if the trigger loses focus while the ' + 'panel is still open',
                fakeAsync(() => {
                    const selectElement = fixture.nativeElement.querySelector('.kbq-select');
                    const selectInstance = fixture.componentInstance.select;

                    dispatchFakeEvent(selectElement, 'focus');
                    fixture.detectChanges();

                    /* tslint:disable-next-line:deprecation */
                    expect(selectInstance.focused).withContext('Expected select to be focused.').toBe(true);

                    selectInstance.open();
                    fixture.detectChanges();
                    flush();
                    dispatchFakeEvent(selectElement, 'blur');
                    fixture.detectChanges();

                    /* tslint:disable-next-line:deprecation */
                    expect(selectInstance.focused).withContext('Expected select element to remain focused.').toBe(true);
                })
            );
        });

        describe('selection logic', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                flush();
            }));

            it('should focus the first option if no option is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.keyManager.activeItemIndex).toEqual(0);
            }));

            it('should select an option when it is clicked', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                let option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

                expect(option.classList).toContain('kbq-selected');
                expect(fixture.componentInstance.options.first.selected).toBe(true);
                expect(fixture.componentInstance.select.selected).toBe(fixture.componentInstance.options.first);
            }));

            it('should be able to select an option using the KbqOption API', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const optionInstances = fixture.componentInstance.options.toArray();
                const optionNodes: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

                optionInstances[1].select();
                fixture.detectChanges();
                flush();

                expect(optionNodes[1].classList).toContain('kbq-selected');
                expect(optionInstances[1].selected).toBe(true);
                expect(fixture.componentInstance.select.selected).toBe(optionInstances[1]);
            }));

            it('should deselect other options when one is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

                options[0].click();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                options = overlayContainerElement.querySelectorAll('kbq-option');
                expect(options[1].classList).not.toContain('kbq-selected');
                expect(options[2].classList).not.toContain('kbq-selected');

                const optionInstances = fixture.componentInstance.options.toArray();
                expect(optionInstances[1].selected).toBe(false);
                expect(optionInstances[2].selected).toBe(false);
            }));

            it('should deselect other options when one is programmatically selected', fakeAsync(() => {
                const control = fixture.componentInstance.control;
                const foods = fixture.componentInstance.foods;

                trigger.click();
                fixture.detectChanges();
                flush();

                let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

                options[0].click();
                fixture.detectChanges();
                flush();

                control.setValue(foods[1].value);
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                options = overlayContainerElement.querySelectorAll('kbq-option');

                expect(options[0].classList)
                    .withContext('Expected first option to no longer be selected')
                    .not.toContain('kbq-selected');

                expect(options[1].classList)
                    .withContext('Expected second option to be selected')
                    .toContain('kbq-selected');

                const optionInstances = fixture.componentInstance.options.toArray();

                expect(optionInstances[0].selected)
                    .withContext('Expected first option to no longer be selected')
                    .toBe(false);

                expect(optionInstances[1].selected).withContext('Expected second option to be selected').toBe(true);
            }));

            it('should display the selected option in the trigger', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

                expect(value.textContent).toContain('Steak');
            }));

            it('should focus the selected option if an option is selected', fakeAsync(() => {
                // must wait for initial writeValue promise to finish
                flush();

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                // must wait for animation to finish
                fixture.detectChanges();
                expect(fixture.componentInstance.select.keyManager.activeItemIndex).toEqual(1);
            }));

            it('should select an option that was added after initialization', fakeAsync(() => {
                fixture.componentInstance.foods.push({ viewValue: 'Potatoes', value: 'potatoes-8' });
                trigger.click();
                fixture.detectChanges();
                flush();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
                options[8].click();
                fixture.detectChanges();
                tick();
                flush();

                expect(trigger.textContent).toContain('Potatoes');
                expect(fixture.componentInstance.select.selected).toBe(fixture.componentInstance.options.last);
            }));

            it('should update the trigger when the selected option label is changed', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                expect(trigger.querySelector('.kbq-select__matcher-text')!.textContent!.trim()).toBe('Pizza');

                fixture.componentInstance.foods[1].viewValue = 'Calzone';
                fixture.detectChanges();
                flush();

                expect(trigger.querySelector('.kbq-select__matcher-text')!.textContent!.trim()).toBe('Calzone');
            }));

            it('should not select disabled options', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();

                expect(fixture.componentInstance.select.selected).toBeUndefined();

                const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
                options[2].click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.select.panelOpen).toBe(true);
                expect(options[2].classList).not.toContain('kbq-selected');
                expect(fixture.componentInstance.select.selected).toBeUndefined();
            }));

            it('should not select options inside a disabled group', fakeAsync(() => {
                fixture.destroy();

                const groupFixture = TestBed.createComponent(SelectWithGroups);
                groupFixture.detectChanges();
                groupFixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
                groupFixture.detectChanges();

                const disabledGroup = overlayContainerElement.querySelectorAll('kbq-optgroup')[1];
                const options: NodeListOf<HTMLElement> = disabledGroup.querySelectorAll('kbq-option');

                options[0].click();
                groupFixture.detectChanges();
                flush();

                expect(groupFixture.componentInstance.select.panelOpen).toBe(true);
                expect(options[0].classList).not.toContain('kbq-selected');
                expect(groupFixture.componentInstance.select.selected).toBeUndefined();
            }));

            it('should not throw if triggerValue accessed with no selected value', fakeAsync(() => {
                expect(() => fixture.componentInstance.select.triggerValue).not.toThrow();
            }));

            it('should emit to `optionSelectionChanges` when an option is selected', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const spy = jasmine.createSpy('option selection spy');
                const subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(spy).toHaveBeenCalledWith(jasmine.any(KbqOptionSelectionChange));

                subscription.unsubscribe();
            }));

            it('should handle accessing `optionSelectionChanges` before the options are initialized', fakeAsync(() => {
                fixture.destroy();
                fixture = TestBed.createComponent(BasicSelect);

                const spy = jasmine.createSpy('option selection spy');
                let subscription: Subscription;

                expect(fixture.componentInstance.select.options).toBeFalsy();
                expect(() => {
                    subscription = fixture.componentInstance.select.optionSelectionChanges.subscribe(spy);
                }).not.toThrow();

                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                tick();
                flush();

                expect(spy).toHaveBeenCalledWith(jasmine.any(KbqOptionSelectionChange));

                /* tslint:disable-next-line:no-unnecessary-type-assertion */
                subscription!.unsubscribe();
            }));

            it('should focus itself after list closed by KeyBoard events', fakeAsync(() => {
                const closeAndFocusKeys: number[] = [TAB, ESCAPE, DOWN_ARROW, UP_ARROW];
                const selectInstance = fixture.componentInstance.select;
                spyOn(selectInstance, 'focus');

                closeAndFocusKeys.forEach((keyCode) => {
                    trigger.click();
                    fixture.detectChanges();

                    // @ts-ignore
                    const option: HTMLElement = overlayContainerElement.querySelector('.kbq-option.kbq-active');
                    const keyBoardEvent: KeyboardEvent = createKeyboardEvent('keydown', keyCode, option);
                    Object.defineProperties(keyBoardEvent, {
                        altKey: { get: () => true }
                    });

                    dispatchEvent(option, keyBoardEvent);

                    fixture.detectChanges();
                    flush();
                });

                // Double it, since open and close events are involved
                expect(selectInstance.focus).toHaveBeenCalledTimes(closeAndFocusKeys.length * 2);
            }));
        });

        describe('forms integration', () => {
            let fixture: ComponentFixture<BasicSelect>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicSelect);
                fixture.detectChanges();
                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                flush();
            }));

            it('should take an initial view value with reactive forms', fakeAsync(() => {
                fixture.componentInstance.control = new UntypedFormControl('pizza-1');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent)
                    .withContext(`Expected trigger to be populated by the control's initial value.`)
                    .toContain('Pizza');

                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-option');
                expect(options[1].classList)
                    .withContext(`Expected option with the control's initial value to be selected.`)
                    .toContain('kbq-selected');
            }));

            it('should set the view value from the form', fakeAsync(() => {
                let value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent.trim()).toBe('Food');

                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent)
                    .withContext(`Expected trigger to be populated by the control's new value.`)
                    .toContain('Pizza');

                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-option');
                expect(options[1].classList)
                    .withContext(`Expected option with the control's new value to be selected.`)
                    .toContain('kbq-selected');
            }));

            it('should update the form value when the view changes', fakeAsync(() => {
                expect(fixture.componentInstance.control.value)
                    .withContext(`Expected the control's value to be empty initially.`)
                    .toEqual(null);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.value)
                    .withContext(`Expected control's value to be set to the new option.`)
                    .toEqual('steak-0');
            }));

            it('should clear the selection when a nonexistent option value is selected', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.setValue('gibberish');
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent.trim())
                    .withContext(`Expected trigger to show the placeholder.`)
                    .toBe('Food');

                expect(trigger.textContent)
                    .withContext(`Expected trigger is cleared when option value is not found.`)
                    .not.toContain('Pizza');

                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-option');
                expect(options[1].classList)
                    .withContext(`Expected option w/ the old value not to be selected.`)
                    .not.toContain('kbq-selected');
            }));

            it('should clear the selection when the control is reset', fakeAsync(() => {
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                fixture.componentInstance.control.reset();
                fixture.detectChanges();

                const value = fixture.debugElement.query(By.css('.kbq-select__matcher'));
                expect(value.nativeElement.textContent.trim())
                    .withContext(`Expected trigger to show the placeholder.`)
                    .toBe('Food');

                expect(trigger.textContent)
                    .withContext(`Expected trigger is cleared when option value is not found.`)
                    .not.toContain('Pizza');

                trigger.click();
                fixture.detectChanges();
                flush();

                const options = overlayContainerElement.querySelectorAll('kbq-option');
                expect(options[1].classList)
                    .withContext(`Expected option w/ the old value not to be selected.`)
                    .not.toContain('kbq-selected');
            }));

            it('should set the control to touched when the select is blurred', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .withContext(`Expected the control to start off as untouched.`)
                    .toEqual(false);

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .withContext(`Expected the control to stay untouched when menu opened.`)
                    .toEqual(false);

                document.body.click();
                tick(1);
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .withContext(`Expected the control to be touched as soon as focus left the select.`)
                    .toEqual(true);
            }));

            it('should set the control to touched when the panel is closed', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to start off as untouched.')
                    .toBe(false);

                trigger.click();
                dispatchFakeEvent(trigger, 'blur');
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to stay untouched when dropdown opened.')
                    .toBe(false);

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to be touched when the panel was closed.')
                    .toBe(true);
            }));

            it('should not set touched when a disabled select is touched', fakeAsync(() => {
                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to start off as untouched.')
                    .toBe(false);

                fixture.componentInstance.control.disable();
                dispatchFakeEvent(trigger, 'blur');

                expect(fixture.componentInstance.control.touched)
                    .withContext('Expected the control to stay untouched.')
                    .toBe(false);
            }));

            it('should set the control to dirty when the select value changes in DOM', fakeAsync(() => {
                expect(fixture.componentInstance.control.dirty)
                    .withContext(`Expected control to start out pristine.`)
                    .toEqual(false);

                trigger.click();
                fixture.detectChanges();
                flush();

                const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;
                option.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.control.dirty)
                    .withContext(`Expected control to be dirty after value was changed by user.`)
                    .toEqual(true);
            }));

            it('should not set the control to dirty when the value changes programmatically', fakeAsync(() => {
                expect(fixture.componentInstance.control.dirty)
                    .withContext(`Expected control to start out pristine.`)
                    .toEqual(false);

                fixture.componentInstance.control.setValue('pizza-1');

                expect(fixture.componentInstance.control.dirty)
                    .withContext(`Expected control to stay pristine after programmatic change.`)
                    .toEqual(false);
                flush();
            }));

            xit('should set an asterisk after the label if control is required', fakeAsync(() => {
                let requiredMarker = fixture.debugElement.query(By.css('.kbq-form-field-required-marker'));
                expect(requiredMarker)
                    .withContext(`Expected label not to have an asterisk, as control was not required.`)
                    .toBeNull();

                fixture.componentInstance.isRequired = true;
                fixture.detectChanges();

                requiredMarker = fixture.debugElement.query(By.css('.kbq-form-field-required-marker'));
                expect(requiredMarker)
                    .withContext(`Expected label to have an asterisk, as control was required.`)
                    .not.toBeNull();
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

            it('should not scroll to options that are completely in the view', fakeAsync(() => {
                const initialScrollPosition = panel.scrollTop;

                [1, 2, 3].forEach(() => {
                    dispatchKeyboardEvent(host, 'keydown', DOWN_ARROW);
                });
                flush();

                expect(panel.scrollTop)
                    .withContext('Expected scroll position not to change')
                    .toBe(initialScrollPosition);
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

        describe('Events', () => {
            let fixture: ComponentFixture<BasicEvents>;
            let trigger: HTMLElement;

            beforeEach(fakeAsync(() => {
                fixture = TestBed.createComponent(BasicEvents);

                fixture.detectChanges();
                flush();

                trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            }));

            it('should fire openedChange event on open select', fakeAsync(() => {
                expect(fixture.componentInstance.openedChangeListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalled();
            }));

            it('should fire openedChange event on close select', fakeAsync(() => {
                expect(fixture.componentInstance.openedChangeListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalled();

                document.body.click();
                tick(1);

                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedChangeListener).toHaveBeenCalledTimes(2);
            }));

            it('should fire opened event on open select', fakeAsync(() => {
                expect(fixture.componentInstance.openedListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.openedListener).toHaveBeenCalled();
            }));

            it('should fire closed event on close select', fakeAsync(() => {
                expect(fixture.componentInstance.closedListener).not.toHaveBeenCalled();

                trigger.click();
                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.closedListener).not.toHaveBeenCalled();

                document.body.click();
                tick(1);

                fixture.detectChanges();
                flush();

                expect(fixture.componentInstance.closedListener).toHaveBeenCalled();
            }));
        });
    });

    describe('with a search', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([SelectWithSearch])));

        let fixture: ComponentFixture<SelectWithSearch>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithSearch);
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

            inputElementDebug.nativeElement.value = 'lu';

            inputElementDebug.triggerEventHandler('input', { target: inputElementDebug.nativeElement });
            fixture.detectChanges();
            flush();
            tick(1);

            const optionsTexts = fixture.debugElement
                .queryAll(By.css('kbq-option'))
                .map((el) => el.nativeElement.innerText);

            expect(optionsTexts).toEqual(['Kaluga', 'Luga']);
        }));

        it('should clear search by esc', () => {
            trigger.click();
            fixture.detectChanges();

            const inputElementDebug = fixture.debugElement.query(By.css('input'));

            inputElementDebug.nativeElement.value = 'lu';

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

    describe('with a selectionChange event handler', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([SelectWithChangeEvent])));

        let fixture: ComponentFixture<SelectWithChangeEvent>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithChangeEvent);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        it('should emit an event when the selected option has changed', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            (overlayContainerElement.querySelector('kbq-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalled();
        }));

        xit('should not emit multiple change events for the same option', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

            option.click();
            option.click();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
        }));

        it('should only emit one event when pressing arrow keys on closed select', fakeAsync(() => {
            const select = fixture.debugElement.query(By.css('kbq-select')).nativeElement;
            dispatchKeyboardEvent(select, 'keydown', DOWN_ARROW);
            flush();

            expect(fixture.componentInstance.changeListener).toHaveBeenCalledTimes(1);
        }));
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

    describe('with multiple kbq-select elements in one view', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([ManySelects])));

        let fixture: ComponentFixture<ManySelects>;
        let triggers: DebugElement[];
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ManySelects);
            fixture.detectChanges();
            triggers = fixture.debugElement.queryAll(By.css('.kbq-select__trigger'));

            triggers[0].nativeElement.click();
            fixture.detectChanges();
            flush();

            options = overlayContainerElement.querySelectorAll('kbq-option');
        }));

        it('should set the option id properly', fakeAsync(() => {
            const firstOptionID = options[0].id;

            expect(options[0].id).withContext(`Expected option ID to have the correct prefix.`).toContain('kbq-option');

            expect(options[0].id).withContext(`Expected option IDs to be unique.`).not.toEqual(options[1].id);

            document.body.click();
            tick(1);
            fixture.detectChanges();
            flush();

            triggers[1].nativeElement.click();
            fixture.detectChanges();
            tick();
            flush();

            options = overlayContainerElement.querySelectorAll('kbq-option');
            expect(options[0].id).withContext(`Expected option ID to have the correct prefix.`).toContain('kbq-option');

            expect(options[0].id).withContext(`Expected option IDs to be unique.`).not.toEqual(firstOptionID);

            expect(options[0].id).withContext(`Expected option IDs to be unique.`).not.toEqual(options[1].id);
        }));
    });

    describe('with a sibling component that throws an error', () => {
        beforeEach(waitForAsync(() =>
            configureKbqSelectTestingModule([
                SelectWithErrorSibling,
                ThrowsErrorOnInit
            ])));

        it('should not crash the browser when a sibling throws an error on init', fakeAsync(() => {
            // Note that this test can be considered successful if the error being thrown didn't
            // end up crashing the testing setup altogether.
            expect(() => {
                TestBed.createComponent(SelectWithErrorSibling).detectChanges();
            }).toThrowError(new RegExp('Oh no!', 'g'));
            flush();
        }));
    });

    describe('change events', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([SelectWithPlainTabindex])));

        it('should complete the stateChanges stream on destroy', () => {
            const fixture = TestBed.createComponent(SelectWithPlainTabindex);
            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(KbqSelect));
            const select = debugElement.componentInstance;

            const spy = jasmine.createSpy('stateChanges complete');
            const subscription = select.stateChanges.subscribe(undefined, undefined, spy);

            fixture.destroy();
            expect(spy).toHaveBeenCalled();
            subscription.unsubscribe();
        });
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

    describe('with theming', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([BasicSelectWithTheming])));

        let fixture: ComponentFixture<BasicSelectWithTheming>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelectWithTheming);
            fixture.detectChanges();
            flush();
        }));

        it('should transfer the theme to the select panel', fakeAsync(() => {
            fixture.componentInstance.theme = ThemePalette.Error;
            fixture.componentInstance.select.open();
            fixture.detectChanges();
            flush();

            const panel = overlayContainerElement.querySelector('.kbq-select__panel') as HTMLElement;
            expect(panel.classList).toContain('kbq-error');
        }));
    });

    describe('when invalid inside a form', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([InvalidSelectInForm])));

        it('should not throw SelectionModel errors in addition to ngModel errors', fakeAsync(() => {
            const fixture = TestBed.createComponent(InvalidSelectInForm);

            // The first change detection run will throw the "ngModel is missing a name" error.
            expect(() => fixture.detectChanges()).toThrowError(/the name attribute must be set/g);

            // The second run shouldn't throw selection-model related errors.
            expect(() => fixture.detectChanges()).not.toThrow();
            flush();
        }));
    });

    describe('with ngModel using compareWith', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([NgModelCompareWithSelect])));

        let fixture: ComponentFixture<NgModelCompareWithSelect>;
        let instance: NgModelCompareWithSelect;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(NgModelCompareWithSelect);
            instance = fixture.componentInstance;
            fixture.detectChanges();
            flush();
        }));

        describe('comparing by value', () => {
            it('should have a selection', fakeAsync(() => {
                const selectedOption = instance.select.selected as KbqOption;
                expect(selectedOption.value.value).toEqual('pizza-1');
            }));

            it('should update when making a new selection', fakeAsync(() => {
                instance.options.last.selectViaInteraction();
                fixture.detectChanges();
                flush();

                const selectedOption = instance.select.selected as KbqOption;
                expect(instance.selectedFood.value).toEqual('tacos-2');
                expect(selectedOption.value.value).toEqual('tacos-2');
            }));
        });

        describe('comparing by reference', () => {
            beforeEach(fakeAsync(() => {
                spyOn(instance, 'compareByReference').and.callThrough();
                instance.useCompareByReference();
                fixture.detectChanges();
                flush();
            }));

            it('should use the comparator', fakeAsync(() => {
                expect(instance.compareByReference).toHaveBeenCalled();
            }));

            it('should initialize with no selection despite having a value', fakeAsync(() => {
                expect(instance.selectedFood.value).toBe('pizza-1');
                expect(instance.select.selected).toBeUndefined();
            }));

            it('should not update the selection if value is copied on change', fakeAsync(() => {
                instance.options.first.selectViaInteraction();
                fixture.detectChanges();
                flush();

                expect(instance.selectedFood.value).toEqual('steak-0');
                expect(instance.select.selected).toBeUndefined();
            }));

            it('should throw an error when using a non-function comparator', fakeAsync(() => {
                instance.useNullComparator();

                expect(() => {
                    fixture.detectChanges();
                }).toThrowError(wrappedErrorMessage(getKbqSelectNonFunctionValueError()));
            }));
        });
    });

    describe(`when the select's value is accessed on initialization`, () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([SelectEarlyAccessSibling])));

        it('should not throw when trying to access the selected value on init', fakeAsync(() => {
            expect(() => {
                TestBed.createComponent(SelectEarlyAccessSibling).detectChanges();
            }).not.toThrow();
            flush();
        }));
    });

    describe('inside of a form group', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([SelectInsideFormGroup])));

        let fixture: ComponentFixture<SelectInsideFormGroup>;
        let testComponent: SelectInsideFormGroup;
        let select: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectInsideFormGroup);
            fixture.detectChanges();
            testComponent = fixture.componentInstance;
            select = fixture.debugElement.query(By.css('kbq-select')).nativeElement;
            flush();
        }));

        it('should not set the invalid class on a clean select', fakeAsync(() => {
            expect(testComponent.formGroup.untouched).withContext('Expected the form to be untouched.').toBe(true);

            expect(testComponent.formControl.invalid).withContext('Expected form control to be invalid.').toBe(false);

            expect(select.classList).withContext('Expected select not to appear invalid.').not.toContain('kbq-invalid');
        }));

        it('should not appear as invalid if it becomes touched', fakeAsync(() => {
            expect(select.classList).withContext('Expected select not to appear invalid.').not.toContain('kbq-invalid');

            testComponent.formControl.markAsTouched();
            fixture.detectChanges();
            flush();

            expect(select.classList).withContext('Expected select to appear invalid.').not.toContain('kbq-invalid');
        }));

        it('should not have the invalid class when the select becomes valid', fakeAsync(() => {
            testComponent.formControl.markAsTouched();
            fixture.detectChanges();

            expect(select.classList).withContext('Expected select to appear invalid.').not.toContain('kbq-invalid');

            testComponent.formControl.setValue('pizza-1');
            fixture.detectChanges();
            flush();

            expect(select.classList).withContext('Expected select not to appear invalid.').not.toContain('kbq-invalid');
        }));

        it('should appear as invalid when the parent form group is submitted', fakeAsync(() => {
            expect(select.classList).withContext('Expected select not to appear invalid.').not.toContain('kbq-invalid');

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();
            flush();

            expect(select.classList).withContext('Expected select to appear invalid.').toContain('kbq-invalid');
        }));

        it('should set proper form group validation state on ngSubmit handler, without setTimeout', fakeAsync(() => {
            spyOn(fixture.componentInstance, 'submitReactive').and.callThrough();

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');

            expect(fixture.componentInstance.submitReactive).toHaveBeenCalled();
            expect(fixture.componentInstance.submitResult).toEqual('invalid');
        }));

        xit('should render the error messages when the parent form is submitted', fakeAsync(() => {
            const debugEl = fixture.debugElement.nativeElement;

            expect(debugEl.querySelectorAll('kbq-error').length).withContext('Expected no error messages').toBe(0);

            dispatchFakeEvent(fixture.debugElement.query(By.css('form')).nativeElement, 'submit');
            fixture.detectChanges();

            expect(debugEl.querySelectorAll('kbq-error').length).withContext('Expected one error message').toBe(1);
        }));

        it('should override error matching behavior via injection token', fakeAsync(() => {
            const errorStateMatcher: ErrorStateMatcher = {
                isErrorState: jasmine.createSpy('error state matcher').and.returnValue(true)
            };

            fixture.destroy();

            TestBed.resetTestingModule().configureTestingModule({
                imports: [KbqSelectModule, ReactiveFormsModule, FormsModule, NoopAnimationsModule],
                declarations: [SelectInsideFormGroup],
                providers: [{ provide: ErrorStateMatcher, useValue: errorStateMatcher }]
            });

            const errorFixture = TestBed.createComponent(SelectInsideFormGroup);
            const component = errorFixture.componentInstance;

            errorFixture.detectChanges();

            expect(component.select.errorState).toBe(true);
            expect(errorStateMatcher.isErrorState).toHaveBeenCalled();
            flush();
        }));
    });

    describe('with custom error behavior', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([CustomErrorBehaviorSelect])));

        it('should be able to override the error matching behavior via an @Input', fakeAsync(() => {
            const fixture = TestBed.createComponent(CustomErrorBehaviorSelect);
            const component = fixture.componentInstance;
            const matcher = jasmine.createSpy('error state matcher').and.returnValue(true);

            fixture.detectChanges();

            expect(component.control.invalid).toBe(false);
            expect(component.select.errorState).toBe(false);

            fixture.componentInstance.errorStateMatcher = { isErrorState: matcher };
            fixture.detectChanges();

            expect(component.select.errorState).toBe(true);
            expect(matcher).toHaveBeenCalled();
            flush();
        }));
    });

    describe('with preselected array values', () => {
        beforeEach(waitForAsync(() =>
            configureKbqSelectTestingModule([
                SingleSelectWithPreselectedArrayValues
            ])));

        xit('should be able to preselect an array value in single-selection mode', fakeAsync(() => {
            const fixture = TestBed.createComponent(SingleSelectWithPreselectedArrayValues);
            fixture.detectChanges();
            flush();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            expect(trigger.textContent).toContain('Pizza');
            expect(fixture.componentInstance.options.toArray()[1].selected).toBe(true);
        }));
    });

    describe('with custom value accessor', () => {
        beforeEach(waitForAsync(() =>
            configureKbqSelectTestingModule([
                CompWithCustomSelect,
                CustomSelectAccessor
            ])));

        it('should support use inside a custom value accessor', fakeAsync(() => {
            const fixture = TestBed.createComponent(CompWithCustomSelect);
            spyOn(fixture.componentInstance.customAccessor, 'writeValue');
            fixture.detectChanges();

            expect(fixture.componentInstance.customAccessor.select.ngControl)
                .withContext('Expected kbq-select NOT to inherit control from parent value accessor.')
                .toBeFalsy();

            expect(fixture.componentInstance.customAccessor.writeValue).toHaveBeenCalled();
            flush();
        }));
    });

    describe('with a falsy value', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([FalsyValueSelect])));

        it('should be able to programmatically select a falsy option', fakeAsync(() => {
            const fixture = TestBed.createComponent(FalsyValueSelect);

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.componentInstance.control.setValue(0);
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.options.first.selected)
                .withContext('Expected first option to be selected')
                .toBe(true);

            expect(overlayContainerElement.querySelectorAll('kbq-option')[0].classList)
                .withContext('Expected first option to be selected')
                .toContain('kbq-selected');
        }));
    });

    describe('with OnPush', () => {
        beforeEach(waitForAsync(() =>
            configureKbqSelectTestingModule([
                BasicSelectOnPush,
                BasicSelectOnPushPreselected
            ])));

        xit('should set the trigger text based on the value when initialized', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectOnPushPreselected);

            fixture.detectChanges();
            flush();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            fixture.detectChanges();

            expect(trigger.textContent).toContain('Pizza');
        }));

        xit('should update the trigger based on the value', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectOnPush);
            fixture.detectChanges();
            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            fixture.componentInstance.control.setValue('pizza-1');
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Pizza');

            fixture.componentInstance.control.reset();
            fixture.detectChanges();

            expect(trigger.textContent).not.toContain('Pizza');
        }));
    });

    describe('with custom trigger', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([SelectWithCustomTrigger])));

        xit('should allow the user to customize the label', fakeAsync(() => {
            const fixture = TestBed.createComponent(SelectWithCustomTrigger);
            fixture.detectChanges();

            fixture.componentInstance.control.setValue('pizza-1');
            fixture.detectChanges();

            const label = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;

            expect(label.textContent)
                .withContext('Expected the displayed text to be "Pizza" in reverse.')
                .toContain('azziP');
        }));
    });

    describe('when reseting the value by setting null or undefined', () => {
        beforeEach(waitForAsync(() => configureKbqSelectTestingModule([ResetValuesSelect])));

        let fixture: ComponentFixture<ResetValuesSelect>;
        let trigger: HTMLElement;
        let formField: HTMLElement;
        let options: NodeListOf<HTMLElement>;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(ResetValuesSelect);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            formField = fixture.debugElement.query(By.css('.kbq-form-field')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            options = overlayContainerElement.querySelectorAll('kbq-option');
            options[0].click();
            fixture.detectChanges();
            tick();
            flush();
        }));

        it('should reset when an option with an undefined value is selected', fakeAsync(() => {
            options[4].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('kbq-form-field-should-float');
            expect(trigger.textContent).not.toContain('Undefined');
        }));

        it('should reset when an option with a null value is selected', fakeAsync(() => {
            options[5].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeNull();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('kbq-form-field-should-float');
            expect(trigger.textContent).not.toContain('Null');
        }));

        it('should reset when a blank option is selected', fakeAsync(() => {
            options[6].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBeUndefined();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(formField.classList).not.toContain('kbq-form-field-should-float');
            expect(trigger.textContent).not.toContain('None');
        }));

        it('should not mark the reset option as selected ', fakeAsync(() => {
            options[5].click();
            fixture.detectChanges();
            flush();

            fixture.componentInstance.select.open();
            fixture.detectChanges();
            flush();

            expect(options[5].classList).not.toContain('kbq-selected');
        }));

        it('should not reset when any other falsy option is selected', fakeAsync(() => {
            options[3].click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.control.value).toBe(false);
            expect(fixture.componentInstance.select.selected).toBeTruthy();
            expect(trigger.textContent).toContain('Falsy');
        }));

        xit('should not consider the reset values as selected when resetting the form control', fakeAsync(() => {
            fixture.componentInstance.control.reset();
            fixture.detectChanges();

            expect(fixture.componentInstance.control.value).toBeNull();
            expect(fixture.componentInstance.select.selected).toBeFalsy();
            expect(trigger.textContent).not.toContain('Null');
            expect(trigger.textContent).not.toContain('Undefined');
        }));
    });

    describe('without Angular forms', () => {
        beforeEach(waitForAsync(() =>
            configureKbqSelectTestingModule([
                BasicSelectWithoutForms,
                BasicSelectWithoutFormsPreselected,
                BasicSelectWithoutFormsMultiple
            ])));

        it('should set the value when options are clicked', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            expect(fixture.componentInstance.selectedFood).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('kbq-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('steak-0');
            expect(fixture.componentInstance.select.value).toBe('steak-0');
            expect(trigger.textContent).toContain('Steak');

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelectorAll('kbq-option')[2] as HTMLElement).click();
            fixture.detectChanges();
            tick();
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('sandwich-2');
            expect(fixture.componentInstance.select.value).toBe('sandwich-2');
            expect(trigger.textContent).toContain('Sandwich');
        }));

        xit('should mark options as selected when the value is set', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.componentInstance.selectedFood = 'sandwich-2';
            fixture.detectChanges();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            expect(trigger.textContent).toContain('Sandwich');

            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelectorAll('kbq-option')[2];

            expect(option.classList).toContain('kbq-selected');
            expect(fixture.componentInstance.select.value).toBe('sandwich-2');
        }));

        xit('should reset the label when a null value is set', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            expect(fixture.componentInstance.selectedFood).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('kbq-option') as HTMLElement).click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.selectedFood).toBe('steak-0');
            expect(fixture.componentInstance.select.value).toBe('steak-0');
            expect(trigger.textContent).toContain('Steak');

            fixture.componentInstance.selectedFood = null;
            fixture.detectChanges();

            expect(fixture.componentInstance.select.value).toBeNull();
            expect(trigger.textContent).not.toContain('Steak');
        }));

        xit('should reflect the preselected value', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutFormsPreselected);

            fixture.detectChanges();
            flush();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            fixture.detectChanges();
            expect(trigger.textContent).toContain('Pizza');

            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelectorAll('kbq-option')[1];

            expect(option.classList).toContain('kbq-selected');
            expect(fixture.componentInstance.select.value).toBe('pizza-1');
        }));

        xit('should be able to select multiple values', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutFormsMultiple);

            fixture.detectChanges();
            expect(fixture.componentInstance.selectedFoods).toBeFalsy();

            const trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0']);
            expect(fixture.componentInstance.select.value).toEqual(['steak-0']);
            expect(trigger.textContent).toContain('Steak');

            options[2].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0', 'sandwich-2']);
            expect(fixture.componentInstance.select.value).toEqual(['steak-0', 'sandwich-2']);
            expect(trigger.textContent).toContain('Steak, Sandwich');

            options[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.selectedFoods).toEqual(['steak-0', 'pizza-1', 'sandwich-2']);
            expect(fixture.componentInstance.select.value).toEqual(['steak-0', 'pizza-1', 'sandwich-2']);
            expect(trigger.textContent).toContain('Steak, Pizza, Sandwich');
        }));

        it('should restore focus to the host element', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('kbq-option') as HTMLElement).click();
            fixture.detectChanges();
            tick();
            flush();

            const select = fixture.debugElement.nativeElement.querySelector('kbq-select');

            expect(document.activeElement).withContext('Expected trigger to be focused.').toBe(select);
        }));

        xit('should not restore focus to the host element when clicking outside', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);
            const select = fixture.debugElement.nativeElement.querySelector('kbq-select');

            fixture.detectChanges();
            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            expect(document.activeElement?.classList)
                .withContext('Expected option to be focused.')
                .toContain('kbq-option');

            select.blur(); // Blur manually since the programmatic click might not do it.
            document.body.click();
            fixture.detectChanges();
            tick();
            flush();

            expect(document.activeElement).withContext('Expected trigger not to be focused.').not.toBe(select);
        }));

        it('should update the data binding before emitting the change event', fakeAsync(() => {
            const fixture = TestBed.createComponent(BasicSelectWithoutForms);
            const instance = fixture.componentInstance;
            const spy = jasmine.createSpy('change spy');

            fixture.detectChanges();
            instance.select.selectionChange.subscribe(() => spy(instance.selectedFood));

            expect(instance.selectedFood).toBeFalsy();

            fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement.click();
            fixture.detectChanges();
            flush();

            (overlayContainerElement.querySelector('kbq-option') as HTMLElement).click();
            fixture.detectChanges();
            tick();
            flush();

            expect(instance.selectedFood).toBe('steak-0');
            expect(spy).toHaveBeenCalledWith('steak-0');
        }));
    });

    describe('with option centering disabled', () => {
        beforeEach(waitForAsync(() =>
            configureKbqSelectTestingModule([
                SelectWithoutOptionCentering
            ])));

        let fixture: ComponentFixture<SelectWithoutOptionCentering>;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(SelectWithoutOptionCentering);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        it('should not align the active option with the trigger if centering is disabled', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-select__panel')!;

            // The panel should be scrolled to 0 because centering the option disabled.
            expect(scrollContainer.scrollTop).withContext(`Expected panel not to be scrolled.`).toEqual(0);
            // The trigger should contain 'Pizza' because it was preselected
            expect(trigger.textContent).toContain('Pizza');
            // The selected index should be 1 because it was preselected
            expect(fixture.componentInstance.options.toArray()[1].selected).toBe(true);
            flush();
        }));
    });

    describe('positioning', () => {
        beforeEach(waitForAsync(() =>
            configureKbqSelectTestingModule([
                BasicSelect,
                MultiSelect,
                SelectWithGroups
            ])));

        let fixture: ComponentFixture<BasicSelect>;
        let trigger: HTMLElement;
        let formField: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(BasicSelect);
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            formField = fixture.debugElement.query(By.css('kbq-form-field')).nativeElement;
        }));

        /**
         * Asserts that the given option is aligned with the trigger.
         * @param index The index of the option.
         * @param selectInstance Instance of the `kbq-select` component to check against.
         */
        function checkTriggerAlignedWithOption(index: number, selectInstance = fixture.componentInstance.select): void {
            const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
            const triggerTop: number = trigger.getBoundingClientRect().top;
            const overlayTop: number = overlayPane.getBoundingClientRect().top;
            const options: NodeListOf<HTMLElement> = overlayPane.querySelectorAll('kbq-option');
            const optionTop = options[index].getBoundingClientRect().top;
            const triggerFontSize = parseInt(window.getComputedStyle(trigger)['font-size']);
            const triggerLineHeightEm = 1.125;

            // Extra trigger height beyond the font size caused by the fact that the line-height is
            // greater than 1em.
            const triggerExtraLineSpaceAbove = ((1 - triggerLineHeightEm) * triggerFontSize) / 2;
            const topDifference =
                Math.floor(optionTop) - Math.floor(triggerTop - triggerFontSize - triggerExtraLineSpaceAbove);

            // Expect the coordinates to be within a pixel of each other. We can't rely on comparing
            // the exact value, because different browsers report the various sizes with slight (< 1px)
            // deviations.
            expect(Math.abs(topDifference) < 2)
                .withContext(`Expected trigger to align with option ${index}.`)
                .toBe(true);

            // For the animation to start at the option's center, its origin must be the distance
            // from the top of the overlay to the option top + half the option height (48/2 = 24).
            const expectedOrigin = Math.floor(optionTop - overlayTop + 24);
            const rawYOrigin = selectInstance.transformOrigin.split(' ')[1].trim();
            const origin = Math.floor(parseInt(rawYOrigin));

            // Because the origin depends on the Y axis offset, we also have to
            // round down and check that the difference is within a pixel.
            expect(Math.abs(expectedOrigin - origin) < 2)
                .withContext(`Expected panel animation to originate in the center of option ${index}.`)
                .toBe(true);
        }

        describe('ample space to open', () => {
            beforeEach(fakeAsync(() => {
                // these styles are necessary because we are first testing the overlay's position
                // if there is room for it to open to its full extent in either direction.
                formField.style.position = 'fixed';
                formField.style.top = '285px';
                formField.style.left = '20px';
            }));

            xit('should align the first option with trigger text if no option is selected', fakeAsync(() => {
                // We shouldn't push it too far down for this one, because the default may
                // end up being too much when running the tests on mobile browsers.
                formField.style.top = '100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-select__panel')!;

                // The panel should be scrolled to 0 because centering the option is not possible.
                expect(scrollContainer.scrollTop).withContext(`Expected panel not to be scrolled.`).toEqual(0);

                checkTriggerAlignedWithOption(0);
            }));

            xit('should align a selected option too high to be centered with the trigger text', fakeAsync(() => {
                // Select the second option, because it can't be scrolled any further downward
                fixture.componentInstance.control.setValue('pizza-1');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-select__panel')!;

                // The panel should be scrolled to 0 because centering the option is not possible.
                expect(scrollContainer.scrollTop).withContext(`Expected panel not to be scrolled.`).toEqual(0);

                checkTriggerAlignedWithOption(1);
            }));

            xit('should align a selected option in the middle with the trigger text', fakeAsync(() => {
                // Select the fifth option, which has enough space to scroll to the center
                fixture.componentInstance.control.setValue('chips-4');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-select__panel')!;

                // The selected option should be scrolled to the center of the panel.
                // This will be its original offset from the scrollTop - half the panel height + half
                // the option height. 4 (index) * 48 (option height) = 192px offset from scrollTop
                // 192 - 256/2 + 48/2 = 88px
                expect(scrollContainer.scrollTop)
                    .withContext(`Expected overlay panel to be scrolled to center the selected option.`)
                    .toEqual(88);

                checkTriggerAlignedWithOption(4);
            }));

            xit('should align a selected option at the scroll max with the trigger text', fakeAsync(() => {
                // Select the last option in the list
                fixture.componentInstance.control.setValue('sushi-7');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-select__panel')!;

                // The selected option should be scrolled to the max scroll position.
                // This will be the height of the scrollContainer - the panel height.
                // 8 options * 48px = 384 scrollContainer height, 384 - 256 = 128px max scroll
                expect(scrollContainer.scrollTop)
                    .withContext(`Expected overlay panel to be scrolled to its maximum position.`)
                    .toEqual(128);

                checkTriggerAlignedWithOption(7);
            }));

            xit('should account for preceding label groups when aligning the option', fakeAsync(() => {
                // Test is off-by-one on edge for some reason, but verified that it looks correct through
                // manual testing.
                if (platform.EDGE) {
                    return;
                }

                fixture.destroy();

                const groupFixture = TestBed.createComponent(SelectWithGroups);
                groupFixture.detectChanges();
                trigger = groupFixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
                formField = groupFixture.debugElement.query(By.css('kbq-form-field')).nativeElement;

                formField.style.position = 'fixed';
                formField.style.top = '200px';
                formField.style.left = '100px';

                // Select an option in the third group, which has a couple of group labels before it.
                groupFixture.componentInstance.control.setValue('vulpix-7');
                groupFixture.detectChanges();

                trigger.click();
                groupFixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-select__content')!;

                // The selected option should be scrolled to the center of the panel.
                // This will be its original offset from the scrollTop - half the panel height + half the
                // option height. 10 (option index + 3 group labels before it) * 48 (option height) = 480
                // 480 (offset from scrollTop) - 256/2 + 48/2 = 376px
                expect(Math.floor(scrollContainer.scrollTop))
                    .withContext(`Expected overlay panel to be scrolled to center the selected option.`)
                    .toBe(376);

                checkTriggerAlignedWithOption(7, groupFixture.componentInstance.select);
            }));
        });

        describe('limited space to open vertically', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'fixed';
                formField.style.left = '20px';
            }));

            xit('should adjust position of centered option if there is little space above', fakeAsync(() => {
                const selectMenuHeight = 256;
                const selectMenuViewportPadding = 8;
                const selectItemHeight = 48;
                const selectedIndex = 4;
                const fontSize = 16;
                const lineHeightEm = 1.125;
                const expectedExtraScroll = 5;

                // Trigger element height.
                const triggerHeight = fontSize * lineHeightEm;

                // Ideal space above selected item in order to center it.
                const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

                // Actual space above selected item.
                const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

                // Ideal scroll position to center.
                const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

                // Top-most select-position that allows for perfect centering.
                const topMostPositionForPerfectCentering =
                    idealSpaceAboveSelectedItem + selectMenuViewportPadding + (selectItemHeight - triggerHeight) / 2;

                // Position of select relative to top edge of kbq-form-field.
                const formFieldTopSpace = trigger.getBoundingClientRect().top - formField.getBoundingClientRect().top;

                const formFieldTop = topMostPositionForPerfectCentering - formFieldTopSpace - expectedExtraScroll;

                formField.style.top = `${formFieldTop}px`;

                // Select an option in the middle of the list
                fixture.componentInstance.control.setValue('chips-4');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-select__panel')!;

                expect(Math.ceil(scrollContainer.scrollTop))
                    .withContext(`Expected panel to adjust scroll position to fit in viewport.`)
                    .toEqual(Math.ceil(idealScrollTop + 5));

                checkTriggerAlignedWithOption(4);
            }));

            xit('should adjust position of centered option if there is little space below', fakeAsync(() => {
                const selectMenuHeight = 256;
                const selectMenuViewportPadding = 8;
                const selectItemHeight = 48;
                const selectedIndex = 4;
                const fontSize = 16;
                const lineHeightEm = 1.125;
                const expectedExtraScroll = 5;

                // Trigger element height.
                const triggerHeight = fontSize * lineHeightEm;

                // Ideal space above selected item in order to center it.
                const idealSpaceAboveSelectedItem = (selectMenuHeight - selectItemHeight) / 2;

                // Actual space above selected item.
                const actualSpaceAboveSelectedItem = selectItemHeight * selectedIndex;

                // Ideal scroll position to center.
                const idealScrollTop = actualSpaceAboveSelectedItem - idealSpaceAboveSelectedItem;

                // Bottom-most select-position that allows for perfect centering.
                const bottomMostPositionForPerfectCentering =
                    idealSpaceAboveSelectedItem + selectMenuViewportPadding + (selectItemHeight - triggerHeight) / 2;

                // Position of select relative to bottom edge of kbq-form-field:
                const formFieldBottomSpace =
                    formField.getBoundingClientRect().bottom - trigger.getBoundingClientRect().bottom;

                const formFieldBottom =
                    bottomMostPositionForPerfectCentering - formFieldBottomSpace - expectedExtraScroll;

                // Push the select to a position with not quite enough space on the bottom to open
                // with the option completely centered (needs 113px at least: 256/2 - 48/2 + 9)
                formField.style.bottom = `${formFieldBottom}px`;

                // Select an option in the middle of the list
                fixture.componentInstance.control.setValue('chips-4');
                fixture.detectChanges();
                flush();

                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const scrollContainer = document.querySelector('.cdk-overlay-pane .kbq-select__panel')!;

                // Scroll should adjust by the difference between the bottom space available
                // (56px from the bottom of the screen - 8px padding = 48px)
                // and the height of the panel below the option (113px).
                // 113px - 48px = 75px difference. Original scrollTop 88px - 75px = 23px
                const difference =
                    Math.ceil(scrollContainer.scrollTop) - Math.ceil(idealScrollTop - expectedExtraScroll);

                // Note that different browser/OS combinations report the different dimensions with
                // slight deviations (< 1px). We round the expectation and check that the values
                // are within a pixel of each other to avoid flakes.
                expect(Math.abs(difference) < 2)
                    .withContext(`Expected panel to adjust scroll position to fit in viewport.`)
                    .toBe(true);

                checkTriggerAlignedWithOption(4);
            }));

            xit('should fall back to "above" positioning if scroll adjustment will not help', fakeAsync(() => {
                // Push the select to a position with not enough space on the bottom to open
                formField.style.bottom = '56px';
                fixture.detectChanges();

                // Select an option that cannot be scrolled any farther upward
                fixture.componentInstance.control.setValue('coke-0');
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const overlayPane = document.querySelector('.cdk-overlay-pane')!;
                const triggerBottom: number = trigger.getBoundingClientRect().bottom;
                const overlayBottom: number = overlayPane.getBoundingClientRect().bottom;
                const scrollContainer = overlayPane.querySelector('.kbq-select__panel')!;

                // Expect no scroll to be attempted
                expect(scrollContainer.scrollTop).withContext(`Expected panel not to be scrolled.`).toEqual(0);

                const difference = Math.floor(overlayBottom) - Math.floor(triggerBottom);

                // Check that the values are within a pixel of each other. This avoids sub-pixel
                // deviations between OS and browser versions.
                expect(Math.abs(difference) < 2)
                    .withContext(`Expected trigger bottom to align with overlay bottom.`)
                    .toEqual(true);

                expect(fixture.componentInstance.select.transformOrigin)
                    .withContext(`Expected panel animation to originate at the bottom.`)
                    .toContain(`bottom`);
            }));

            xit('should fall back to "below" positioning if scroll adjustment won\'t help', fakeAsync(() => {
                // Push the select to a position with not enough space on the top to open
                formField.style.top = '85px';

                // Select an option that cannot be scrolled any farther downward
                fixture.componentInstance.control.setValue('sushi-7');
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                const overlayPane = document.querySelector('.cdk-overlay-pane')!;
                const triggerTop: number = trigger.getBoundingClientRect().top;
                const overlayTop: number = overlayPane.getBoundingClientRect().top;
                const scrollContainer = overlayPane.querySelector('.kbq-select__panel')!;

                // Expect scroll to remain at the max scroll position
                expect(scrollContainer.scrollTop).withContext(`Expected panel to be at max scroll.`).toEqual(128);

                expect(Math.floor(overlayTop))
                    .withContext(`Expected trigger top to align with overlay top.`)
                    .toEqual(Math.floor(triggerTop));

                expect(fixture.componentInstance.select.transformOrigin)
                    .withContext(`Expected panel animation to originate at the top.`)
                    .toContain(`top`);
            }));
        });

        /*describe('limited space to open horizontally', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'absolute';
                formField.style.top = '200px';
            }));

            // TODO Expected pixels
            xit('should stay within the viewport when overflowing on the left in ltr', fakeAsync(() => {
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const panelLeft = document.querySelector('.kbq-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft).toBeGreaterThan(0,
                    `Expected select panel to be inside the viewport in ltr.`);
            }));

            it('should stay within the viewport when overflowing on the left in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const panelLeft = document.querySelector('.kbq-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft).toBeGreaterThan(0,
                    `Expected select panel to be inside the viewport in rtl.`);
            }));

            it('should stay within the viewport when overflowing on the right in ltr', fakeAsync(() => {
                formField.style.right = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.kbq-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight).toBeGreaterThan(0,
                    `Expected select panel to be inside the viewport in ltr.`);
            }));

            xit('should stay within the viewport when overflowing on the right in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                formField.style.right = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                const viewportRect = viewportRuler.getViewportRect().right;
                const panelRight = document.querySelector('.kbq-select__panel')!.getBoundingClientRect().right;

                expect(viewportRect - panelRight).toBeGreaterThan(0,
                    `Expected select panel to be inside the viewport in rtl.`);
            }));

            // TODO Expected pixels
            xit('should keep the position within the viewport on repeat openings', fakeAsync(() => {
                formField.style.left = '-100px';
                trigger.click();
                fixture.detectChanges();
                flush();

                let panelLeft = document.querySelector('.kbq-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft)
                    .toBeGreaterThanOrEqual(0, `Expected select panel to be inside the viewport.`);

                fixture.componentInstance.select.close();
                fixture.detectChanges();
                flush();

                trigger.click();
                fixture.detectChanges();
                flush();

                panelLeft = document.querySelector('.kbq-select__panel')!.getBoundingClientRect().left;

                expect(panelLeft).toBeGreaterThanOrEqual(0,
                    `Expected select panel continue being inside the viewport.`);
            }));
        });*/

        describe('when scrolled', () => {
            const startingWindowHeight = window.innerHeight;

            // Need to set the scrollTop two different ways to support
            // both Chrome and Firefox.
            function setScrollTop(num: number) {
                document.body.scrollTop = num;
                document.documentElement.scrollTop = num;
            }

            beforeEach(fakeAsync(() => {
                // Make the div above the select very tall, so the page will scroll
                fixture.componentInstance.heightAbove = 2000;
                fixture.detectChanges();
                setScrollTop(0);

                // Give the select enough horizontal space to open
                formField.style.marginLeft = '20px';
                formField.style.marginRight = '20px';
            }));

            xit('should fall back to "above" positioning properly when scrolled', fakeAsync(() => {
                // Give the select insufficient space to open below the trigger
                fixture.componentInstance.heightAbove = 0;
                fixture.componentInstance.heightBelow = 100;
                trigger.style.marginTop = '2000px';
                fixture.detectChanges();

                // Scroll the select into view
                setScrollTop(1400);

                // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
                // body causes karma's iframe for the test to stretch to fit that content once we attempt to
                // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
                // successfully constrain its size. As such, skip assertions in environments where the
                // window size has changed since the start of the test.
                if (window.innerHeight > startingWindowHeight) {
                    return;
                }

                trigger.click();
                fixture.detectChanges();
                flush();

                const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
                const triggerBottom: number = trigger.getBoundingClientRect().bottom;
                const overlayBottom: number = overlayPane.getBoundingClientRect().bottom;
                const difference = Math.floor(overlayBottom) - Math.floor(triggerBottom);

                // Check that the values are within a pixel of each other. This avoids sub-pixel
                // deviations between OS and browser versions.
                expect(Math.abs(difference) < 2)
                    .withContext(`Expected trigger bottom to align with overlay bottom.`)
                    .toEqual(true);
            }));

            xit('should fall back to "below" positioning properly when scrolled', fakeAsync(() => {
                // Give plenty of space for the select to open below the trigger
                fixture.componentInstance.heightBelow = 650;
                fixture.detectChanges();

                // Select an option too low in the list to fit in limited space above
                fixture.componentInstance.control.setValue('sushi-7');
                fixture.detectChanges();

                // Scroll the select so that it has insufficient space to open above the trigger
                setScrollTop(1950);

                // In the iOS simulator (BrowserStack & SauceLabs), adding the content to the
                // body causes karma's iframe for the test to stretch to fit that content once we attempt to
                // scroll the page. Setting width / height / maxWidth / maxHeight on the iframe does not
                // successfully constrain its size. As such, skip assertions in environments where the
                // window size has changed since the start of the test.
                if (window.innerHeight > startingWindowHeight) {
                    return;
                }

                trigger.click();
                fixture.detectChanges();
                flush();

                const overlayPane = overlayContainerElement.querySelector('.cdk-overlay-pane')!;
                const triggerTop: number = trigger.getBoundingClientRect().top;
                const overlayTop: number = overlayPane.getBoundingClientRect().top;

                expect(Math.floor(overlayTop))
                    .withContext(`Expected trigger top to align with overlay top.`)
                    .toEqual(Math.floor(triggerTop));
            }));
        });

        describe('x-axis positioning', () => {
            beforeEach(fakeAsync(() => {
                formField.style.position = 'fixed';
                formField.style.left = '30px';
            }));

            xit('should align the trigger and the selected option on the x-axis in ltr', fakeAsync(() => {
                trigger.click();
                fixture.detectChanges();
                flush();

                const triggerLeft: number = trigger.getBoundingClientRect().left;
                const firstOptionLeft = document
                    .querySelector('.cdk-overlay-pane kbq-option')!
                    .getBoundingClientRect().left;

                // Each option is 32px wider than the trigger, so it must be adjusted 16px
                // to ensure the text overlaps correctly.
                expect(Math.floor(firstOptionLeft))
                    .withContext(`Expected trigger to align with the selected option on the x-axis in LTR.`)
                    .toEqual(Math.floor(triggerLeft - 16));
            }));

            xit('should align the trigger and the selected option on the x-axis in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                fixture.detectChanges();

                trigger.click();
                fixture.detectChanges();
                flush();

                const triggerRight: number = trigger.getBoundingClientRect().right;
                const firstOptionRight = document
                    .querySelector('.cdk-overlay-pane kbq-option')!
                    .getBoundingClientRect().right;

                // Each option is 32px wider than the trigger, so it must be adjusted 16px
                // to ensure the text overlaps correctly.
                expect(Math.floor(firstOptionRight))
                    .withContext(`Expected trigger to align with the selected option on the x-axis in RTL.`)
                    .toEqual(Math.floor(triggerRight + 16));
            }));
        });

        describe('x-axis positioning in multi select mode', () => {
            let multiFixture: ComponentFixture<MultiSelect>;

            beforeEach(fakeAsync(() => {
                multiFixture = TestBed.createComponent(MultiSelect);
                multiFixture.detectChanges();
                formField = multiFixture.debugElement.query(By.css('.kbq-form-field')).nativeElement;
                trigger = multiFixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                formField.style.position = 'fixed';
                formField.style.left = '60px';
            }));

            xit('should adjust for the checkbox in ltr', fakeAsync(() => {
                trigger.click();
                multiFixture.detectChanges();
                flush();

                const triggerLeft: number = trigger.getBoundingClientRect().left;
                const firstOptionLeft = document
                    .querySelector('.cdk-overlay-pane kbq-option')!
                    .getBoundingClientRect().left;

                // 44px accounts for the checkbox size, margin and the panel's padding.
                expect(Math.floor(firstOptionLeft))
                    .withContext(`Expected trigger label to align along x-axis, accounting for the checkbox.`)
                    .toEqual(Math.floor(triggerLeft - 44));
            }));

            xit('should adjust for the checkbox in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                trigger.click();
                multiFixture.detectChanges();
                flush();

                const triggerRight: number = trigger.getBoundingClientRect().right;
                const firstOptionRight = document
                    .querySelector('.cdk-overlay-pane kbq-option')!
                    .getBoundingClientRect().right;

                // 44px accounts for the checkbox size, margin and the panel's padding.
                expect(Math.floor(firstOptionRight))
                    .withContext(`Expected trigger label to align along x-axis, accounting for the checkbox.`)
                    .toEqual(Math.floor(triggerRight + 44));
            }));
        });

        describe('x-axis positioning with groups', () => {
            let groupFixture: ComponentFixture<SelectWithGroups>;

            beforeEach(fakeAsync(() => {
                groupFixture = TestBed.createComponent(SelectWithGroups);
                groupFixture.detectChanges();
                formField = groupFixture.debugElement.query(By.css('.kbq-form-field')).nativeElement;
                trigger = groupFixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

                formField.style.position = 'fixed';
                formField.style.left = '60px';
            }));

            xit('should adjust for the group padding in ltr', fakeAsync(() => {
                groupFixture.componentInstance.control.setValue('oddish-1');
                groupFixture.detectChanges();

                trigger.click();
                groupFixture.detectChanges();

                groupFixture.whenStable().then(() => {
                    const group = document.querySelector('.cdk-overlay-pane kbq-optgroup')!;
                    const triggerLeft: number = trigger.getBoundingClientRect().left;
                    const selectedOptionLeft = group
                        .querySelector('kbq-option.kbq-selected')!
                        .getBoundingClientRect().left;

                    // 32px is the 16px default padding plus 16px of padding when an option is in a group.
                    expect(Math.floor(selectedOptionLeft))
                        .withContext(`Expected trigger label to align along x-axis, accounting for the padding in ltr.`)
                        .toEqual(Math.floor(triggerLeft - 32));
                });
            }));

            xit('should adjust for the group padding in rtl', fakeAsync(() => {
                dir.value = 'rtl';
                groupFixture.componentInstance.control.setValue('oddish-1');
                groupFixture.detectChanges();

                trigger.click();
                groupFixture.detectChanges();
                flush();

                const group = document.querySelector('.cdk-overlay-pane kbq-optgroup')!;
                const triggerRight = trigger.getBoundingClientRect().right;
                const selectedOptionRight = group
                    .querySelector('kbq-option.kbq-selected')!
                    .getBoundingClientRect().right;

                // 32px is the 16px default padding plus 16px of padding when an option is in a group.
                expect(Math.floor(selectedOptionRight))
                    .withContext(`Expected trigger label to align along x-axis, accounting for the padding in rtl.`)
                    .toEqual(Math.floor(triggerRight + 32));
            }));

            xit('should not adjust if all options are within a group, except the selected one', fakeAsync(() => {
                groupFixture.componentInstance.control.setValue('mime-11');
                groupFixture.detectChanges();

                trigger.click();
                groupFixture.detectChanges();
                flush();

                const selected = document.querySelector('.cdk-overlay-pane kbq-option.kbq-selected')!;
                const selectedOptionLeft = selected.getBoundingClientRect().left;
                const triggerLeft = trigger.getBoundingClientRect().left;

                // 16px is the default option padding
                expect(Math.floor(selectedOptionLeft)).toEqual(Math.floor(triggerLeft - 16));
            }));

            xit('should align the first option to the trigger, if nothing is selected', fakeAsync(() => {
                // Push down the form field so there is space for the item to completely align.
                formField.style.top = '100px';

                const menuItemHeight = 48;
                const triggerFontSize = 16;
                const triggerLineHeightEm = 1.125;
                const triggerHeight = triggerFontSize * triggerLineHeightEm;

                trigger.click();
                groupFixture.detectChanges();
                flush();

                const triggerTop = trigger.getBoundingClientRect().top;

                const option = overlayContainerElement.querySelector('.cdk-overlay-pane kbq-option');
                const optionTop: number = option ? option.getBoundingClientRect().top : 0;

                // There appears to be a small rounding error on IE, so we verify that the value is close,
                // not exact.
                if (platform.TRIDENT) {
                    const difference = Math.abs(optionTop + (menuItemHeight - triggerHeight) / 2 - triggerTop);
                    expect(difference)
                        .withContext('Expected trigger to align with the first option.')
                        .toBeLessThan(0.1);
                } else {
                    expect(Math.floor(optionTop + (menuItemHeight - triggerHeight) / 2))
                        .withContext('Expected trigger to align with the first option.')
                        .toBe(Math.floor(triggerTop));
                }
            }));
        });
    });

    describe('with multiple selection', () => {
        beforeEach(waitForAsync(() =>
            configureKbqSelectTestingModule([MultiSelect, MultiSelectWithCustomizedTagContent, MultiSelectNarrow])));

        let fixture: ComponentFixture<MultiSelect>;
        let testInstance: MultiSelect;
        let trigger: HTMLElement;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(MultiSelect);
            testInstance = fixture.componentInstance;
            fixture.detectChanges();
            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        it('should be able to select multiple values', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].click();
            options[2].click();
            options[5].click();
            fixture.detectChanges();
            tick();
            flush();

            expect(testInstance.control.value).toEqual(['steak-0', 'tacos-2', 'eggs-5']);
        }));

        it('should be able to toggle an option on and off', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const option = overlayContainerElement.querySelector('kbq-option') as HTMLElement;

            option.click();
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual(['steak-0']);

            option.click();
            fixture.detectChanges();
            flush();

            expect(testInstance.control.value).toEqual([]);
        }));

        it('should update the label', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].click();
            options[2].click();
            options[5].click();
            fixture.detectChanges();

            expect(Array.from(trigger.querySelectorAll('kbq-tag'), (item) => item.textContent!.trim())).toEqual([
                'Steak',
                'Tacos',
                'Eggs'
            ]);

            options[2].click();
            tick(100);
            fixture.detectChanges();
            flush();

            expect(Array.from(trigger.querySelectorAll('kbq-tag'), (item) => item.textContent!.trim())).toEqual([
                'Steak',
                'Eggs'
            ]);
        }));

        it('should be able to set the selected value by taking an array', fakeAsync(() => {
            trigger.click();
            testInstance.control.setValue(['steak-0', 'eggs-5']);
            fixture.detectChanges();
            flush();

            const optionNodes = overlayContainerElement.querySelectorAll('kbq-option');

            const optionInstances = testInstance.options.toArray();

            expect(optionNodes[0].classList).toContain('kbq-selected');
            expect(optionNodes[5].classList).toContain('kbq-selected');

            expect(optionInstances[0].selected).toBe(true);
            expect(optionInstances[5].selected).toBe(true);
        }));

        it('should override the previously-selected value when setting an array', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].click();
            fixture.detectChanges();

            expect(options[0].classList).toContain('kbq-selected');

            testInstance.control.setValue(['eggs-5']);
            fixture.detectChanges();
            flush();

            expect(options[0].classList).not.toContain('kbq-selected');
            expect(options[5].classList).toContain('kbq-selected');
        }));

        it('should not close the panel when clicking on options', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            expect(testInstance.select.panelOpen).toBe(true);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].click();
            options[1].click();
            fixture.detectChanges();
            tick();
            flush();

            expect(testInstance.select.panelOpen).toBe(true);
        }));

        xit('should sort the selected options based on their order in the panel', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[2].click();
            options[0].click();
            options[1].click();
            fixture.detectChanges();

            expect(trigger.querySelector('.kbq-select__match-list')!.textContent).toContain('Steak, Pizza, Tacos');
            expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
        }));

        xit('should sort the selected options in reverse in rtl', fakeAsync(() => {
            dir.value = 'rtl';
            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[2].click();
            options[0].click();
            options[1].click();
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
            expect(fixture.componentInstance.control.value).toEqual(['steak-0', 'pizza-1', 'tacos-2']);
        }));

        xit('should be able to customize the value sorting logic', fakeAsync(() => {
            fixture.componentInstance.sortComparator = (a, b, optionsArray) => {
                return optionsArray.indexOf(b) - optionsArray.indexOf(a);
            };
            fixture.detectChanges();

            trigger.click();
            fixture.detectChanges();
            flush();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            for (let i = 0; i < 3; i++) {
                options[i].click();
            }
            fixture.detectChanges();

            // Expect the items to be in reverse order.
            expect(trigger.querySelector('.kbq-select__match-list')!.textContent).toContain('Tacos, Pizza, Steak');
            expect(fixture.componentInstance.control.value).toEqual(['tacos-2', 'pizza-1', 'steak-0']);
        }));

        xit('should sort the values that get set via the model based on the panel order', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();

            testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
            fixture.detectChanges();
            flush();

            // expect(trigger.querySelector('.kbq-select__match-list')!.textContent.trim())
            //     .toContain('Steak, Pizza, Tacos');
            expect(trigger.textContent).toContain('Steak, Pizza, Tacos');
        }));

        xit('should reverse sort the values, that get set via the model in rtl', fakeAsync(() => {
            dir.value = 'rtl';
            trigger.click();
            fixture.detectChanges();

            testInstance.control.setValue(['tacos-2', 'steak-0', 'pizza-1']);
            fixture.detectChanges();

            expect(trigger.textContent).toContain('Tacos, Pizza, Steak');
        }));

        it('should throw an exception when trying to set a non-array value', fakeAsync(() => {
            expect(() => {
                testInstance.control.setValue('not-an-array');
            }).toThrowError(wrappedErrorMessage(getKbqSelectNonArrayValueError()));
        }));

        it('should throw an exception when trying to change multiple mode after init', fakeAsync(() => {
            expect(() => {
                testInstance.select.multiple = false;
            }).toThrowError(wrappedErrorMessage(getKbqSelectDynamicMultipleError()));
        }));

        it('should pass the `multiple` value to all of the option instances', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(testInstance.options.toArray().every((option: any) => option.multiple))
                .withContext('Expected `multiple` to have been added to initial set of options.')
                .toBe(true);

            testInstance.foods.push({ value: 'cake-8', viewValue: 'Cake' });
            fixture.detectChanges();
            tick(1);

            expect(testInstance.options.toArray().every((option) => !!option.multiple))
                .withContext('Expected `multiple` to have been set on dynamically-added option.')
                .toBe(true);
        }));

        it('should update the active item index on click', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            flush();

            expect(fixture.componentInstance.select.keyManager.activeItemIndex).toBe(0);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[2].click();
            fixture.detectChanges();
            tick();
            flush();

            expect(fixture.componentInstance.select.keyManager.activeItemIndex).toBe(2);
        }));

        it('should be to select an option with a `null` value', fakeAsync(() => {
            fixture.componentInstance.foods = [
                { value: null, viewValue: 'Steak' },
                { value: 'pizza-1', viewValue: 'Pizza' },
                { value: null, viewValue: 'Tacos' }
            ];

            fixture.detectChanges();
            trigger.click();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].click();
            options[1].click();
            options[2].click();
            fixture.detectChanges();
            tick();
            flush();

            expect(testInstance.control.value).toEqual([null, 'pizza-1', null]);
        }));

        it('should select all options when pressing ctrl + a', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-select');
            const options = fixture.componentInstance.options.toArray();

            expect(testInstance.control.value).toBeFalsy();
            expect(options.every((option) => option.selected)).toBe(false);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        it('should skip disabled options when using ctrl + a', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-select');
            const options = fixture.componentInstance.options.toArray();

            for (let i = 0; i < 3; i++) {
                options[i].disabled = true;
            }

            expect(testInstance.control.value).toBeFalsy();

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual([
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        it('should select all options when pressing ctrl + a when some options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-select');
            const options = fixture.componentInstance.options.toArray();

            options[0].select();
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual(['steak-0']);
            expect(options.some((option) => option.selected)).toBe(true);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.every((option) => option.selected)).toBe(true);
            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
        });

        it('should deselect all options with ctrl + a if all options are selected', () => {
            const selectElement = fixture.nativeElement.querySelector('kbq-select');
            const options = fixture.componentInstance.options.toArray();

            options.forEach((option) => option.select());
            fixture.detectChanges();

            expect(testInstance.control.value).toEqual([
                'steak-0',
                'pizza-1',
                'tacos-2',
                'sandwich-3',
                'chips-4',
                'eggs-5',
                'pasta-6',
                'sushi-7'
            ]);
            expect(options.every((option) => option.selected)).toBe(true);

            fixture.componentInstance.select.open();
            fixture.detectChanges();

            const event = createKeyboardEvent('keydown', A, selectElement);
            Object.defineProperty(event, 'ctrlKey', { get: () => true });
            dispatchEvent(selectElement, event);
            fixture.detectChanges();

            expect(options.some((option) => option.selected)).toBe(false);
            expect(testInstance.control.value).toEqual([]);
        });

        it('should allow providing custom tag content', fakeAsync(() => {
            let fixtureCustomizedContent: ComponentFixture<MultiSelectWithCustomizedTagContent>;
            fixtureCustomizedContent = TestBed.createComponent(MultiSelectWithCustomizedTagContent);
            const componentInstance = fixtureCustomizedContent.componentInstance;
            fixtureCustomizedContent.detectChanges();

            trigger = fixtureCustomizedContent.debugElement.query(
                By.css('.kbq-select__trigger_multiple')
            ).nativeElement;
            fixtureCustomizedContent.detectChanges();

            trigger.click();
            fixtureCustomizedContent.detectChanges();
            flush();

            expect(
                componentInstance.kbqSelect.tags
                    .map((tag) => tag.nativeElement?.textContent)
                    .every((tagTextContent) => tagTextContent!.includes(componentInstance.customizedTextToken))
            ).toEqual(true);
        }));

        it('should hide tags if tags container is overflown', fakeAsync(() => {
            let fixtureTest = TestBed.createComponent(MultiSelectNarrow);
            let componentInstance: MultiSelectNarrow = fixtureTest.componentInstance;
            let triggerEl: HTMLElement;

            fixtureTest.detectChanges();

            triggerEl = fixtureTest.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            triggerEl.click();
            fixtureTest.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            for (let step = 0; step < 6; step++) {
                if (options.item(step)) {
                    options.item(step).click();
                }
            }
            fixtureTest.detectChanges();
            tick();
            flush();

            expect(componentInstance.select.hiddenItems).not.toBeFalsy();
        }));

        // todo need fix later
        xit('should compute hidden items correctly', fakeAsync(() => {
            let fixtureTest = TestBed.createComponent(MultiSelectNarrow);
            let componentInstance: MultiSelectNarrow = fixtureTest.componentInstance;
            let triggerEl: HTMLElement;

            fixtureTest.detectChanges();

            triggerEl = fixtureTest.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            triggerEl.click();
            fixtureTest.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            for (let step = 0; step < 2; step++) {
                if (options.item(step)) {
                    options.item(step).click();
                }
            }
            fixtureTest.detectChanges();
            tick();
            flush();

            expect(componentInstance.select.hiddenItems).toEqual(1);

            options.item(2).click();
            fixtureTest.detectChanges();
            tick();
            flush();
            expect(componentInstance.select.hiddenItems).toEqual(2);
        }));
    });

    describe('option tooltip', () => {
        beforeEach(waitForAsync(() => {
            configureKbqSelectTestingModule([SelectWithLongOptionText]);
        }));

        let fixture: ComponentFixture<SelectWithLongOptionText>;
        let testInstance: SelectWithLongOptionText;
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
            testInstance = fixture.componentInstance;
            fixture.detectChanges();

            trigger = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;
            flush();
        }));

        it('should not display tooltip if ellipse not applied', fakeAsync(() => {
            trigger.click();
            fixture.detectChanges();
            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options[0].style.width = '200px';

            dispatchMouseEvent(options[0], 'mouseenter');
            tick();
            fixture.detectChanges();

            const tooltips = document.querySelectorAll('.kbq-tooltip__content');
            expect(tooltips.length).toEqual(0);
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
            expect(tooltips[0].textContent).toEqual(options[1].textContent);
            flush();
        }));

        xit('should change tooltip if option content changed', fakeAsync(() => {
            trigger.click();
            tick();
            fixture.detectChanges();

            window.dispatchEvent(new Event('resize'));
            tick();
            fixture.detectChanges();

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            dispatchMouseEvent(options[2], 'mouseenter');
            tick();
            fixture.detectChanges();

            let tooltips = document.querySelectorAll('.kbq-tooltip__content');
            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toEqual(options[2].textContent);

            testInstance.changeLabel();
            fixture.detectChanges();

            tick(500);

            tooltips = document.querySelectorAll('.kbq-tooltip__content');
            expect(tooltips.length).toEqual(1);
            expect(tooltips[0].textContent).toEqual(options[2].textContent);

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
                declarations: [CdkVirtualScrollViewportSelect, CdkVirtualScrollViewportSelectOptionAsObject]
            }).compileComponents();

            inject([OverlayContainer, Platform], (oc: OverlayContainer, p: Platform) => {
                overlayContainer = oc;
                overlayContainerElement = oc.getContainerElement();
                platform = p;
            })();
        }));

        let fixture: ComponentFixture<CdkVirtualScrollViewportSelect>;
        let testInstance: CdkVirtualScrollViewportSelect;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(CdkVirtualScrollViewportSelect<string>);
            testInstance = fixture.componentInstance;
            finishInit(fixture);
        }));

        afterEach(fakeAsync(() => flush()));

        it('should sort selected tags when some options hidden', fakeAsync(() => {
            testInstance.select.open();
            finishInit(fixture);

            const options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');
            fixture.autoDetectChanges();
            flush();

            [5, 3, 7].forEach((index) => {
                if (options[index]) {
                    options[index].click();
                    fixture.autoDetectChanges();
                    flush();
                }
            });

            fixture.autoDetectChanges();
            flush();

            const selectedOptions: string[] = testInstance.select.selectionModel.selected.map((option) => option.value);

            testInstance.select.options.changes.pipe(take(1)).subscribe(() => {
                const currentOptions: NodeListOf<HTMLElement> | undefined =
                    overlayContainerElement.querySelectorAll('kbq-option');
                const currentSelectedOptions: string[] = testInstance.select.selectionModel.selected.map(
                    (option) => option.value
                );

                expect(options?.length).not.toEqual(currentOptions.length);
                expect(selectedOptions.length).toEqual(currentSelectedOptions.length);
                expect(selectedOptions).toEqual(currentSelectedOptions);
            });

            // simulate option removal for detection checks
            testInstance.options = testInstance.options.filter((option) => option !== selectedOptions[2]);
            fixture.autoDetectChanges();
            flush();
            tick(1);
        }));

        it('should render tags for non-rendered KbqOptions/values', fakeAsync(() => {
            const selectMatcher = fixture.debugElement.query(By.css('.kbq-select__matcher')).nativeElement;
            testInstance.values = [OPTIONS[0], OPTIONS[OPTIONS.length - 1]];
            fixture.detectChanges();
            flush();

            testInstance.select.open();
            finishInit(fixture);

            const tags: NodeListOf<HTMLElement> = selectMatcher.querySelectorAll('kbq-tag');
            fixture.detectChanges();

            expect(tags.length).toEqual(2);
            expect(testInstance.select.keyManager.activeItem).toBeInstanceOf(KbqOption);
            expect((testInstance.select.selected as any[]).length).toEqual(2);
            expect((testInstance.select.selected as any[])[1]).toBeInstanceOf(KbqVirtualOption);
        }));

        it('should calculate hidden items with virtual options', fakeAsync(() => {
            let triggerEl: HTMLElement;
            triggerEl = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

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

        it('should recalculate hidden items when previous rendered options range disappeared', fakeAsync(() => {
            let fixture: ComponentFixture<CdkVirtualScrollViewportSelectOptionAsObject>;
            let testInstance: CdkVirtualScrollViewportSelectOptionAsObject;

            fixture = TestBed.createComponent(CdkVirtualScrollViewportSelectOptionAsObject);
            testInstance = fixture.componentInstance;
            finishInit(fixture);

            const triggerEl: HTMLElement = fixture.debugElement.query(By.css('.kbq-select__trigger')).nativeElement;

            fixture.autoDetectChanges();
            flush();

            testInstance.style = { width: '100px' };
            triggerEl.click();
            fixture.detectChanges();

            let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('kbq-option');

            options.forEach((option) => {
                option.click();
                tick();
            });
            fixture.autoDetectChanges();
            flush();

            const hiddenItemBeforeRenderedOptionsChange = fixture.componentInstance.select.hiddenItems;

            testInstance.viewport.setRenderedRange({ start: options.length + 1, end: options.length * 2 + 1 });
            // finishInit(fixture);
            fixture.autoDetectChanges();
            tick(1);

            options = overlayContainerElement.querySelectorAll('kbq-option');
            options.forEach((option) => {
                option.click();
                tick();
            });

            expect(testInstance.select.hiddenItems).not.toEqual(hiddenItemBeforeRenderedOptionsChange);
        }));
    });
});
