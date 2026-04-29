import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, signal, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
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
                    <kbq-option class="kbq-hovered" [value]="'hovered'">hover</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-active" [value]="'focused'">focused</kbq-option>
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
    host: {
        'data-testid': 'e2eSelectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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
                    <kbq-option class="kbq-hovered" [value]="'hovered'">hover</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-active" [value]="'focused'">focused</kbq-option>
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
    host: {
        'data-testid': 'e2eMultiselectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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
                    <kbq-option class="kbq-hovered" [value]="'hovered'">hover</kbq-option>
                    <kbq-option [value]="'selected'">selected</kbq-option>
                    <kbq-option class="kbq-active" [value]="'focused'">focused</kbq-option>
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
            height: 360px;
            gap: 16px;
            padding: 8px;
        }
    `,
    host: {
        'data-testid': 'e2eMultilineSelectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eMultilineSelectStates {}

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
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [ngModel]="''" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                <kbq-optgroup class="cdk-keyboard-focused" [label]="'group'">
                    <kbq-option [value]="'default'">default</kbq-option>
                    <kbq-option [value]="'default1'">default1 long name long name long name</kbq-option>
                    <kbq-option class="kbq-hovered" [value]="'hovered'">hover</kbq-option>
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
    host: {
        'data-testid': 'e2eSelectWithSearchAndFooter'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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
    host: {
        'data-testid': 'e2eSelectPositioning'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eSelectPositioning {
    readonly foods = POSITIONING_FOODS;
    readonly control = new UntypedFormControl();
    readonly heightAbove = signal(0);
    readonly heightBelow = signal(0);
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
    host: {
        'data-testid': 'e2eMultiSelectPositioning'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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
    host: {
        'data-testid': 'e2eSelectWithGroupsPositioning'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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
    host: {
        'data-testid': 'e2eSelectRtlPositioning'
    },
    providers: [{ provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }],
    changeDetection: ChangeDetectionStrategy.OnPush
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
    host: {
        'data-testid': 'e2eMultiSelectRtlPositioning'
    },
    providers: [{ provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }],
    changeDetection: ChangeDetectionStrategy.OnPush
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
    host: {
        'data-testid': 'e2eSelectWithGroupsRtlPositioning'
    },
    providers: [{ provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }],
    changeDetection: ChangeDetectionStrategy.OnPush
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
    host: {
        'data-testid': 'e2eMultiSelectNarrow'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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
    host: {
        'data-testid': 'e2eVirtualScrollMultiSelectNarrow'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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

    @ViewChild(KbqSelect, { static: true }) select!: KbqSelect;
    @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
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
    host: {
        'data-testid': 'e2eSelectLongOptionText'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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
