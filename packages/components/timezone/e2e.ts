import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqOptgroup } from '@koobiq/components/core';
import { KbqFormField } from '@koobiq/components/form-field';
import { timezones } from '../../docs-examples/components/timezone/mock';
import { KbqTimezoneOption } from './timezone-option.component';
import { KbqTimezoneOptionTooltip } from './timezone-option.directive';
import { KbqTimezoneSelect } from './timezone-select.component';
import { KbqTimezoneGroup, KbqTimezoneZone } from './timezone.models';
import { getZonesGroupedByCountry } from './timezone.utils';

@Component({
    selector: 'e2e-timezone-states',
    imports: [
        KbqFormField,
        KbqOptgroup,
        KbqTimezoneOption,
        KbqTimezoneOptionTooltip,
        KbqTimezoneSelect
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [(value)]="selected">
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
            display: block;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xxs);
            width: 300px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTimezoneStates'
    }
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
}
