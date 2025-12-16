import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { TitleExamplesModule } from '../../docs-examples/components/title';

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

@Component({
    selector: 'dev-examples',
    imports: [TitleExamplesModule],
    template: `
        <title-overview-example />
        <br />
        <br />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
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
        AsyncPipe,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp implements OnInit {
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
        const filterValue = value ? value.toLowerCase() : '';

        return options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
