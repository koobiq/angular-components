import { booleanAttribute, ChangeDetectionStrategy, Component, Directive, input } from '@angular/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

@Component({
    selector: 'kbq-select-loading, [kbq-select-loading]',
    imports: [
        KbqProgressSpinnerModule
    ],
    template: `
        <!-- Scoped styles rather than the global layout utilities: the fallback has to look right in an
             application that does not ship them. -->
        <ng-content select="kbq-progress-spinner">
            <div class="kbq-select-loading__spinner">
                <kbq-progress-spinner [mode]="'indeterminate'" />
            </div>
        </ng-content>
    `,
    styles: `
        .kbq-select-loading__spinner {
            display: flex;
            align-items: center;
            justify-content: center;

            margin-top: var(--kbq-size-4xl);
            margin-bottom: var(--kbq-size-4xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-select-loading'
    },
    exportAs: 'kbqSelectLoading'
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

        /* Scoped to the host: at the top level ::ng-deep escapes the component and styles every
           error text on the page. */
        :host ::ng-deep .kbq-select-error__text {
            margin-top: var(--kbq-size-xs);
            margin-bottom: var(--kbq-size-3xs);
            color: var(--kbq-foreground-error);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-select-error',
        '[class.kbq-select-error_default]': '!paging()',
        '[class.kbq-select-error_paging]': 'paging()'
    },
    exportAs: 'kbqSelectError'
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
    host: {
        class: 'kbq-select-error__text'
    },
    exportAs: 'kbqSelectErrorText'
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
    host: {
        class: 'kbq-select-no-options'
    },
    exportAs: 'kbqSelectNoOptions'
})
export class KbqSelectNoOptions {}
