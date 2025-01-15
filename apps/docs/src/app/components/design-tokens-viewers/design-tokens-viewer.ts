import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { KbqTabsModule } from '@koobiq/components/tabs';
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
                            {{ link.viewValue }}
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
        class: 'docs-component-viewer kbq-scrollbar',
        '[attr.data-docsearch-category]': 'docCategoryName'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignTokensViewer {
    links = [
        { viewValue: 'Цвета', value: 'colors' },
        { viewValue: 'Тени', value: 'shadows' },
        { viewValue: 'Скругления', value: 'border-radius' },
        { viewValue: 'Размеры', value: 'sizes' },
        { viewValue: 'Типографика', value: 'tokens-typography' },
        { viewValue: 'Инженерная палитра', value: 'palette' }
    ];
}
