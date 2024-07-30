import { Component, ViewEncapsulation } from '@angular/core';
import { KbqTimezoneGroup, KbqTimezoneZone, getZonesGroupedByCountry } from '@koobiq/components/timezone';
import { timezones } from '../mock';

/**
 * @title Timezone overview
 */
@Component({
    selector: 'timezone-overview-example',
    templateUrl: 'timezone-overview-example.html',
    styleUrls: ['timezone-overview-example.css'],
    encapsulation: ViewEncapsulation.None
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
