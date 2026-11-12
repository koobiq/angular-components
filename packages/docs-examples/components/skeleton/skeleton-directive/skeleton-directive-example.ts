import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAlertColors, KbqAlertModule, KbqAlertStyles } from '@koobiq/components/alert';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Skeleton directive
 */
@Component({
    selector: 'skeleton-directive-example',
    imports: [
        KbqSkeleton,
        KbqToggleModule,
        FormsModule,
        KbqAlertModule,
        KbqBadgeModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-toggle [(ngModel)]="loading">{{ text().loading }}</kbq-toggle>

        <div class="example-heading">
            <div class="kbq-title">
                <span [kbqSkeleton]="loading()">{{ text().dosTitle }}</span>
            </div>
            <kbq-badge [badgeColor]="badgeColors.FadeError" [compact]="true" [kbqSkeleton]="loading()">
                Critical
            </kbq-badge>
        </div>
        <kbq-alert
            class="example-alert"
            [alertColor]="alertColors.Error"
            [alertStyle]="alertStyles.Colored"
            [compact]="true"
            [kbqSkeleton]="loading()"
        >
            <i aria-hidden="true" kbq-icon="kbq-circle-info_16"></i>
            Protection is enabled on three servers
        </kbq-alert>
        <div class="kbq-text-normal">
            <span [kbqSkeleton]="loading()">
                In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks
                to make a machine or network resource unavailable to its intended users by temporarily or indefinitely
                disrupting services of a host connected to a network.
            </span>
        </div>
        <div class="example-actions">
            <button kbq-button color="contrast" [kbqSkeleton]="loading()">{{ text().readMore }}</button>
            <div kbq-button-group>
                <button kbq-button [kbqSkeleton]="loading()">{{ text().block }}</button>
                <button kbq-button [kbqSkeleton]="loading()">{{ text().ignore }}</button>
                <button kbq-button [kbqSkeleton]="loading()">{{ text().report }}</button>
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xl);
        }

        .example-heading {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-s);
        }

        .example-alert {
            align-self: stretch;
        }

        .example-actions {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonDirectiveExample extends BaseLocalizedExample<ExampleText> {
    protected readonly loading = model(true);

    protected readonly badgeColors = KbqBadgeColors;
    protected readonly alertColors = KbqAlertColors;
    protected readonly alertStyles = KbqAlertStyles;

    constructor() {
        super(TEXT);
    }
}
