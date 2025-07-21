import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    TemplateRef,
    ViewChild,
    viewChild
} from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import {
    IcContentPanelGhostDirective,
    IcContentPanelModule,
    IcContentPanelService
} from 'packages/components-dev/content-panel/content-panel';

const DUMMY_BTNS_ARRAY_LENGTH = 122;

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
        IcContentPanelModule,
        IcContentPanelGhostDirective,
        KbqContentPanelModule,
        KbqTabsModule
    ],
    providers: [IcContentPanelService],
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
            <kbq-content-panel-header [hasCloseButton]="hasCloseButton">
                <div kbqContentPanelHeaderTitle>
                    <div>
                        CVE-2017-112 CVE-2017-112 CVE-2017-112 CVE-2017-112 CVE-2017-112 CVE-2017-112 CVE-2017-112
                        CVE-2017-112 CVE-2017-112 CVE-2017-112 CVE-2017-112
                    </div>
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
            @if (hasFooter) {
                <kbq-content-panel-footer>
                    <div class="footer__btns">
                        <button [color]="componentColors.Contrast" kbq-button>Кнопка</button>
                        <button kbq-button>Кнопка</button>
                    </div>
                    <div class="footer__btns">
                        <button kbq-button>Кнопка</button>
                    </div>
                </kbq-content-panel-footer>
            }
        </kbq-content-panel>
    `,
    styles: `
        .kbq-content-panel {
            max-height: 500px;
        }

        .example-content-header-caption {
            color: var(--kbq-foreground-contrast-secondary);
            margin-top: var(--kbq-size-xxs);
        }

        .example-content-header-actions {
            max-width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelOverviewExample {
    protected readonly componentColors = KbqComponentColors;
    protected readonly buttonStyles = KbqButtonStyles;
    protected readonly badgeColors = KbqBadgeColors;

    protected readonly asideTabs = Array.from({ length: 4 });
    protected readonly headerActions = Array.from({ length: 5 });
    protected readonly bodyParagraphs = Array.from(
        { length: 10 },
        () =>
            'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network. Denial of service is typically accomplished by flooding the targeted machine or resource with superfluous requests in an attempt to overload systems and prevent some or all legitimate requests from being fulfilled. The range of attacks varies widely, spanning from inundating a server with millions of requests to slow its performance, overwhelming a server with a substantial amount of invalid data, to submitting requests with an illegitimate IP address.'
    );

    private readonly contentPanel = inject(IcContentPanelService);
    private readonly sidepanel = inject(KbqSidepanelService);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly contentPanelTemplateRef = viewChild.required('contentPanel', { read: TemplateRef });

    protected readonly dummyBtnsArray = new Array(DUMMY_BTNS_ARRAY_LENGTH);

    @ViewChild(IcContentPanelGhostDirective, { read: ElementRef })
    contentPanelGhost?: ElementRef<HTMLElement>;

    @Input()
    hasCloseButton = true;

    @Input()
    hasFooter = true;

    constructor() {
        afterNextRender(() => this.openContentPanel());
    }

    openContentPanel(): void {
        this.contentPanel.open(this.contentPanelTemplateRef(), {
            ghostElement: this.contentPanelGhost?.nativeElement
        });
    }

    openSidePanel(): void {
        // this.elementRef.nativeElement.style.display = 'block';
        // this.elementRef.nativeElement.style.backgroundColor = 'cyan';
        // this.elementRef.nativeElement.style.position = 'relative';
        this.sidepanel.open(this.contentPanelTemplateRef());
    }
}
