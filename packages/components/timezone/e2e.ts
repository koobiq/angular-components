import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { AbstractControl, FormGroupDirective, FormsModule, NgForm } from '@angular/forms';
import {
    ErrorStateMatcher,
    kbqDisableLegacyValidationDirectiveProvider,
    KbqOptgroup,
    KbqSelectSearch
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    getZonesGroupedByCountry,
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneZone
} from '@koobiq/components/timezone';
import { timezones } from '../../docs-examples/components/timezone/mock';

class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(_control: AbstractControl | null, _form: FormGroupDirective | NgForm | null): boolean {
        return true;
    }
}

@Component({
    selector: 'e2e-timezone-states',
    imports: [
        KbqFormFieldModule,
        KbqInputModule,
        KbqOptgroup,
        KbqTimezoneModule,
        FormsModule,
        KbqSelectSearch,
        KbqIcon
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select
                data-testid="e2eTimezoneSelectWithSearch"
                [searchMinOptionsThreshold]="undefined"
                [(value)]="selected"
            >
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input
                        autocomplete="off"
                        kbqInput
                        type="text"
                        [placeholder]="'Город или часовой пояс'"
                        [(ngModel)]="control"
                    />
                    <kbq-cleaner #kbqSelectCleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Ничего не найдено</div>

                @for (group of data; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        @for (timezone of group.zones; track timezone) {
                            <kbq-timezone-option [timezone]="timezone" />
                        }
                    </kbq-optgroup>
                }

                <kbq-cleaner />
            </kbq-timezone-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-timezone-select [placeholder]="'Empty timezone'" />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-timezone-select [disabled]="true" [(value)]="selected">
                @for (group of data; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        @for (timezone of group.zones; track timezone) {
                            <kbq-timezone-option [timezone]="timezone" />
                        }
                    </kbq-optgroup>
                }
            </kbq-timezone-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-timezone-select [errorStateMatcher]="errorStateMatcher()" [(ngModel)]="selected">
                @for (group of data; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        @for (timezone of group.zones; track timezone) {
                            <kbq-timezone-option [timezone]="timezone" />
                        }
                    </kbq-optgroup>
                }
            </kbq-timezone-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-timezone-select data-testid="e2eTimezoneSelect" [panelClass]="'custom-select-panel'">
                @for (group of data; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        <kbq-timezone-option [timezone]="group.zones[0]" />

                        <kbq-timezone-option class="kbq-hovered" [timezone]="group.zones[1]" />

                        <kbq-timezone-option class="kbq-active" [timezone]="group.zones[2]" />

                        <kbq-timezone-option class="kbq-selected" [timezone]="group.zones[3]" />

                        <kbq-timezone-option [disabled]="true" [timezone]="group.zones[4]" />

                        <kbq-timezone-option class="kbq-hovered kbq-selected" [timezone]="group.zones[5]" />

                        <kbq-timezone-option class="kbq-active kbq-selected" [timezone]="group.zones[6]" />
                    </kbq-optgroup>
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xxs);
            padding: var(--kbq-size-xxs);
            width: 300px;
            height: 500px;
        }

        ::ng-deep .custom-select-panel.kbq-select__panel .kbq-select__content {
            --kbq-select-panel-size-max-height: 308px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTimezoneStates'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ]
})
export class E2eTimezoneStates {
    control = model('');
    selected = 'Europe/Kaliningrad';

    data: KbqTimezoneGroup[];

    constructor() {
        const zones: KbqTimezoneZone[] = timezones.map(({ associatedZones, ...zone }) => ({
            ...zone,
            cities: Array.isArray(associatedZones)
                ? associatedZones
                      .map(({ city }) => city)
                      .sort()
                      .join(', ')
                : ''
        }));

        this.data = getZonesGroupedByCountry(zones, 'Другие страны');
    }

    errorStateMatcher() {
        return new CustomErrorStateMatcher();
    }
}
