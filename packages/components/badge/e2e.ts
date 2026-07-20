import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqIconModule } from '@koobiq/components/icon';

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
                <kbq-badge [compact]="true" [badgeColor]="color">{{ color }}</kbq-badge>
            }
        </div>
        <div>
            @for (color of outlineColors; track $index) {
                <kbq-badge [outline]="true" [badgeColor]="color">{{ color }}</kbq-badge>
            }
        </div>
        <div>
            @for (color of outlineColors; track $index) {
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
    protected readonly outlineColors = [
        KbqBadgeColors.FadeContrast,
        KbqBadgeColors.FadeTheme,
        KbqBadgeColors.FadeSuccess,
        KbqBadgeColors.FadeWarning,
        KbqBadgeColors.FadeError,
        KbqBadgeColors.Disabled
    ];
}

@Component({
    selector: 'e2e-badge-async-icon',
    imports: [KbqBadgeModule, KbqIconModule, KbqCheckboxModule, FormsModule],
    template: `
        <kbq-checkbox data-testid="e2eShowIcon" [(ngModel)]="showIcon">show icon</kbq-checkbox>

        <kbq-badge [badgeColor]="colors.Success">
            Normal
            @if (showIcon()) {
                <i kbq-icon="kbq-circle-question_16"></i>
            }
        </kbq-badge>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eBadgeAsyncIcon'
    }
})
export class E2eBadgeAsyncIcon {
    protected readonly colors = KbqBadgeColors;

    readonly showIcon = model(false);
}
