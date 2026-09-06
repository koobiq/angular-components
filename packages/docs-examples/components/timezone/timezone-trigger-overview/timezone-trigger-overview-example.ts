import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
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
 * @title Timezone trigger
 */
@Component({
    selector: 'timezone-trigger-overview-example',
    imports: [KbqTimezoneModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [(value)]="selected">
                <kbq-timezone-select-trigger>
                    <div class="layout-row layout-align-start-center">
                        <i color="contrast-fade" kbq-icon="kbq-clock_16" style="margin-right: 8px"></i>
                        <span>{{ selected }}</span>
                    </div>
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
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

        this.data = promoteCountry(getZonesGroupedByCountry(zones), kbqResolveHostCountry(zones));
    }
}
