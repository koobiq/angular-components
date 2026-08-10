import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqThemeService } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

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
                        src="https://koobiq.io/assets/images/{{ currentTheme() }}/empty_192.png"
                        alt="Empty state"
                        height="192"
                        width="192"
                        [srcset]="srcSet()"
                    />
                </div>
                <div kbq-empty-state-title>Нет групп</div>
                <div kbq-empty-state-text>{{ emptyStateText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                        {{ buttonText }}
                    </button>
                </div>
            </kbq-empty-state>

            <kbq-empty-state class="flex" style="min-height: 216px">
                <div kbq-empty-state-icon>
                    <img
                        src="https://koobiq.io/assets/images/{{ currentTheme() }}/empty_192.png"
                        alt="Empty state"
                        width="80"
                        height="80"
                        [srcset]="srcSet()"
                    />
                </div>
                <div kbq-empty-state-title>Нет групп</div>
                <div kbq-empty-state-text>{{ emptyStateText }}</div>
                <div kbq-empty-state-actions>
                    <button kbq-button [color]="colors.Theme" [kbqStyle]="styles.Transparent">
                        <i kbq-icon="kbq-plus_16" [color]="'theme'"></i>
                        {{ buttonText }}
                    </button>
                </div>
            </kbq-empty-state>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateContentExample {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
    private readonly themeService = inject(KbqThemeService, { optional: true });
    protected readonly currentTheme = computed(() => this.themeService?.colorScheme() ?? 'light');

    protected readonly srcSet = computed(() => {
        const currentTheme = this.currentTheme();

        return `assets/images/${currentTheme}/empty_192.png 1x, assets/images/${currentTheme}/empty_192@2x.png 2x`;
    });

    buttonText = 'Создать группу';
    emptyStateText = 'Агенты можно объединить в группу и назначить им одни и те же политики';
}
