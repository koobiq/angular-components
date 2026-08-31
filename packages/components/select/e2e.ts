import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqTagsModule } from '@koobiq/components/tags';
import { EMPTY } from 'rxjs';
import { KbqSelect } from './select.component';
import { KbqSelectModule } from './select.module';

@Component({
    selector: 'e2e-select-states',
    imports: [
        KbqSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-select data-testid="e2eSelect" [value]="'selected'">
                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-active" [value]="'focused'">focused</kbq-option>
                    <kbq-option class="kbq-pressed" [value]="'pressed'">pressed</kbq-option>
                    <kbq-option [disabled]="true" [value]="'disabled'">disabled</kbq-option>
                </kbq-optgroup>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 350px;
            height: 350px;
            gap: 16px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectStates'
    }
})
export class E2eSelectStates {}

@Component({
    selector: 'e2e-multi-select-states',
    imports: [
        KbqSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field style="width: 200px">
            <kbq-select data-testid="e2eMultiSelect" [multiple]="true" [value]="['selected', 'default', 'default1']">
                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option [value]="'default'">
                        <div>default + caption</div>
                        <div class="kbq-option-caption">caption</div>
                    </kbq-option>
                    <kbq-option [value]="'default1'">default1 long name long name long name</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-active" [value]="'focused'">focused</kbq-option>
                    <kbq-option class="kbq-pressed" [value]="'pressed'">pressed</kbq-option>
                    <kbq-option [disabled]="true" [value]="'disabled'">disabled</kbq-option>
                </kbq-optgroup>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 350px;
            height: 420px;
            gap: 16px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMultiselectStates'
    }
})
export class E2eMultiSelectStates {}

@Component({
    selector: 'e2e-multiline-select-states',
    imports: [
        KbqSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field style="width: 200px">
            <kbq-select
                data-testid="e2eMultilineSelect"
                [multiple]="true"
                [multiline]="true"
                [value]="['selected', 'default', 'default1']"
            >
                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option [value]="'default1'">default1 long name long name long name</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-active" [value]="'focused'">focused</kbq-option>
                    <kbq-option class="kbq-pressed" [value]="'pressed'">pressed</kbq-option>
                    <kbq-option [disabled]="true" [value]="'disabled'">disabled</kbq-option>
                </kbq-optgroup>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 350px;
            height: 410px;
            gap: 16px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMultilineSelectStates'
    }
})
export class E2eMultilineSelectStates {}

@Component({
    selector: 'e2e-select-selection-state',
    imports: [KbqFormFieldModule, KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select
                data-testid="e2eSelect"
                placeholder="Placeholder"
                [multiline]="true"
                [panelWidth]="400"
                [value]="selected"
            >
                <kbq-option [value]="1">Selected</kbq-option>
                <kbq-option disabled [value]="2">Selected + Disabled</kbq-option>
                <kbq-option [value]="3">Selected</kbq-option>
                <kbq-option [value]="4">Option</kbq-option>

                <kbq-cleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            width: 440px;
            height: 180px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectSelectionState'
    }
})
export class E2eSelectSelectionState {
    protected readonly selected = [1, 2, 3];
}

@Component({
    selector: 'e2e-select-with-search-and-footer',
    imports: [
        KbqSelectModule,
        KbqInputModule,
        FormsModule,
        KbqIconModule
    ],
    template: `
        <kbq-form-field style="width: 200px">
            <kbq-select data-testid="e2eSelect" [value]="'selected'">
                <kbq-form-field noBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [ngModel]="''" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option [value]="'default1'">default1 long name long name long name</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-active" [value]="'focused'">focused</kbq-option>
                    <kbq-option [disabled]="true" [value]="'disabled'">disabled</kbq-option>
                </kbq-optgroup>

                <kbq-select-footer>Caption ⌥+⌘+F</kbq-select-footer>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 350px;
            height: 390px;
            gap: 16px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectWithSearchAndFooter'
    }
})
export class E2eSelectWithSearchAndFooter {}

/* -------------------------------------------------------------------------- */
/*  E2E fixtures for layout-dependent select tests previously kept as xit.    */
/*  Each fixture exposes data-testid hooks so Playwright can drive it without */
/*  reaching into Angular internals.                                          */
/* -------------------------------------------------------------------------- */

const POSITIONING_FOODS = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
    { value: 'sandwich-3', viewValue: 'Sandwich' },
    { value: 'chips-4', viewValue: 'Chips' },
    { value: 'eggs-5', viewValue: 'Eggs' },
    { value: 'pasta-6', viewValue: 'Pasta' },
    { value: 'sushi-7', viewValue: 'Sushi' }
];

@Component({
    selector: 'e2e-select-positioning',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <div [style.height.px]="heightAbove()"></div>
        <kbq-form-field [attr.data-testid]="'e2eFormField'">
            <kbq-select data-testid="e2eSelect" placeholder="Food" [formControl]="control">
                @for (food of foods; track food.value) {
                    <!-- eslint-disable-next-line @angular-eslint/template/prefer-template-literal -->
                    <kbq-option [attr.data-testid]="'e2eOption-' + food.value" [value]="food.value">
                        {{ food.viewValue }}
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
        <div [style.height.px]="heightBelow()"></div>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectPositioning'
    }
})
export class E2eSelectPositioning {
    readonly foods = POSITIONING_FOODS;
    readonly control = new UntypedFormControl();
    readonly heightAbove = signal(0);
    readonly heightBelow = signal(0);
}

/**
 * Multiline select in a field narrow enough that its tags wrap onto many rows. Selecting everything grows the
 * trigger past what a viewport can host beside a full-height panel, which is what used to push the panel off
 * the screen.
 */
@Component({
    selector: 'e2e-multiline-select-overflow',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field [attr.data-testid]="'e2eFormField'" [style.width.px]="fieldWidth()">
            <kbq-select
                data-testid="e2eSelect"
                placeholder="Food"
                [formControl]="control"
                [multiline]="true"
                [multiple]="true"
            >
                @for (food of foods; track food.value) {
                    <!-- eslint-disable-next-line @angular-eslint/template/prefer-template-literal -->
                    <kbq-option [attr.data-testid]="'e2eOption-' + food.value" [value]="food.value">
                        {{ food.viewValue }}
                    </kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMultilineSelectOverflow'
    }
})
export class E2eMultilineSelectOverflow {
    /** Ten of these in a 180px field wrap onto ten rows, which makes the trigger roughly 280px tall. */
    readonly foods = Array.from({ length: 10 }, (_, index) => ({
        value: `opt-${index}`,
        viewValue: `Option ${index}`
    }));

    readonly control = new UntypedFormControl(this.foods.map(({ value }) => value));
    readonly fieldWidth = signal(180);
}

@Component({
    selector: 'e2e-multi-select-positioning',
    imports: [KbqSelectModule, ReactiveFormsModule, KbqTagsModule, KbqIconModule],
    template: `
        <kbq-form-field [attr.data-testid]="'e2eFormField'">
            <kbq-select data-testid="e2eSelect" placeholder="Food" [multiple]="true" [formControl]="control">
                @for (food of foods; track food.value) {
                    <!-- eslint-disable-next-line @angular-eslint/template/prefer-template-literal -->
                    <kbq-option [attr.data-testid]="'e2eOption-' + food.value" [value]="food.value">
                        {{ food.viewValue }}
                    </kbq-option>
                }
                <ng-template #kbqSelectTagContent let-option>
                    <kbq-tag [selectable]="false">{{ option.viewValue }}</kbq-tag>
                </ng-template>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMultiSelectPositioning'
    }
})
export class E2eMultiSelectPositioning {
    readonly foods = POSITIONING_FOODS;
    readonly control = new UntypedFormControl();
}

@Component({
    selector: 'e2e-select-with-groups-positioning',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <kbq-form-field [attr.data-testid]="'e2eFormField'">
            <kbq-select data-testid="e2eSelect" placeholder="Pokemon" [formControl]="control">
                @for (group of pokemonTypes; track group.name) {
                    <kbq-optgroup [label]="group.name" [disabled]="!!group.disabled">
                        @for (pokemon of group.pokemon; track pokemon.value) {
                            <!-- eslint-disable-next-line @angular-eslint/template/prefer-template-literal -->
                            <kbq-option [attr.data-testid]="'e2eOption-' + pokemon.value" [value]="pokemon.value">
                                {{ pokemon.viewValue }}
                            </kbq-option>
                        }
                    </kbq-optgroup>
                }
                <kbq-option [attr.data-testid]="'e2eOption-mime-11'" [value]="'mime-11'">Mr. Mime</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectWithGroupsPositioning'
    }
})
export class E2eSelectWithGroupsPositioning {
    readonly control = new UntypedFormControl();
    readonly pokemonTypes = [
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
}

@Component({
    selector: 'e2e-select-rtl-positioning',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <div dir="rtl">
            <kbq-form-field [attr.data-testid]="'e2eFormField'">
                <kbq-select data-testid="e2eSelect" placeholder="Food" [formControl]="control">
                    @for (food of foods; track food.value) {
                        <!-- eslint-disable-next-line @angular-eslint/template/prefer-template-literal -->
                        <kbq-option [attr.data-testid]="'e2eOption-' + food.value" [value]="food.value">
                            {{ food.viewValue }}
                        </kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
        }
    `,
    providers: [{ provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectRtlPositioning'
    }
})
export class E2eSelectRtlPositioning {
    readonly foods = POSITIONING_FOODS;
    readonly control = new UntypedFormControl();
}

@Component({
    selector: 'e2e-multi-select-rtl-positioning',
    imports: [KbqSelectModule, ReactiveFormsModule, KbqTagsModule, KbqIconModule],
    template: `
        <div dir="rtl">
            <kbq-form-field [attr.data-testid]="'e2eFormField'">
                <kbq-select data-testid="e2eSelect" placeholder="Food" [multiple]="true" [formControl]="control">
                    @for (food of foods; track food.value) {
                        <!-- eslint-disable-next-line @angular-eslint/template/prefer-template-literal -->
                        <kbq-option [attr.data-testid]="'e2eOption-' + food.value" [value]="food.value">
                            {{ food.viewValue }}
                        </kbq-option>
                    }
                    <ng-template #kbqSelectTagContent let-option>
                        <kbq-tag [selectable]="false">{{ option.viewValue }}</kbq-tag>
                    </ng-template>
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
        }
    `,
    providers: [{ provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMultiSelectRtlPositioning'
    }
})
export class E2eMultiSelectRtlPositioning {
    readonly foods = POSITIONING_FOODS;
    readonly control = new UntypedFormControl();
}

@Component({
    selector: 'e2e-select-with-groups-rtl-positioning',
    imports: [KbqSelectModule, ReactiveFormsModule],
    template: `
        <div dir="rtl">
            <kbq-form-field [attr.data-testid]="'e2eFormField'">
                <kbq-select data-testid="e2eSelect" placeholder="Pokemon" [formControl]="control">
                    @for (group of pokemonTypes; track group.name) {
                        <kbq-optgroup [label]="group.name">
                            @for (pokemon of group.pokemon; track pokemon.value) {
                                <!-- eslint-disable-next-line @angular-eslint/template/prefer-template-literal -->
                                <kbq-option [attr.data-testid]="'e2eOption-' + pokemon.value" [value]="pokemon.value">
                                    {{ pokemon.viewValue }}
                                </kbq-option>
                            }
                        </kbq-optgroup>
                    }
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
        }
    `,
    providers: [{ provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectWithGroupsRtlPositioning'
    }
})
export class E2eSelectWithGroupsRtlPositioning {
    readonly control = new UntypedFormControl();
    readonly pokemonTypes = [
        {
            name: 'Grass',
            pokemon: [
                { value: 'bulbasaur-0', viewValue: 'Bulbasaur' },
                { value: 'oddish-1', viewValue: 'Oddish' }
            ]
        },
        {
            name: 'Fire',
            pokemon: [
                { value: 'charmander-6', viewValue: 'Charmander' },
                { value: 'vulpix-7', viewValue: 'Vulpix' }
            ]
        }
    ];
}

@Component({
    selector: 'e2e-multi-select-narrow',
    imports: [KbqSelectModule, ReactiveFormsModule, KbqTagsModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-select
                data-testid="e2eSelect"
                multiple
                placeholder="Food"
                style="width: 100px;"
                [formControl]="control"
            >
                @for (food of foods; track food.value) {
                    <!-- eslint-disable-next-line @angular-eslint/template/prefer-template-literal -->
                    <kbq-option [attr.data-testid]="'e2eOption-' + food.value" [value]="food.value">
                        {{ food.viewValue }}
                    </kbq-option>
                }
                <ng-template #kbqSelectTagContent let-option>
                    <kbq-tag [selectable]="false">{{ option.viewValue }}</kbq-tag>
                </ng-template>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
            width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eMultiSelectNarrow'
    }
})
export class E2eMultiSelectNarrow {
    readonly foods = POSITIONING_FOODS;
    readonly control = new UntypedFormControl();
}

@Component({
    selector: 'e2e-virtual-scroll-multi-select-narrow',
    imports: [KbqSelectModule, ReactiveFormsModule, ScrollingModule, KbqTagsModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-select data-testid="e2eSelect" [multiple]="true" [style]="{ width: '100px' }" [(value)]="values">
                <cdk-virtual-scroll-viewport [itemSize]="itemSize" [minBufferPx]="100" [maxBufferPx]="400">
                    <!-- eslint-disable @angular-eslint/template/prefer-template-literal -->
                    <kbq-option
                        *cdkVirtualFor="let option of options; templateCacheSize: 0"
                        [attr.data-testid]="'e2eOption-' + option"
                        [value]="option"
                    >
                        <!-- eslint-enable -->
                        {{ option }}
                    </kbq-option>
                </cdk-virtual-scroll-viewport>
                <ng-template #kbqSelectTagContent let-option>
                    <kbq-tag [selectable]="false">{{ option.viewValue }}</kbq-tag>
                </ng-template>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
            width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eVirtualScrollMultiSelectNarrow'
    }
})
export class E2eVirtualScrollMultiSelectNarrow {
    readonly itemSize = 32;
    values: string[] = [];
    readonly options = [
        'Abakan',
        'Almetyevsk',
        'Anadyr',
        'Anapa',
        'Arkhangelsk',
        'Astrakhan',
        'Barnaul',
        'Belgorod',
        'Beslan',
        'Biysk'
    ];

    readonly select = viewChild.required(KbqSelect);
    readonly viewport = viewChild.required(CdkVirtualScrollViewport);
}

@Component({
    selector: 'e2e-select-long-option-text',
    imports: [KbqSelectModule, KbqTagsModule],
    template: `
        <kbq-form-field>
            <kbq-select data-testid="e2eSelect">
                <kbq-option data-testid="e2eOption-short" [value]="'value1'">Not long text</kbq-option>
                <kbq-option data-testid="e2eOption-long" style="max-width: 200px;" [value]="'value2'">
                    Long long long long Long long long long Long long long long Long long long long Long long long long
                    Long long long long text
                </kbq-option>
                <kbq-option data-testid="e2eOption-changing" style="max-width: 200px;" [value]="'value3'">
                    {{ changingLabel() }}
                </kbq-option>
            </kbq-select>
        </kbq-form-field>
        <button
            type="button"
            data-testid="e2eChangeLabelButton"
            style="position: fixed; top: 8px; right: 8px; z-index: 9999;"
            (click)="changeLabel()"
        >
            change label
        </button>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
            width: 240px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectLongOptionText'
    }
})
export class E2eSelectLongOptionText {
    private counter = 0;
    readonly changingLabel = signal(
        'Changed Long long long long Long long long long Long long long long Long long long long Long long long long Long long long long text'
    );

    changeLabel(): void {
        this.changingLabel.update((label) => label.concat((this.counter++).toString()));
    }
}

@Component({
    selector: 'e2e-select-panel-max-height',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field [attr.data-testid]="'e2eFormField'">
            <kbq-select data-testid="e2eSelect" [panelMaxHeight]="panelMaxHeight()">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
        <button
            type="button"
            data-testid="e2eGrowPanelButton"
            style="position: fixed; top: 8px; right: 8px; z-index: 9999;"
            (click)="panelMaxHeight.set(2000)"
        >
            grow panel
        </button>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
            width: 240px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectPanelMaxHeight'
    }
})
export class E2eSelectPanelMaxHeight {
    readonly panelMaxHeight = signal<number | null>(null);
    readonly options = Array.from({ length: 30 }).map((_, index) => `Option #${index + 1}`);
}

@Component({
    selector: 'e2e-virtual-scroll-select-panel-max-height',
    imports: [KbqSelectModule, ScrollingModule],
    template: `
        <kbq-form-field [attr.data-testid]="'e2eFormField'">
            <kbq-select data-testid="e2eSelect" [panelMaxHeight]="300">
                <cdk-virtual-scroll-viewport [itemSize]="itemSize" [minBufferPx]="100" [maxBufferPx]="400">
                    <kbq-option *cdkVirtualFor="let option of options; templateCacheSize: 0" [value]="option">
                        {{ option }}
                    </kbq-option>
                </cdk-virtual-scroll-viewport>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
            width: 240px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eVirtualScrollSelectPanelMaxHeight'
    }
})
export class E2eVirtualScrollSelectPanelMaxHeight {
    readonly itemSize = 32;
    // Fewer options than the cap can show, so that the pinned viewport height is observable.
    readonly options = ['Abakan', 'Almetyevsk', 'Anadyr'];
}

@Component({
    selector: 'e2e-select-select-all-states',
    imports: [KbqSelectModule, FormsModule],
    template: `
        <div style="display: flex; gap: 16px;">
            <kbq-form-field>
                <kbq-select data-testid="e2eSelectEmpty" multiple selectAll placeholder="Empty">
                    <kbq-option [value]="'a'">Option A</kbq-option>
                    <kbq-option [value]="'b'">Option B</kbq-option>
                    <kbq-option [value]="'c'">Option C</kbq-option>
                </kbq-select>
            </kbq-form-field>
            <kbq-form-field>
                <kbq-select data-testid="e2eSelectPartial" multiple selectAll placeholder="Partial" [value]="['a']">
                    <kbq-option [value]="'a'">Option A</kbq-option>
                    <kbq-option [value]="'b'">Option B</kbq-option>
                    <kbq-option [value]="'c'">Option C</kbq-option>
                </kbq-select>
            </kbq-form-field>
            <kbq-form-field>
                <kbq-select data-testid="e2eSelectFull" multiple selectAll placeholder="Full" [value]="['a', 'b', 'c']">
                    <kbq-option [value]="'a'">Option A</kbq-option>
                    <kbq-option [value]="'b'">Option B</kbq-option>
                    <kbq-option [value]="'c'">Option C</kbq-option>
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: 16px;
            width: 700px;
            height: 220px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectSelectAllStates'
    }
})
export class E2eSelectSelectAllStates {}

@Component({
    selector: 'e2e-select-scrollbar',
    imports: [
        KbqSelectModule,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-select data-testid="e2eSelect" [value]="'Option 0'">
                @for (option of options; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;

            width: 350px;
            height: 500px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectScrollbar'
    }
})
export class E2eSelectScrollbar {
    protected readonly options = Array.from({ length: 40 }).map((_, i) => `Option ${i}`);
}

@Component({
    selector: 'e2e-select-scrollbar-no-overflow',
    imports: [KbqSelectModule],
    template: `
        <kbq-form-field>
            <kbq-select data-testid="e2eSelect">
                <kbq-option value="1">Option 1</kbq-option>
                <kbq-option value="2">Option 2</kbq-option>
                <kbq-option value="3">Option 3</kbq-option>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: block;
            width: 320px;
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSelectScrollbarNoOverflow'
    }
})
export class E2eSelectScrollbarNoOverflow {}

@Component({
    selector: 'e2e-virtual-scroll-select-scrollbar',
    imports: [KbqSelectModule, ScrollingModule, KbqScrollbarViewport],
    template: `
        <kbq-form-field>
            <kbq-select data-testid="e2eSelect" [(value)]="selected" (openedChange)="openedChange($event)">
                <cdk-virtual-scroll-viewport kbqScrollbarViewport itemSize="32" minBufferPx="300" maxBufferPx="300">
                    <kbq-option *cdkVirtualFor="let option of options" [value]="option">{{ option }}</kbq-option>
                </cdk-virtual-scroll-viewport>
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;

            width: 350px;
            height: 500px;
            padding: 8px;
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eVirtualScrollSelectScrollbar'
    }
})
export class E2eVirtualScrollSelectScrollbar {
    protected readonly options = Array.from({ length: 10000 }).map((_, i) => `Option ${i}`);
    protected readonly viewport = viewChild.required(CdkVirtualScrollViewport);

    protected selected = this.options[0];

    protected openedChange(isOpened: boolean): void {
        if (!isOpened) return;
        this.viewport().scrollToIndex(this.options.indexOf(this.selected));
    }
}
