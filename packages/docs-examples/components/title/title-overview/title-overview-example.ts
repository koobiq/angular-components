import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

const options = [
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Longest text (0123456789 qwertyuiopasdfghjklzxcvbnm)',
    'Волгоград',
    'Воронеж',
    'Ейск',
    'Екабпилс',
    'Екатеринбург',
    'Екатериновка',
    'Екатеринославка',
    'Екаша',
    'Екибастуз',
    'Екпинди',
    'Елань',
    'Елец',
    'Казань',
    'Краснодар',
    'Красноярск',
    'Москва',
    'Нижний Новгород',
    'Новосибирск',
    'Омск',
    'Пермь',
    'Ростов-на-Дону',
    'Самара',
    'Санкт-Петербург',
    'Уфа',
    'Челябинск'
];

/**
 * @title Title
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'title-overview-example',
    imports: [
        KbqTitleModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqOptionModule,
        KbqSelectModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqAutocompleteModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqDividerModule,
        AsyncPipe
    ],
    template: `
        <div class="dev-container">
            <div class="kbq-subheading">Simple cut text with tooltip in div</div>
            <br />
            <div class="child dev-text-with-tooltip kbq-text-big" kbq-title>
                {{ longValue }}
            </div>
        </div>

        <div class="dev-container">
            <div class="kbq-subheading">Simple cut text with tooltip inside button</div>
            <br />
            <button class="dev-text-with-tooltip kbq-text-big" kbq-button kbq-title>
                {{ longValue }}
            </button>
        </div>

        <div class="dev-container dev-container-responsive">
            <div class="kbq-subheading">Responsive text with tooltip</div>
            <br />
            <div class="dev-child wide kbq-text-big" kbq-title>
                {{ longValue }}
            </div>
        </div>

        <div class="dev-container">
            <div class="kbq-subheading">Tooltip tracking for parent & child as parameters</div>
            <br />

            <div kbq-title style="max-width: 50%">
                <div class="dev-parent" #kbqTitleContainer>
                    <div class="dev-child kbq-text-normal" #kbqTitleText>
                        {{ field }}
                    </div>
                </div>
            </div>

            <button (click)="onAddText()" kbq-button>Add text</button>
            <button (click)="field = defaultValue" kbq-button>Set Default text</button>
        </div>

        <div class="dev-container">
            <div class="kbq-subheading">Select/autocomplete with long KbqOptions and tooltips</div>
            <br />

            <kbq-form-field>
                <kbq-select [(value)]="singleSelected" [placeholder]="'placeholder'">
                    <kbq-option [value]="'Disabled'" disabled>Disabled</kbq-option>
                    <kbq-option [value]="'Normal'" kbq-title>Normal</kbq-option>
                    <kbq-option [value]="'Hovered'" kbq-title>Hovered</kbq-option>
                    <kbq-option [value]="'Focused'" kbq-title>Focused</kbq-option>
                    <kbq-option [value]="'Selected'" kbq-title>Selected</kbq-option>
                    <kbq-option [value]="'Selected1'" kbq-title>Selected1</kbq-option>
                    <kbq-option [value]="'Selected2'" kbq-title>Selected2</kbq-option>
                    <kbq-option [value]="'Selected3'" kbq-title>Selected3</kbq-option>
                    <kbq-option [value]="'Selected4'" kbq-title>Selected4</kbq-option>
                    <kbq-option [value]="'Selected5'" kbq-title>Selected5</kbq-option>
                    <kbq-option [value]="'Selected6'" kbq-title>Selected6</kbq-option>
                    <kbq-option [value]="'Selected7'" kbq-title>Selected7</kbq-option>
                    <kbq-option [value]="'Selected8'" kbq-title>
                        {{ longValue }}
                    </kbq-option>
                    <kbq-option [value]="'Selected9'" kbq-title>
                        {{ longValue }}
                    </kbq-option>
                </kbq-select>
            </kbq-form-field>

            <kbq-form-field>
                <input [formControl]="formControl" [kbqAutocomplete]="auto" kbqInput type="text" />
                <kbq-autocomplete #auto="kbqAutocomplete">
                    @for (option of filteredOptions | async; track option) {
                        <kbq-option [value]="option" kbq-title>
                            {{ option }}
                        </kbq-option>
                    }
                </kbq-autocomplete>
            </kbq-form-field>
        </div>

        <div class="dev-container">
            <div class="kbq-subheading">Dropdown with long options and tooltips</div>
            <br />

            <button class="kbq-button_transparent" [kbqDropdownTriggerFor]="appDropdown" kbq-button>
                dropdown
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            <kbq-dropdown #appDropdown="kbqDropdown" [overlapTriggerX]="false" [overlapTriggerY]="true">
                <button kbq-dropdown-item kbq-title>
                    <i kbq-icon="kbq-circle-xs_16"></i>
                    Общие сведения
                </button>

                <kbq-divider />

                <button kbq-dropdown-item kbq-title>
                    {{ longValue }}
                </button>

                <button kbq-dropdown-item kbq-title>
                    <div #kbqTitleContainer>
                        <div>Complex header</div>
                        <div #kbqTitleText>{{ longValue }}</div>
                    </div>
                </button>
                <button kbq-dropdown-item kbq-title>
                    <div #kbqTitleContainer>
                        <div>Complex header</div>
                        <div #kbqTitleText>{{ defaultValue }}</div>
                    </div>
                </button>
            </kbq-dropdown>

            <button [kbqDropdownTriggerFor]="appDropdownWithNested" kbq-button>
                nested dropdown
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>

            <kbq-dropdown #appDropdownWithNested="kbqDropdown">
                <button [kbqDropdownTriggerFor]="appDropdownNested" kbq-dropdown-item>1 level (1)</button>
                <button kbq-dropdown-item>1 level (2)</button>
                <button kbq-dropdown-item>1 level (3)</button>
            </kbq-dropdown>

            <kbq-dropdown #appDropdownNested="kbqDropdown">
                <button [kbqDropdownTriggerFor]="appDropdownNestedNested" kbq-dropdown-item kbq-title>
                    {{ longValue }}
                </button>
                <button kbq-dropdown-item>2 level (2)</button>
                <button kbq-dropdown-item>2 level (3)</button>
            </kbq-dropdown>

            <kbq-dropdown #appDropdownNestedNested="kbqDropdown">
                <button kbq-dropdown-item>3 level (1)</button>
                <button kbq-dropdown-item>3 level (2)</button>
                <button kbq-dropdown-item>3 level (3)</button>
            </kbq-dropdown>
        </div>
    `
})
export class TitleOverviewExample implements OnInit {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
    field = this.defaultValue;
    singleSelected: string = '';
    filteredOptions: Observable<string[]>;

    formControl = new UntypedFormControl('', Validators.required);

    ngOnInit(): void {
        this.filteredOptions = this.formControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filter(value))
        );
    }

    onSelectionChange($event: KbqAutocompleteSelectedEvent) {
        console.log(`onSelectionChange: ${$event}`);
    }

    onAddText() {
        this.field = `${this.field} and a long text and a long text and a long text`;
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
