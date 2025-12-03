import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

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
            <div class="example-badge-list__label kbq-text-compact">Horizontal</div>
            <div class="example-badge-list__list">
                @for (badge of badges; track badge) {
                    <kbq-badge [badgeColor]="badge.color">{{ badge.name }}</kbq-badge>
                }
            </div>
            <div class="example-badge-list__label layout-margin-top-l kbq-text-compact">Vertical</div>
            <div class="example-badge-list__list example-badge-list__list_vertical">
                @for (badge of badges; track badge) {
                    <kbq-badge [badgeColor]="badge.color">{{ badge.name }}</kbq-badge>
                }
            </div>
        </div>
    `,
    styleUrls: ['badge-list-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeListExample {
    colors = KbqBadgeColors;

    badges: { name: string; color: string }[] = [
        { name: 'Bruteforce', color: this.colors.FadeContrast },
        { name: 'Complex Attack', color: this.colors.FadeContrast },
        { name: 'DDoS', color: this.colors.FadeContrast },
        { name: 'DoS', color: this.colors.FadeContrast },
        { name: 'HIPS Alert', color: this.colors.FadeContrast },
        { name: 'IDS/IPS Alert', color: this.colors.FadeContrast },
        { name: 'Identity Theft', color: this.colors.FadeContrast },
        { name: 'Miscellaneous', color: this.colors.FadeContrast },
        { name: 'Network Attack', color: this.colors.FadeContrast },
        { name: 'Post Compromise', color: this.colors.FadeContrast }
    ];
}
