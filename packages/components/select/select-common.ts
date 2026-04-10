import { booleanAttribute, ChangeDetectionStrategy, Component, Directive, input } from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

@Component({
    selector: 'kbq-select-loading, [kbq-select-loading]',
    imports: [
        KbqProgressSpinnerModule
    ],
    template: `
        <ng-content select="kbq-progress-spinner">
            <div class="layout-row layout-margin-top-4xl layout-margin-bottom-4xl layout-align-center-center">
                <kbq-progress-spinner [mode]="'indeterminate'" />
            </div>
        </ng-content>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqSelectLoading',
    host: {
        class: 'kbq-select-loading'
    }
})
export class KbqSelectLoading {}

/**
 * This component renders the error for a Select component.
 * The error message can be displayed in two visual variants: a default centered layout (when [paging] is falsy)
 * or a variant with left‑aligned text suitable for pagination controls (when [paging] is truthy).
 */
@Component({
    selector: 'kbq-select-error, [kbq-select-error]',
    template: `
        <ng-content />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            &.kbq-select-error_default {
                align-items: center;
                justify-content: center;

                margin-bottom: var(--kbq-size-3xl);
                margin-top: var(--kbq-size-3xl);
            }

            &.kbq-select-error_paging {
                justify-content: start;

                & ::ng-deep.kbq-select-error__text {
                    padding-left: var(--kbq-size-l);
                }
            }
        }

        ::ng-deep .kbq-select-error__text {
            margin-top: var(--kbq-size-xs);
            margin-bottom: var(--kbq-size-3xs);
            color: var(--kbq-foreground-error);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqSelectError',
    host: {
        class: 'kbq-select-error',
        '[class.kbq-select-error_default]': '!paging()',
        '[class.kbq-select-error_paging]': 'paging()'
    }
})
export class KbqSelectError {
    /** Indicates whether styles for pagination controls should be used. */
    paging = input(false, { transform: booleanAttribute });
}

/**
 * Marks an element as the error text container for a *KbqSelect* component.
 */
@Directive({
    selector: '[kbq-select-error-text]',
    exportAs: 'kbqSelectErrorText',
    host: {
        class: 'kbq-select-error__text'
    }
})
export class KbqSelectErrorText {}

/**
 * Component that represents the empty state of a select dropdown.
 */
@Component({
    selector: 'kbq-select-no-options, [kbq-select-no-options]',
    template: `
        <ng-content />
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            padding-bottom: var(--kbq-size-3xl);
            padding-top: var(--kbq-size-3xl);

            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqSelectNoOptions',
    host: {
        class: 'kbq-select-no-options'
    }
})
export class KbqSelectNoOptions {}
