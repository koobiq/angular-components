import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Breadcrumbs selectable text
 */
@Component({
    selector: 'breadcrumbs-selectable-text-example',
    imports: [
        RouterLink,
        KbqButtonModule,
        KbqIconModule,
        KbqBreadcrumbsModule
    ],
    template: `
        <nav kbq-breadcrumbs [firstItemNegativeMargin]="false">
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
                        <span class="example__selectable-label">{{ breadcrumb.label }}</span>
                        <div class="example-item__copy-icon" (click)="copyToClipboard($event, breadcrumb.label)">
                            <i kbq-icon="kbq-square-multiple-o_16"></i>
                        </div>
                    </a>
                </kbq-breadcrumb-item>
            }
        </nav>
    `,
    styles: [
        `
            .example__selectable-label {
                -webkit-user-select: text;
                user-select: text;
            }

            .example-item__copy-icon {
                position: absolute;
                right: 0;
                top: 0;
                bottom: 0;
                display: flex;
                align-items: center;
                padding: 0 var(--kbq-size-xs);
                background: linear-gradient(
                    to right,
                    transparent,
                    var(--kbq-background-overlay-inverse) var(--kbq-size-s)
                );
                border-radius: var(--kbq-size-xxs);
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
            }

            a:hover .example-item__copy-icon,
            a:focus-visible .example-item__copy-icon {
                opacity: 1;
                pointer-events: auto;
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BreadcrumbsSelectableTextExample extends BaseLocalizedExample<ExampleTranslation> {
    private readonly clipboard = inject(Clipboard, { optional: true });

    readonly breadcrumbs = computed(() => [
        { label: this.t().informationSecurity, url: '/information-security' },
        { label: this.t().accessControl, url: '/information-security/access-control' },
        { label: this.t().authorization, url: '/information-security/access-control/authorization' },
        { label: 'RBAC', url: '/information-security/access-control/authorization/rbac' },
        { label: this.t().roles, url: '/information-security/access-control/authorization/rbac/roles' }
    ]);

    protected copyToClipboard(event: MouseEvent, text: string): void {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.clipboard?.copy(text);
    }

    constructor() {
        super(TRANSLATIONS);
    }
}
