import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormGroupDirective, FormsModule, NgForm } from '@angular/forms';
import { ErrorStateMatcher, kbqDisableLegacyValidationDirectiveProvider, KbqOptgroup } from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { timezones } from '../../docs-examples/components/timezone/mock';
import { KbqTimezoneOption } from './timezone-option.component';
import { KbqTimezoneOptionTooltip } from './timezone-option.directive';
import { KbqTimezoneSelect } from './timezone-select.component';
import { KbqTimezoneGroup, KbqTimezoneZone } from './timezone.models';
import { getZonesGroupedByCountry } from './timezone.utils';

class CustomErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(_control: AbstractControl | null, _form: FormGroupDirective | NgForm | null): boolean {
        return true;
    }
}

@Component({
    selector: 'e2e-timezone-states',
    imports: [
        KbqFormField,
        KbqOptgroup,
        KbqTimezoneOption,
        KbqTimezoneOptionTooltip,
        KbqTimezoneSelect,
        FormsModule
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select data-testid="e2eTimezoneSelect" [(value)]="selected">
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
            <kbq-timezone-select [placeholder]="'Empty timezone'" />
        </kbq-form-field>

        <kbq-form-field class="cdk-focused cdk-keyboard-focused">
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

        <kbq-form-field class="cdk-focused cdk-keyboard-focused">
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
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xxs);
            padding: var(--kbq-size-xxs);
            width: 300px;
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
    selected = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
