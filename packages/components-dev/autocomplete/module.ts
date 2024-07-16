// tslint:disable:no-console
import { Component, NgModule, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqAutocompleteModule, KbqAutocompleteSelectedEvent } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {
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
        const filterValue = value.toLowerCase();

        return this.options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        KbqAutocompleteModule,
        KbqInputModule,
        KbqButtonModule,
        KbqFormFieldModule,
        KbqIconModule,
        ReactiveFormsModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
