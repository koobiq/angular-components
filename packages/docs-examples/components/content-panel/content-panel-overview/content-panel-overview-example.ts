import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTabsModule } from '@koobiq/components/tabs';

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
        KbqTabsModule
    ],
    selector: 'content-panel-overview-example',
    template: `
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
                    <button [color]="$index > 0 ? componentColors.ContrastFade : componentColors.Contrast" kbq-button>
                        Button {{ $index }}
                    </button>
                }
            </div>
        </kbq-content-panel>
    `,
    styles: `
        :host {
            display: block;
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
