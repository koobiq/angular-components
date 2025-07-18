import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    Input,
    TemplateRef,
    viewChild,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { DevThemeToggle } from '../theme-toggle';
import { IcContentPanelGhostDirective, IcContentPanelModule, IcContentPanelService } from './content-panel';

const DUMMY_BTNS_ARRAY_LENGTH = 122;

@Component({
    standalone: true,
    imports: [
        KbqButtonModule,
        KbqBadgeModule,
        KbqLinkModule,
        KbqIconModule,
        IcContentPanelModule,
        IcContentPanelGhostDirective,
        KbqContentPanelModule
    ],
    selector: 'ic-content-panel-wrapper',
    template: `
        <div>
            <button (click)="openContentPanel()" kbq-button>content panel</button>
            <button (click)="openSidePanel()" kbq-button>side panel</button>
            <hr />
            <div class="page-content">
                <div class="content__buttons">
                    @for (dummyBtn of dummyBtnsArray; track $index) {
                        <button kbq-button>Заглушка</button>
                    }
                </div>

                <ic-content-panel-ghost />
            </div>
        </div>

        <ng-template #contentPanel let-data>
            <kbq-content-panel [data]="data || {}">
                <div kbqContentPanelToolbar>
                    <button kbq-button>
                        <i kbq-icon="kbq-bug_16"></i>
                    </button>
                    <button kbq-button>
                        <i kbq-icon="kbq-bug_16"></i>
                    </button>
                    <button kbq-button>
                        <i kbq-icon="kbq-bug_16"></i>
                    </button>
                </div>
                <kbq-content-panel-header [hasCloseButton]="hasCloseButton">
                    <div class="header__content">
                        <div class="content__top">
                            <div class="top__info">
                                <ic-content-panel-title>Title Title</ic-content-panel-title>
                                <kbq-badge [badgeColor]="KbqBadgeColors.FadeError">
                                    <span>8,6</span>
                                </kbq-badge>
                                <a class="top__info-date" kbq-link pseudo>31 янв, 12:25</a>
                            </div>
                            <div class="top__actions">
                                <button
                                    [color]="KbqComponentColors.Contrast"
                                    [kbqStyle]="KbqButtonStyles.Transparent"
                                    kbq-button
                                >
                                    <i kbq-icon="kbq-link_16"></i>
                                </button>
                                <button
                                    [color]="KbqComponentColors.Contrast"
                                    [kbqStyle]="KbqButtonStyles.Transparent"
                                    kbq-button
                                >
                                    <i kbq-icon="kbq-arrows-expand-diagonal_16"></i>
                                </button>
                                <button
                                    [color]="KbqComponentColors.Contrast"
                                    [kbqStyle]="KbqButtonStyles.Transparent"
                                    kbq-button
                                >
                                    <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                                </button>
                            </div>
                        </div>
                        <div class="content__bottom">
                            <button kbq-button>Заглушка</button>
                            <button kbq-button>Заглушка</button>
                            <button kbq-button>Заглушка</button>
                        </div>
                    </div>
                </kbq-content-panel-header>
                <div kbqContentPanelBody>
                    <div class="body__content">
                        <span class="kbq-subheading">That's Title!</span>
                        <span>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque id tortor blandit, maximus
                            massa ac, porttitor erat. Quisque eget ante ac mi iaculis cursus. Donec et purus sapien.
                            Maecenas eu mauris lectus. Etiam elementum nulla a mi aliquet, id posuere mi faucibus. Fusce
                            condimentum mi at congue laoreet. Maecenas laoreet condimentum odio lacinia porta. Duis
                            pharetra pretium dapibus. Fusce condimentum vestibulum semper. Integer pharetra est a purus
                            mattis, vel convallis magna dictum. Nulla a nulla at ligula cursus dignissim. Quisque
                            placerat sapien ut sagittis rutrum. Praesent eu tortor sodales dolor sagittis commodo. Cras
                            et felis ut magna blandit varius nec lacinia metus. Aenean id dolor vel risus dapibus
                            pharetra in vestibulum diam. Sed elementum ante quis lacus fermentum, vel rhoncus turpis
                            mollis. Etiam eget cursus dui. Praesent placerat laoreet varius. Sed efficitur, ligula nec
                            vulputate posuere, felis nisl elementum ipsum, sit amet aliquet urna elit vitae nibh. Nunc
                            risus leo, egestas et ligula at, porta egestas massa. Cras accumsan est ac diam vestibulum
                            tincidunt rutrum vitae eros. Nullam lacinia enim vitae purus pulvinar ultrices. Vestibulum
                            nec nunc et sapien molestie dignissim nec id justo. Aenean eget cursus eros. Donec mollis
                            enim nec nibh molestie, at ultrices eros lobortis. Sed auctor et elit in semper. Proin
                            accumsan lorem sit amet orci consectetur, nec ullamcorper turpis gravida. Vivamus tristique
                            lectus id sapien ultrices elementum. Curabitur libero nunc, auctor nec urna nec, viverra
                            facilisis urna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ullamcorper
                            placerat dignissim. Praesent egestas lectus ac erat varius, a pharetra arcu pharetra.
                            Phasellus imperdiet facilisis pretium. In vitae consequat neque. Integer tempus aliquet sem,
                            sit amet molestie ante lacinia et. Proin augue dolor, tincidunt ornare blandit at, lacinia
                            at erat. Aliquam erat volutpat. Integer lobortis urna blandit enim ultrices, at dictum
                            ligula bibendum. In quam orci, placerat et commodo ac, auctor a elit. Cras vel metus vitae
                            mi dictum ullamcorper. Integer ut ligula et erat semper eleifend a id felis. Mauris suscipit
                            magna turpis. Integer sit amet porta turpis. Suspendisse ornare ante ex, vitae sagittis
                            mauris semper at. Quisque sollicitudin ex quis aliquet cursus. Donec elementum efficitur
                            auctor. Pellentesque ultrices libero hendrerit eros ultrices rutrum non a leo. Integer
                            sapien leo, sagittis quis lorem eu, scelerisque aliquam metus. In hac habitasse platea
                            dictumst. Nulla tristique lorem mauris, eget mollis nulla porttitor sed. Donec congue ante
                            ligula, et placerat risus placerat non. Mauris aliquet sed metus ac faucibus. Quisque
                            aliquet, urna id pellentesque placerat, arcu urna scelerisque turpis, quis cursus quam lorem
                            suscipit ex. Curabitur vestibulum pulvinar lobortis. Pellentesque rutrum nibh lacus, in
                            efficitur dolor eleifend sit amet. In porttitor imperdiet justo, eu facilisis odio tristique
                            blandit.Quisque sollicitudin ex quis aliquet cursus. Donec elementum efficitur auctor.
                            Pellentesque ultrices libero hendrerit eros ultrices rutrum non a leo. Integer sapien leo,
                            sagittis quis lorem eu, scelerisque aliquam metus. In hac habitasse platea dictumst. Nulla
                            tristique lorem mauris, eget mollis nulla porttitor sed. Donec congue ante ligula, et
                            placerat risus placerat non. Mauris aliquet sed metus ac faucibus.
                        </span>
                    </div>
                </div>
                @if (hasFooter) {
                    <kbq-content-panel-footer>
                        <div class="footer__btns">
                            <button [color]="KbqComponentColors.Contrast" kbq-button>Кнопка</button>
                            <button kbq-button>Кнопка</button>
                        </div>
                        <div class="footer__btns">
                            <button kbq-button>Кнопка</button>
                        </div>
                    </kbq-content-panel-footer>
                }
            </kbq-content-panel>
        </ng-template>
    `,
    styles: `
        .page-content {
            display: flex;
            flex-direction: row;
            margin-top: var(--kbq-size-l);
        }

        .content__buttons {
            display: flex;
            flex-flow: row wrap;
            gap: var(--kbq-size-l);
            justify-content: flex-end;
            padding-right: var(--kbq-size-s);
        }

        .header__content {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            width: 100%;
            margin-right: var(--kbq-size-s);
        }

        .content__top {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
        }

        .top__info {
            display: flex;
            flex-direction: row;
            gap: var(--kbq-size-s);
            align-items: center;
        }

        .top__info-date {
            margin-left: var(--kbq-size-s);
        }

        .top__actions {
            display: flex;
            flex-direction: row;
            gap: var(--kbq-size-s);
            align-items: center;
        }

        .content__bottom {
            display: flex;
            flex-flow: row wrap;
            gap: var(--kbq-size-m);
        }

        .body__content {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
        }

        .footer__btns {
            display: flex;
            flex-direction: row;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [IcContentPanelService],
    encapsulation: ViewEncapsulation.None
})
export class ContentPanelWrapperComponent {
    private readonly contentPanel = inject(IcContentPanelService);
    private readonly sidepanel = inject(KbqSidepanelService);
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    readonly contentPanelTemplateRef = viewChild.required('contentPanel', { read: TemplateRef });

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly KbqBadgeColors = KbqBadgeColors;
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

@Component({
    standalone: true,
    imports: [ContentPanelWrapperComponent],
    selector: 'dev-examples',
    template: `
        <ic-content-panel-wrapper />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevExamples {}

@Component({
    selector: 'dev-app',
    standalone: true,
    imports: [
        DevExamples,
        DevThemeToggle
    ],
    providers: [],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
