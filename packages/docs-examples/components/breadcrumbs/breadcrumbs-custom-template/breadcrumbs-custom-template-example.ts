import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Breadcrumbs custom-template
 */
@Component({
    selector: 'breadcrumbs-custom-template-example',
    imports: [
        RouterLink,
        KbqButtonModule,
        KbqIconModule,
        KbqBreadcrumbsModule
    ],
    template: `
        <nav kbq-breadcrumbs>
            @for (breadcrumb of breadcrumbs(); track breadcrumb) {
                <kbq-breadcrumb-item [routerLink]="breadcrumb.url" [text]="breadcrumb.label">
                    <a
                        *kbqBreadcrumbView
                        tabindex="-1"
                        kbq-button
                        kbqBreadcrumb
                        [focusable]="!$last"
                        [routerLink]="breadcrumb.url"
                        [disabled]="$last"
                        [attr.aria-current]="$last ? 'page' : null"
                    >
                        {{ breadcrumb.label }}
                        <i kbq-icon="kbq-file-code-o_16"></i>
                    </a>
                </kbq-breadcrumb-item>
            }
        </nav>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsCustomTemplateExample {
    protected readonly text = injectExampleText();

    readonly breadcrumbs = computed(() => [
        { label: this.text().informationSecurity, url: '/information-security' },
        { label: this.text().accessControl, url: '/information-security/access-control' },
        { label: this.text().authorization, url: '/information-security/access-control/authorization' },
        { label: 'RBAC', url: '/information-security/access-control/authorization/rbac' },
        { label: this.text().roles, url: '/information-security/access-control/authorization/rbac/roles' }
    ]);
}
