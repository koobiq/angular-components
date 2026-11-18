import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqThemeService } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Empty-state content
 */
@Component({
    selector: 'empty-state-content-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule,
        NgOptimizedImage
    ],
    template: `
        <div class="layout-row layout-wrap">
            <kbq-empty-state class="flex" size="big" style="min-height: 216px">
                <div kbq-empty-state-icon>
                    <img height="192" width="192" [attr.alt]="t().altEmptyState" [ngSrc]="src2x()" />
                </div>
                <h2 kbq-empty-state-title>{{ t().noGroups }}</h2>
                <div kbq-empty-state-text>{{ t().agentsGroupText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button type="button" [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" color="theme"></i>
                        {{ t().createGroup }}
                    </button>
                </div>
            </kbq-empty-state>

            <kbq-empty-state class="flex" style="min-height: 216px">
                <div kbq-empty-state-icon>
                    <img width="80" height="80" [attr.alt]="t().altEmptyState" [ngSrc]="src()" />
                </div>
                <h2 kbq-empty-state-title>{{ t().noGroups }}</h2>
                <div kbq-empty-state-text>{{ t().agentsGroupText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button type="button" [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" color="theme"></i>
                        {{ t().createGroup }}
                    </button>
                </div>
            </kbq-empty-state>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateContentExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
    private readonly themeService = inject(KbqThemeService, { optional: true });
    protected readonly currentTheme = computed(() => this.themeService?.colorScheme() ?? 'light');

    protected readonly src = computed(() => `https://koobiq.io/assets/images/${this.currentTheme()}/empty_192.webp`);

    protected readonly src2x = computed(
        () => `https://koobiq.io/assets/images/${this.currentTheme()}/empty_192@2x.webp`
    );
}
