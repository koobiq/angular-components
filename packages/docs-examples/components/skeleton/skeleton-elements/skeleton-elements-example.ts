import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import {
    KbqSkeletonBadge,
    KbqSkeletonButton,
    KbqSkeletonIcon,
    KbqSkeletonLink,
    KbqSkeletonTag
} from '@koobiq/components/skeleton';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Skeleton element presets
 */
@Component({
    selector: 'skeleton-elements-example',
    imports: [
        KbqSkeletonButton,
        KbqSkeletonBadge,
        KbqSkeletonTag,
        KbqSkeletonIcon,
        KbqSkeletonLink,
        KbqToggleModule,
        FormsModule,
        KbqBadgeModule,
        KbqButtonModule,
        KbqIconModule,
        KbqLink,
        KbqTagsModule
    ],
    template: `
        <kbq-toggle [(ngModel)]="loading">{{ text().loading }}</kbq-toggle>

        <div class="example-row">
            @if (loading()) {
                <kbq-skeleton-button />
                <kbq-skeleton-badge />
                <kbq-skeleton-tag />
                <kbq-skeleton-icon />
                <kbq-skeleton-link />
            } @else {
                <button kbq-button color="contrast">{{ text().start }}</button>
                <kbq-badge [badgeColor]="badgeColors.FadeSuccess">{{ text().active }}</kbq-badge>
                <kbq-tag>
                    LDAP
                    <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
                </kbq-tag>
                <i aria-label="Edit" kbq-icon-button="kbq-pencil_16"></i>
                <a kbqLink pseudo>{{ text().history }}</a>
            }
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xl);
        }

        .example-row {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonElementsExample {
    protected readonly loading = model(true);

    protected readonly text = injectExampleText();
    protected readonly badgeColors = KbqBadgeColors;
}
