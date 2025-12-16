import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';

@Component({
    selector: 'e2e-badge-styles',
    imports: [KbqBadgeModule],
    template: `
        <div>
            @for (color of colors; track $index) {
                <kbq-badge [badgeColor]="color">{{ color }}</kbq-badge>
            }
        </div>
        <div>
            @for (color of colors; track $index) {
                <kbq-badge [outline]="true" [badgeColor]="color">{{ color }}</kbq-badge>
            }
        </div>
        <div>
            @for (color of colors; track $index) {
                <kbq-badge [compact]="true" [badgeColor]="color">{{ color }}</kbq-badge>
            }
        </div>
        <div>
            @for (color of colors; track $index) {
                <kbq-badge [compact]="true" [outline]="true" [badgeColor]="color">{{ color }}</kbq-badge>
            }
        </div>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
        }

        :host > div {
            display: flex;
            gap: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eBadgeStyles'
    }
})
export class E2eBadgeStyles {
    protected readonly colors = Object.values(KbqBadgeColors);
}
