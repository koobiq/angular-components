import { Component, ViewEncapsulation } from '@angular/core';
import { KbqBadgeColors } from '@koobiq/components/badge';

/**
 * @title Badge list
 */
@Component({
    selector: 'badge-list-example',
    templateUrl: 'badge-list-example.html',
    styleUrls: ['badge-list-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class BadgeListExample {
    colors = KbqBadgeColors;

    badges = [
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
