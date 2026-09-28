import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSkeleton } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton with buttons
 */
@Component({
    selector: 'skeleton-button-example',
    imports: [KbqSkeleton, KbqToggleModule, FormsModule, KbqButtonModule, KbqIconModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        <div class="example-row">
            <button kbq-button [color]="colors.Contrast" [kbqSkeleton]="loading()">Save</button>
            <button kbq-button disabled [color]="colors.ContrastFade" [kbqSkeleton]="loading()">Cancel</button>
            <button kbq-button kbqStyle="outline" [kbqSkeleton]="loading()">Export</button>
            <button kbq-button aria-label="Edit" [color]="colors.ContrastFade" [kbqSkeleton]="loading()">
                <i kbq-icon="kbq-pencil_16"></i>
            </button>
        </div>

        <div kbq-button-group>
            <button kbq-button [kbqSkeleton]="loading()">Save</button>
            <button kbq-button disabled [kbqSkeleton]="loading()">Cancel</button>
            <button kbq-button [kbqSkeleton]="loading()">Export</button>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }

        .example-row {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonButtonExample {
    protected readonly loading = model(true);
    protected readonly colors = KbqComponentColors;
}
