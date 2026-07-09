import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { DocsLocale } from 'src/app/constants/locale';
import { DOCS_TRANSLATIONS } from 'src/app/services/i18n';
import { DocsStructureTokensTab } from '../../structure';
import { DocsComponentViewerComponent } from '../component-viewer/component-viewer.component';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';

@Component({
    selector: 'docs-component-viewer',
    imports: [
        KbqTabsModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        DocsRegisterHeaderDirective
    ],
    template: `
        <div class="docs-component-header">
            <div class="docs-component-name" docsRegisterHeader>
                {{ t('designTokens') }}
            </div>
            <div class="docs-component-navbar layout-padding-top-s">
                <nav kbqTabNavBar [tabNavPanel]="tabNavPanel">
                    @for (link of links; track link) {
                        <a kbqTabLink routerLinkActive="kbq-selected" [routerLink]="link.value">
                            {{ link.title[locale()] }}
                        </a>
                    }
                </nav>
            </div>
        </div>

        <div #tabNavPanel="kbqTabNavPanel" kbqTabNavPanel>
            <router-outlet />
        </div>
    `,
    styleUrls: ['../component-viewer/component-viewer.scss'],
    providers: [KbqSidepanelService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-component-viewer kbq-scrollbar',
        '[attr.data-docsearch-category]': 'structureItem.id'
    }
})
export class DocsDesignTokensViewer extends DocsComponentViewerComponent {
    constructor() {
        super();
    }

    readonly links: Array<{ title: Record<DocsLocale, string>; value: string }> = [
        { title: DOCS_TRANSLATIONS.tokensTabColors, value: DocsStructureTokensTab.Colors },
        { title: DOCS_TRANSLATIONS.tokensTabTypography, value: DocsStructureTokensTab.Typography },
        { title: DOCS_TRANSLATIONS.tokensTabShadows, value: DocsStructureTokensTab.Shadows },
        { title: DOCS_TRANSLATIONS.tokensTabBorderRadius, value: DocsStructureTokensTab.BorderRadius },
        { title: DOCS_TRANSLATIONS.tokensTabSizes, value: DocsStructureTokensTab.Sizes },
        { title: DOCS_TRANSLATIONS.tokensTabPalette, value: DocsStructureTokensTab.Palette },
        { title: DOCS_TRANSLATIONS.tokensTabSemantic, value: DocsStructureTokensTab.Semantic }
    ];
}
