import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

/**
 * @title Autocomplete
 */
@Component({
    standalone: true,
    selector: 'autocomplete-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqAutocompleteModule,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    template: `
        <label>Enter countries to see autocomplete</label>
        <kbq-form-field>
            <input [formControl]="control" [kbqAutocomplete]="auto" kbqInput type="text" />

            <kbq-autocomplete #auto="kbqAutocomplete">
                @for (option of filteredOptions | async; track option) {
                    <kbq-option [value]="option">
                        {{ option }}
                    </kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `
})
export class AutocompleteOverviewExample implements OnInit {
    options = [
        'Abkhazia',
        'Australia',
        'Austria',
        'Azerbaijan',
        'Aland Islands',
        'Albania',
        'Algeria',
        'Anguilla',
        'Angola',
        'Andorra',
        'Argentina',
        'Armenia',
        'Aruba',
        'Afghanistan',
        'Bahamas',
        'Bangladesh',
        'Barbados',
        'Bahrain',
        'Belarus',
        'Belize',
        'Belgium',
        'Benin',
        'Bulgaria',
        'Bolivia',
        'Bosnia & Herzegovina',
        'Botswana',
        'Brazil',
        'Brunei Darussalam',
        'Burundi',
        'Bhutan',
        'Vatican City',
        'United Kingdom',
        'Hungary',
        'Venezuela',
        'Timor',
        'Viet Nam',
        'Gabon',
        'Haiti',
        'Gambia',
        'Ghana',
        'Guadeloupe',
        'Guatemala',
        'Guinea',
        'Guinea-Bissau',
        'Germany',
        'Gibraltar',
        'Hong Kong',
        'Honduras',
        'Grenada',
        'Greenland',
        'Greece',
        'Georgia',
        'Guam',
        'Denmark',
        'Dominica',
        'Dominican Republic',
        'Egypt',
        'Zambia',
        'Western Sahara',
        'Zimbabwe',
        'Israel',
        'India',
        'Indonesia',
        'Jordan',
        'Iraq',
        'Iran',
        'Ireland',
        'Iceland',
        'Spain',
        'Italy',
        'Yemen',
        'Kazakhstan',
        'Cambodia',
        'Cameroon',
        'Canada',
        'Qatar',
        'Kenya',
        'Cyprus',
        'Kyrgyzstan',
        'Kiribati',
        'China',
        'Colombia',
        'Korea, D.P.R.',
        'Korea',
        'Costa Rica',
        "Cote d'Ivoire",
        'Cuba',
        'Kuwait',
        'Lao P.D.R.',
        'Latvia',
        'Lesotho',
        'Liberia',
        'Lebanon',
        'Libyan Arab Jamahiriya',
        'Lithuania',
        'Liechtenstein',
        'Luxembourg',
        'Mauritius',
        'Mauritania',
        'Madagascar',
        'Macedonia',
        'Malawi',
        'Malaysia',
        'Mali',
        'Maldives',
        'Malta',
        'Morocco',
        'Mexico',
        'Mozambique',
        'Moldova',
        'Monaco',
        'Mongolia',
        'Namibia',
        'Nepal',
        'Niger',
        'Nigeria',
        'Netherlands',
        'Nicaragua',
        'New Zealand',
        'Norway',
        'United Arab Emirates',
        'Oman',
        'Pakistan',
        'Panama',
        'Paraguay',
        'Peru',
        'Poland',
        'Portugal',
        'Russia',
        'Romania',
        'San Marino',
        'Saudi Arabia',
        'Senegal',
        'Serbia',
        'Singapore',
        'Syrian Arab Republic',
        'Slovakia',
        'Slovenia',
        'Somalia',
        'Sudan',
        'USA',
        'Tajikistan',
        'Thailand',
        'Tanzania',
        'Togo',
        'Tunisia',
        'Turkmenistan',
        'Turkey',
        'Uganda',
        'Uzbekistan',
        'Ukraine',
        'Uruguay',
        'Micronesia',
        'Fiji',
        'Philippines',
        'Finland',
        'France',
        'Croatia',
        'Chad',
        'Montenegro',
        'Czech Republic',
        'Chile',
        'Switzerland',
        'Sweden',
        'Sri Lanka',
        'Ecuador',
        'Eritrea',
        'Estonia',
        'Ethiopia',
        'South Africa',
        'Jamaica',
        'Japan'
    ];

    control = new FormControl('');
    filteredOptions: Observable<string[]>;

    ngOnInit(): void {
        this.filteredOptions = this.control.valueChanges.pipe(
            startWith(''),
            map((value) => this.filter(value as string))
        );
    }

    private filter(value: string): string[] {
        const filterValue = value.toLowerCase();

        return this.options.filter((option) => option.toLowerCase().includes(filterValue));
    }
}
