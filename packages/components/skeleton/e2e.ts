import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSkeleton } from './skeleton';

/**
 * The skeleton radius is only a fallback, and the cascade decides when it applies: which rule wins is up to
 * specificity, which JSDOM does not compute. Every host is rendered twice, loading and loaded, so a test compares
 * the loading radius with the host's own one instead of a hardcoded value.
 */
@Component({
    selector: 'e2e-skeleton-border-radius',
    imports: [KbqSkeleton, KbqAlertModule, KbqButtonModule, KbqFormFieldModule, KbqInputModule],
    template: `
        @for (loading of [true, false]; track loading) {
            <div class="e2e-skeleton-row" [attr.data-testid]="loading ? 'loading' : 'loaded'">
                <span data-testid="text" [kbqSkeleton]="loading">Inline text</span>
                <div data-testid="block" [kbqSkeleton]="loading">Block without a radius</div>
                <kbq-skeleton class="e2e-skeleton-element" data-testid="element" [kbqSkeleton]="loading" />
                <kbq-skeleton class="e2e-skeleton-circle" data-testid="circle" [kbqSkeleton]="loading" />
                <div class="e2e-skeleton-own" data-testid="own" [kbqSkeleton]="loading">Own radius</div>
                <div class="e2e-skeleton-square" data-testid="square" [kbqSkeleton]="loading">Explicit zero</div>
                <button kbq-button data-testid="button" [kbqSkeleton]="loading">Save</button>
                <kbq-alert data-testid="alert" [compact]="true" [kbqSkeleton]="loading">Alert</kbq-alert>
                <kbq-form-field class="e2e-skeleton-field" data-testid="form-field" [kbqSkeleton]="loading">
                    <input kbqInput value="Value" />
                </kbq-form-field>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 16px;
        }

        .e2e-skeleton-row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 16px;
        }

        .e2e-skeleton-element {
            width: 80px;
        }

        .e2e-skeleton-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }

        .e2e-skeleton-own {
            border-radius: 10px;
        }

        .e2e-skeleton-square {
            border-radius: 0;
        }

        .e2e-skeleton-field {
            width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSkeletonBorderRadius'
    }
})
export class E2eSkeletonBorderRadius {}
