import { Component, NgModule, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import {
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneZone,
    getZonesGroupedByCountry,
    offsetFormatter
} from '@koobiq/components/timezone';
import { Observable, merge, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { timezones } from './mock';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent implements OnInit {
    filteredOptions$: Observable<KbqTimezoneGroup[]>;
    searchControl: FormControl = new FormControl();
    selected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    priorityCountry: string;

    get searchPattern(): string {
        const searchString: string = (this.searchControl.value || '').trim();

        const reRegExpChar: RegExp = /[\/\\^$.*+?()[\]{}|\s]/g;
        const reHasRegExpChar: RegExp = RegExp(reRegExpChar.source);

        const escapedString =
            searchString && reHasRegExpChar.test(searchString)
                ? searchString.replace(reRegExpChar, '\\$&')
                : searchString;

        return escapedString.replace(/[\-—−]/g, '(-|—|−)');
    }

    private readonly data: KbqTimezoneZone[];

    constructor() {
        this.data = timezones.map(({ associatedZones, ...zone }) => ({
            ...zone,
            cities: Array.isArray(associatedZones)
                ? associatedZones
                      .map(({ city }) => city)
                      .sort()
                      .join(', ')
                : ''
        }));

        this.priorityCountry = this.data.find(
            (item: KbqTimezoneZone) => item.id === Intl.DateTimeFormat().resolvedOptions().timeZone
        )?.countryCode as string;
    }

    ngOnInit(): void {
        this.filteredOptions$ = merge(
            of(getZonesGroupedByCountry(this.data, 'Другие страны')),
            this.searchControl.valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(500),
                map(() => {
                    if (!this.searchControl.value) {
                        return getZonesGroupedByCountry(this.data, 'Другие страны');
                    }

                    return this.getFilteredData();
                })
            )
        );
    }

    private getFilteredData(): KbqTimezoneGroup[] {
        const regex: RegExp = RegExp(`(${this.searchPattern})`, 'i');

        const options: KbqTimezoneZone[] = this.data.filter((timezone: KbqTimezoneZone) => {
            const fields: string[] = [
                offsetFormatter(timezone.offset),
                timezone.city,
                timezone.cities
            ];

            return regex.test(fields.join(' ')) || fields.some((timezoneValue: string) => regex.test(timezoneValue));
        });

        return getZonesGroupedByCountry(options, 'Другие страны', this.priorityCountry);
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        KbqTimezoneModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqInputModule,
        KbqIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
