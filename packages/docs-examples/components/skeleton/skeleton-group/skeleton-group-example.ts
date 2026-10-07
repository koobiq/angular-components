import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqSkeletonGroup } from '@koobiq/components/skeleton';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton group preset
 */
@Component({
    selector: 'skeleton-group-example',
    imports: [KbqSkeletonGroup, KbqToggleModule, FormsModule, KbqTagsModule, KbqBadgeModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-group preset="tag" />
            <kbq-skeleton-group preset="badge" [count]="5" />
        } @else {
            <kbq-tag-list>
                <kbq-tag [color]="colors.ContrastFade">LDAP</kbq-tag>
                <kbq-tag [color]="colors.Theme">Active Directory</kbq-tag>
                <kbq-tag [color]="colors.Error">Blocked</kbq-tag>
            </kbq-tag-list>
            <div class="example-row">
                <kbq-badge [badgeColor]="badgeColors.FadeTheme">New</kbq-badge>
                <kbq-badge [badgeColor]="badgeColors.FadeSuccess">Active</kbq-badge>
                <kbq-badge [badgeColor]="badgeColors.FadeError">Blocked</kbq-badge>
                <kbq-badge [badgeColor]="badgeColors.FadeContrast">Archived</kbq-badge>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }

        .example-row {
            display: flex;
            flex-wrap: wrap;
            gap: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonGroupExample {
    protected readonly loading = model(true);
    protected readonly colors = KbqComponentColors;
    protected readonly badgeColors = KbqBadgeColors;
}
