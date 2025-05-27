import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { DocsLocale } from 'src/app/constants/locale';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsRegisterHeaderDirective } from '../register-header/register-header.directive';

@Component({
    standalone: true,
    imports: [
        KbqTabsModule,
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        DocsRegisterHeaderDirective
    ],
    selector: 'docs-component-viewer',
    template: `
        <div class="docs-component-header">
            <div class="docs-component-name" docsRegisterHeader>Дизайн-токены</div>
            <div class="docs-component-navbar layout-padding-top-s">
                <nav [tabNavPanel]="tabNavPanel" kbqTabNavBar>
                    @for (link of links; track link) {
                        <a [routerLink]="link.value" kbqTabLink routerLinkActive="kbq-selected">
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
    host: {
        class: 'docs-component-viewer kbq-scrollbar'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsDesignTokensViewer extends DocsLocaleState {
    readonly links: Array<{ title: Record<DocsLocale, string>; value: string }> = [
        {
            title: {
                ru: 'Цвета',
                en: 'Colors'
            },
            value: 'colors'
        },
        {
            title: {
                ru: 'Тени',
                en: 'Shadows'
            },
            value: 'shadows'
        },
        {
            title: {
                ru: 'Скругления',
                en: 'Border radius'
            },
            value: 'border-radius'
        },
        {
            title: {
                ru: 'Размеры',
                en: 'Sizes'
            },
            value: 'sizes'
        },
        {
            title: {
                ru: 'Инженерная палитра',
                en: 'Engineer palette'
            },
            value: 'palette'
        }
    ];
}
