import { Component } from '@angular/core';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    getZonesGroupedByCountry,
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneZone
} from '@koobiq/components/timezone';
import { timezones } from '../mock';

/**
 * @title Timezone trigger
 */
@Component({
    standalone: true,
    selector: 'timezone-trigger-overview-example',
    imports: [KbqFormFieldModule, KbqTimezoneModule, KbqOptionModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [(value)]="selected">
                <kbq-timezone-select-trigger>
                    <i
                        kbq-icon="kbq-clock_16"
                        style="margin-right: 8px"
                    ></i>
                    <span>{{ selected }}</span>
                </kbq-timezone-select-trigger>

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
