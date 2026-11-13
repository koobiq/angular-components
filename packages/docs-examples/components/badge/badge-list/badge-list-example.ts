import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Badge list
 */
@Component({
    selector: 'badge-list-example',
    imports: [
        KbqBadgeModule
    ],
    template: `
        <div class="badge-list-example">
            <div class="example-badge-list__label kbq-text-compact">{{ t().horizontal }}</div>
            <div class="example-badge-list__list">
                @for (badge of badges(); track badge) {
                    <kbq-badge [badgeColor]="badge.color">{{ badge.name }}</kbq-badge>
                }
            </div>
            <div class="example-badge-list__label layout-margin-top-l kbq-text-compact">{{ t().vertical }}</div>
            <div class="example-badge-list__list example-badge-list__list_vertical">
                @for (badge of badges(); track badge) {
                    <kbq-badge [badgeColor]="badge.color">{{ badge.name }}</kbq-badge>
                }
            </div>
        </div>
    `,
    styleUrls: ['badge-list-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeListExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    colors = KbqBadgeColors;

    readonly badges = computed(() => this.t().categories.map((name) => ({ name, color: this.colors.FadeContrast })));
}
