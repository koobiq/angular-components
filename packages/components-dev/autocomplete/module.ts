import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'dev-app',
    imports: [
        FormsModule,
        KbqAutocompleteModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqIconModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp implements OnInit {
    options = [
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

    filteredOptions: Observable<string[]>;

    formControl = new UntypedFormControl('', Validators.required);

    onSelectionChange($event: KbqAutocompleteSelectedEvent) {
        console.log(`onSelectionChange: ${$event}`);
    }

    ngOnInit(): void {
        this.filteredOptions = this.formControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filter(value))
        );
    }

    private filter(value: string): string[] {
        const filterValue = value ? value.toLowerCase() : '';

        return this.options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
