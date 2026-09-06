import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    getZonesGroupedByCountry,
    kbqResolveHostCountry,
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneZone,
    promoteCountry
} from '@koobiq/components/timezone';
import { timezones } from '../timezone-data';

/**
 * @title Timezone
 */
@Component({
    selector: 'timezone-overview-example',
    imports: [KbqTimezoneModule],
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
    changeDetection: ChangeDetectionStrategy.OnPush
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

        // The grouping is pure, so the host's own country is resolved separately and passed in.
        this.data = promoteCountry(getZonesGroupedByCountry(zones), kbqResolveHostCountry(zones));
    }
}
