import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { KbaAppSwitcherSite, KbqAppSwitcherTrigger } from '@koobiq/components/app-switcher';
import { KbqAutocompleteModule } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title app-switcher
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'app-switcher-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqAutocompleteModule,
        KbqInputModule,
        ReactiveFormsModule,
        KbqFormsModule,
        KbqAppSwitcherTrigger,
        KbqButtonModule,
        KbqIcon
    ],
    template: `
        <button kbq-button kbqAppSwitcher [sites]="sites" [selectedSite]="sites[0]">
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `
})
export class AppSwitcherOverviewExample {
    sites: KbaAppSwitcherSite[] = [
        {
            name: 'СЗФО',
            id: '02',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    id: 'SZFO_01',
                    icon: '',
                    type: ''
                },
                {
                    name: 'CryptoWall',
                    id: 'SZFO_02',
                    type: ''
                },
                {
                    name: 'App Instance 1',
                    caption: 'Instance Alias One',
                    id: 'SZFO_03',
                    type: ''
                },
                {
                    name: 'App Instance 2',
                    id: 'SZFO_04',
                    type: ''
                },
                {
                    name: 'App Instance 3',
                    caption: 'Instance Alias Three',
                    id: 'SZFO_05',
                    type: ''
                },
                {
                    name: 'App Instance 4',
                    caption: 'Instance Alias Four',
                    id: 'SZFO_06',
                    type: ''
                },
                {
                    name: 'Phantom Gate',
                    id: 'SZFO_07',
                    type: ''
                },
                {
                    name: 'SentraLock',
                    id: 'SZFO_08',
                    caption: 'Lock-sentral-urals',
                    type: ''
                },
                {
                    name: 'Zero Trace',
                    id: 'SZFO_09',
                    type: ''
                }
            ]
        }
    ];
}
