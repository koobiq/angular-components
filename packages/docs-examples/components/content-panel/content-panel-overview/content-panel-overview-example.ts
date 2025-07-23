import { afterNextRender, ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { SidebarPositions } from '@koobiq/components/sidebar';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqTabsModule } from '@koobiq/components/tabs';

type ExampleTableItem = {
    threat: string;
    description: string;
    protectionMeasures: string;
    selected: boolean;
};

@Component({
    standalone: true,
    imports: [KbqTableModule, KbqCheckboxModule, FormsModule],
    selector: 'example-table',
    host: {
        class: 'kbq-scrollbar'
    },
    template: `
        <table kbq-table>
            <thead>
                <tr>
                    <th></th>
                    <th [style.width.px]="100">Threat</th>
                    <th>Description</th>
                    <th>Protection measures</th>
                </tr>
            </thead>
            <tbody>
                @for (item of data; track $index) {
                    <tr (click)="rowClicked.emit(item)">
                        <td><kbq-checkbox [(ngModel)]="item.selected" (ngModelChange)="change()" /></td>
                        <td>{{ item.threat }}</td>
                        <td>{{ item.description }}</td>
                        <td>{{ item.protectionMeasures }}</td>
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        :host {
            display: block;
            overflow: scroll;
            width: 100%;
            height: 100%;
        }

        table {
            width: 1000px;
            height: 500px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleTable {
    protected readonly data: ExampleTableItem[] = Array.from({ length: 4 })
        .map((_, index) => [
            {
                threat: 'DDoS attacks',
                description: 'Overloading the system with requests to make it unavailable',
                protectionMeasures: 'Using protective systems (e.g., CDN), traffic monitoring',
                selected: index === 0
            },
            {
                threat: 'Brute force attacks',
                description: 'Password guessing to gain access to systems',
                protectionMeasures: 'Using complex passwords and two-factor authentication',
                selected: index === 0
            },
            {
                threat: 'Fake Wi-Fi networks',
                description: 'Creating fake access points to intercept data',
                protectionMeasures: 'Using VPN, disabling automatic Wi-Fi connections',
                selected: index === 0
            },
            {
                threat: 'Supply chain attacks',
                description: 'Injecting malicious code through third-party components',
                protectionMeasures: 'Verifying third-party suppliers, using trusted sources',
                selected: false
            }
        ])
        .flat();

    readonly selectedItems = output<ExampleTableItem[]>();
    readonly rowClicked = output<ExampleTableItem>();

    constructor() {
        afterNextRender(() => this.change());
    }

    protected change(): void {
        this.selectedItems.emit(this.data.filter(({ selected }) => selected));
    }
}

/**
 * @title Content Panel overview
 */
@Component({
    standalone: true,
    imports: [
        KbqButtonModule,
        KbqBadgeModule,
        KbqLinkModule,
        KbqIconModule,
        KbqContentPanelModule,
        KbqTabsModule,
        ExampleTable
    ],
    selector: 'content-panel-overview-example',
    template: `
        <kbq-content-panel-container #contentPanelContainer="kbqContentPanelContainer">
            <example-table (rowClicked)="contentPanelContainer.toggle()" />
            <kbq-content-panel>
                <nav [tabNavPanel]="tabNavPanel" kbqContentPanelAside kbqTabNavBar vertical>
                    @for (item of asideTabs; track $index) {
                        <a kbqTabLink>
                            <i kbq-icon="kbq-bug_16"></i>
                        </a>
                    }
                </nav>
                <kbq-content-panel-header>
                    <div class="example-content-header-title" kbqContentPanelHeaderTitle>
                        <span>CVE-2017-112</span>
                        <kbq-badge [badgeColor]="badgeColors.FadeError">8,6</kbq-badge>
                        <a kbq-link pseudo>July 21, 2025 2:29 PM</a>
                    </div>
                    <div class="example-content-header-actions" kbqContentPanelHeaderActions>
                        @for (action of headerActions; track $index) {
                            <button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent" kbq-button>
                                <i kbq-icon="kbq-link_16"></i>
                            </button>
                        }
                    </div>
                    <div class="example-content-header-caption">Caption</div>
                </kbq-content-panel-header>
                <div #tabNavPanel="kbqTabNavPanel" kbqTabNavPanel kbqContentPanelBody>
                    @for (paragraph of bodyParagraphs; track $index) {
                        <p>{{ paragraph }}</p>
                    }
                </div>
                <div class="example-content-panel-footer" kbqContentPanelFooter>
                    @for (action of footerActions; track $index) {
                        <button
                            [color]="$index > 0 ? componentColors.ContrastFade : componentColors.Contrast"
                            kbq-button
                        >
                            Button {{ $index }}
                        </button>
                    }
                </div>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `,
    styles: `
        :host {
            display: flex;
            height: 500px;
        }

        .example-content-header-caption {
            color: var(--kbq-foreground-contrast-secondary);
            margin-top: var(--kbq-size-xxs);
        }

        .example-content-header-title {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-s);
        }

        .example-content-header-title > span,
        .example-content-header-title > a {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .example-content-panel-footer {
            gap: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelOverviewExample {
    protected readonly position = SidebarPositions;
    protected readonly componentColors = KbqComponentColors;
    protected readonly buttonStyles = KbqButtonStyles;
    protected readonly badgeColors = KbqBadgeColors;

    protected readonly asideTabs = Array.from({ length: 4 });
    protected readonly headerActions = Array.from({ length: 2 });
    protected readonly footerActions = Array.from({ length: 3 });
    protected readonly bodyParagraphs = Array.from(
        { length: 10 },
        () =>
            'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.'
    );
}
