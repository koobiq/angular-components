import { Component, ViewEncapsulation } from '@angular/core';
import { KbqTimezoneGroup, KbqTimezoneZone, getZonesGroupedByCountry } from '@koobiq/components/timezone';
import { timezones } from '../mock';

/**
 * @title Timezone trigger overview
 */
@Component({
    selector: 'timezone-trigger-overview-example',
    templateUrl: 'timezone-trigger-overview-example.html',
    styleUrls: ['timezone-trigger-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class TimezoneTriggerOverviewExample {
    selected = Intl.DateTimeFormat().resolvedOptions().timeZone;

    readonly data: KbqTimezoneGroup[] = [];

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
