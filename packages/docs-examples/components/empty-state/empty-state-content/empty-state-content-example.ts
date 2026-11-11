import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqThemeService } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from './l10n';

/**
 * @title Empty-state content
 */
@Component({
    selector: 'empty-state-content-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-row layout-wrap">
            <kbq-empty-state class="flex" size="big" style="min-height: 216px">
                <div kbq-empty-state-icon>
                    <img
                        src="https://koobiq.io/assets/images/{{ currentTheme() }}/empty_192.webp"
                        height="192"
                        width="192"
                        [attr.alt]="text().altEmptyState"
                        [srcset]="srcSet()"
                    />
                </div>
                <h2 kbq-empty-state-title>{{ text().noGroups }}</h2>
                <div kbq-empty-state-text>{{ text().agentsGroupText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                        {{ text().createGroup }}
                    </button>
                </div>
            </kbq-empty-state>

            <kbq-empty-state class="flex" style="min-height: 216px">
                <div kbq-empty-state-icon>
                    <img
                        src="https://koobiq.io/assets/images/{{ currentTheme() }}/empty_192.webp"
                        width="80"
                        height="80"
                        [attr.alt]="text().altEmptyState"
                        [srcset]="srcSet()"
                    />
                </div>
                <h2 kbq-empty-state-title>{{ text().noGroups }}</h2>
                <div kbq-empty-state-text>{{ text().agentsGroupText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                        {{ text().createGroup }}
                    </button>
                </div>
            </kbq-empty-state>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateContentExample {
    protected readonly text = injectExampleText();

    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
    private readonly themeService = inject(KbqThemeService, { optional: true });
    protected readonly currentTheme = computed(() => this.themeService?.colorScheme() ?? 'light');

    protected readonly srcSet = computed(() => {
        const currentTheme = this.currentTheme();

        return `https://koobiq.io/assets/images/${currentTheme}/empty_192.webp 1x, https://koobiq.io/assets/images/${currentTheme}/empty_192@2x.webp 2x`;
    });
}
