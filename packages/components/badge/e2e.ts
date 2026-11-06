import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTableModule } from '@koobiq/components/table';

const colors = Object.values(KbqBadgeColors);
const outlineColors = [
    KbqBadgeColors.FadeContrast,
    KbqBadgeColors.FadeTheme,
    KbqBadgeColors.FadeSuccess,
    KbqBadgeColors.FadeWarning,
    KbqBadgeColors.FadeError,
    KbqBadgeColors.Disabled
];

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
    protected readonly colors = colors;
    protected readonly outlineColors = outlineColors;
}

@Component({
    selector: 'e2e-badge-content',
    imports: [KbqBadgeModule, KbqIconModule],
    template: `
        <div class="e2e-badge-content" data-testid="e2eScreenshotTarget">
            @for (view of views; track $index) {
                <kbq-badge [compact]="view.compact" [outline]="view.outline">Badge</kbq-badge>
                <kbq-badge [compact]="view.compact" [outline]="view.outline">
                    Badge
                    <span kbq-badge-caption>0.8</span>
                </kbq-badge>
                <kbq-badge [compact]="view.compact" [outline]="view.outline">
                    <i kbq-icon="kbq-bug_16" color="contrast"></i>
                    Badge
                </kbq-badge>
                <kbq-badge [compact]="view.compact" [outline]="view.outline">
                    Badge
                    <i kbq-icon="kbq-bug_16" color="contrast"></i>
                </kbq-badge>
                <kbq-badge [compact]="view.compact" [outline]="view.outline">
                    <i kbq-icon="kbq-bug_16" color="contrast"></i>
                    Badge
                    <span kbq-badge-caption>0.8</span>
                    <i kbq-icon="kbq-bug_16" color="contrast"></i>
                </kbq-badge>
                <kbq-badge [compact]="view.compact" [outline]="view.outline">
                    <i kbq-icon="kbq-bug_16" color="contrast"></i>
                </kbq-badge>
                <kbq-badge [compact]="view.compact" [outline]="view.outline">Йgyp</kbq-badge>
            }
        </div>
    `,
    styles: `
        .e2e-badge-content {
            display: inline-grid;
            grid-template-columns: repeat(7, max-content);
            gap: var(--kbq-size-s);
            align-items: center;
            justify-items: start;
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eBadgeContent'
    }
})
export class E2eBadgeContent {
    protected readonly views = [
        { compact: false, outline: false },
        { compact: false, outline: true },
        { compact: true, outline: false },
        { compact: true, outline: true }
    ];
}

@Component({
    selector: 'e2e-badge-content-colors',
    imports: [KbqBadgeModule, KbqIconModule],
    template: `
        <div class="e2e-badge-content-colors" data-testid="e2eScreenshotTarget">
            @for (color of colors; track color) {
                <kbq-badge [badgeColor]="color">
                    <i kbq-icon="kbq-bug_16"></i>
                    Badge
                    <span kbq-badge-caption>0.8</span>
                </kbq-badge>
            }

            <kbq-badge [badgeColor]="badgeColors.FadeSuccess">
                <i kbq-icon="kbq-bug_16" color="contrast"></i>
                Badge
                <span kbq-badge-caption>0.8</span>
            </kbq-badge>

            @for (color of outlineColors; track color) {
                <kbq-badge [badgeColor]="color" [outline]="true">
                    <i kbq-icon="kbq-bug_16"></i>
                    Badge
                    <span kbq-badge-caption>0.8</span>
                </kbq-badge>
            }
        </div>
    `,
    styles: `
        .e2e-badge-content-colors {
            display: inline-grid;
            grid-template-columns: repeat(6, max-content);
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eBadgeContentColors'
    }
})
export class E2eBadgeContentColors {
    protected readonly badgeColors = KbqBadgeColors;
    protected readonly colors = colors;
    protected readonly outlineColors = outlineColors;
}

@Component({
    selector: 'e2e-badge-alignment',
    imports: [KbqBadgeModule, KbqTableModule],
    template: `
        <div class="kbq-text-compact" data-testid="e2eBadgeLine">
            <span>Text</span>
            <kbq-badge [compact]="true">Badge</kbq-badge>
            <kbq-badge [compact]="true" [outline]="true">Badge</kbq-badge>
        </div>

        <div class="kbq-text-normal" data-testid="e2eBadgeLine">
            <span>Text</span>
            <kbq-badge>Badge</kbq-badge>
            <kbq-badge [outline]="true">Badge</kbq-badge>
        </div>

        <div class="kbq-text-normal" data-testid="e2eBadgeBodyLine">
            Text
            <kbq-badge [compact]="true">Badge</kbq-badge>
        </div>

        <table kbq-table>
            <tbody>
                <tr data-testid="e2eBadgeLine">
                    <td><span>Text</span></td>
                    <td><kbq-badge>Badge</kbq-badge></td>
                    <td><kbq-badge [outline]="true">Badge</kbq-badge></td>
                </tr>
            </tbody>
        </table>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eBadgeAlignment'
    }
})
export class E2eBadgeAlignment {}

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
