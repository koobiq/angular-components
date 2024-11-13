import { Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

/**
 * @title Badge list
 */
@Component({
    standalone: true,
    selector: 'badge-list-example',
    styleUrls: ['badge-list-example.css'],
    imports: [
        KbqBadgeModule
    ],
    template: `
        <div class="badge-list-example">
            <div class="badge-list-example__label kbq-extra-small-text">Horizontal</div>
            <div class="badge-list-example__list">
                @for (badge of badges; track badge) {
                    <kbq-badge [badgeColor]="badge.color">{{ badge.name }}</kbq-badge>
                }
            </div>
            <div class="badge-list-example__label badge-list-example__label_vertical kbq-extra-small-text">
                Vertical
            </div>
            <div class="badge-list-example__list badge-list-example__list_vertical">
                @for (badge of badges; track badge) {
                    <kbq-badge [badgeColor]="badge.color">{{ badge.name }}</kbq-badge>
                }
            </div>
        </div>
    `
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
