import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KbqModalModule } from '@koobiq/components/modal';
import { KbqSidepanelService } from '@koobiq/components/sidepanel';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { DocsLocale } from 'src/app/constants/locale';
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
        DocsRegisterHeaderDirective,

        // Prevents: "NullInjectorError: No provider for KbqModalService!"
        KbqModalModule
    ],
    template: `
        <div class="docs-component-header">
            <div class="docs-component-name" docsRegisterHeader>
                {{ isRuLocale() ? 'Дизайн-токены' : 'Design tokens' }}
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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [KbqSidepanelService],
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
        {
            title: {
                ru: 'Цвета',
                en: 'Colors'
            },
            value: DocsStructureTokensTab.Colors
        },
        {
            title: {
                ru: 'Типографика',
                en: 'Typography'
            },
            value: DocsStructureTokensTab.Typography
        },
        {
            title: {
                ru: 'Тени',
                en: 'Shadows'
            },
            value: DocsStructureTokensTab.Shadows
        },
        {
            title: {
                ru: 'Скругления',
                en: 'Border radius'
            },
            value: DocsStructureTokensTab.BorderRadius
        },
        {
            title: {
                ru: 'Размеры',
                en: 'Sizes'
            },
            value: DocsStructureTokensTab.Sizes
        },
        {
            title: {
                ru: 'Инженерная палитра',
                en: 'Engineer palette'
            },
            value: DocsStructureTokensTab.Palette
        }
    ];
}
