import { Component } from '@angular/core';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import {
    getZonesGroupedByCountry,
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneZone
} from '@koobiq/components/timezone';
import { timezones } from '../mock';

/**
 * @title Timezone
 */
@Component({
    standalone: true,
    selector: 'timezone-overview-example',
    imports: [KbqFormFieldModule, KbqTimezoneModule, KbqOptionModule],
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
    `
})
export class TimezoneOverviewExample {
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
