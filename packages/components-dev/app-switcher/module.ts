import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAppSwitcherModule } from '@koobiq/components/app-switcher';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { PopoverExamplesModule } from 'packages/docs-examples/components/popover';

@Component({
    standalone: true,
    imports: [PopoverExamplesModule, KbqButtonModule, KbqIcon, KbqAppSwitcherModule],
    selector: 'dev-examples',
    template: `
        <button kbq-button kbqAppSwitcher [search]="true" [sites]="sites">
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DevExamples {
    sites = [
        {
            name: 'ЦФО',
            apps: [
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name'
                },
                {
                    name: 'Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption'
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    apps: [
                        {
                            name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name'
                        },
                        {
                            name: 'Name',
                            caption:
                                'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption'
                        },
                        {
                            name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                            caption:
                                'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption'
                        }
                    ]
                },
                {
                    name: 'Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    apps: [
                        {
                            name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name'
                        },
                        {
                            name: 'Name',
                            caption:
                                'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption'
                        },
                        {
                            name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                            caption:
                                'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption'
                        }
                    ]
                },
                {
                    name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                    caption:
                        'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption',
                    apps: [
                        {
                            name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name'
                        },
                        {
                            name: 'Name',
                            caption:
                                'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption'
                        },
                        {
                            name: 'Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name Name',
                            caption:
                                'Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption Caption'
                        }
                    ]
                }
            ]
        },
        {
            name: 'СЗФО',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001',
                    icon: ''
                },
                {
                    name: 'CryptoWall',
                    apps: [
                        {
                            name: 'App Instance 1',
                            caption: 'Instance Alias One'
                        },
                        {
                            name: 'App Instance 2'
                        },
                        {
                            name: 'App Instance 3',
                            caption: 'Instance Alias Three'
                        },
                        {
                            name: 'App Instance 4',
                            caption: 'Instance Alias Four'
                        }
                    ]
                },
                {
                    name: 'Phantom Gate'
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals'
                },
                {
                    name: 'Zero Trace'
                }
            ]
        },
        {
            name: 'ЮФО',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001'
                },
                {
                    name: 'CryptoWall'
                },
                {
                    name: 'Phantom Gate'
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals'
                },
                {
                    name: 'Zero Trace'
                }
            ]
        },
        {
            name: 'Южный Суверенный Федеральный Округ ФО',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001'
                },
                {
                    name: 'CryptoWall',
                    apps: [
                        {
                            name: 'App Instance 1',
                            caption: 'Instance Alias One'
                        },
                        {
                            name: 'App Instance 2'
                        },
                        {
                            name: 'App Instance 3',
                            caption: 'Instance Alias Three'
                        },
                        {
                            name: 'App Instance 4',
                            caption: 'Instance Alias Four'
                        }
                    ]
                },
                {
                    name: 'Phantom Gate'
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals'
                },
                {
                    name: 'Zero Trace'
                }
            ],
            main: true
        },
        {
            name: 'ПФО',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001'
                },
                {
                    name: 'CryptoWall'
                },
                {
                    name: 'Phantom Gate'
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals'
                },
                {
                    name: 'Zero Trace'
                }
            ]
        },
        {
            name: 'УФО',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001'
                },
                {
                    name: 'CryptoWall',
                    apps: [
                        {
                            name: 'App Instance 1',
                            caption: 'Instance Alias One'
                        },
                        {
                            name: 'App Instance 2'
                        },
                        {
                            name: 'App Instance 3',
                            caption: 'Instance Alias Three'
                        },
                        {
                            name: 'App Instance 4',
                            caption: 'Instance Alias Four'
                        }
                    ]
                },
                {
                    name: 'Phantom Gate'
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals'
                },
                {
                    name: 'Zero Trace'
                }
            ]
        },
        {
            name: 'СФО',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001'
                },
                {
                    name: 'CryptoWall'
                },
                {
                    name: 'Phantom Gate'
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals'
                },
                {
                    name: 'Zero Trace'
                }
            ]
        },
        {
            name: 'ДФО',
            apps: [
                {
                    name: 'Byte Sentinel',
                    caption: 'Byte 001'
                },
                {
                    name: 'CryptoWall',
                    apps: [
                        {
                            name: 'App Instance 1',
                            caption: 'Instance Alias One'
                        },
                        {
                            name: 'App Instance 2'
                        },
                        {
                            name: 'App Instance 3',
                            caption: 'Instance Alias Three'
                        },
                        {
                            name: 'App Instance 4',
                            caption: 'Instance Alias Four'
                        }
                    ]
                },
                {
                    name: 'Phantom Gate'
                },
                {
                    name: 'SentraLock',
                    caption: 'Lock-sentral-urals'
                },
                {
                    name: 'Zero Trace'
                }
            ]
        }
    ];
}

@Component({
    standalone: true,
    selector: 'dev-app',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html',
    imports: [
        A11yModule,
        FormsModule,
        DevExamples,
        KbqAppSwitcherModule,
        KbqDropdownModule,
        KbqDividerModule,
        KbqBadgeModule,
        KbqOptionModule
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    componentColors = KbqComponentColors;

    modelValue: any = '';

    activeSite;
    activeApp;
}
