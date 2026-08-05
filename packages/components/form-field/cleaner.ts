import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    InjectionToken,
    input,
    Provider,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ESCAPE, KbqComponentColors, kbqInjectA11yLocaleConfiguration } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';
import { fromEvent } from 'rxjs';
import { KbqFormFieldControl } from './form-field-control';

/** @docs-private */
export interface KbqCleanerContext {
    readonly control: KbqFormFieldControl<unknown>;
    readonly keydownTarget: HTMLElement;
    readonly clearByEscape: boolean;
    /** Overrides the default `cleanerControl.ngControl?.reset()` behavior when the cleaner is activated. */
    clear?(): void;
}

/** @docs-private */
export const KBQ_CLEANER_CONTEXT = new InjectionToken<KbqCleanerContext | null>('KbqCleanerContext');

/**
 * Utility provider for `KBQ_CLEANER_CONTEXT`, built from a factory that resolves the current host's `KbqCleanerContext`.
 * @docs-private
 */
export const kbqCleanerFactoryProvider = (factory: () => KbqCleanerContext): Provider => ({
    provide: KBQ_CLEANER_CONTEXT,
    useFactory: factory
});

/** @docs-private */
export function getKbqFormFieldYouCanNotUseCleanerInNumberInputError(): Error {
    return Error(`You can't use kbq-cleaner with input that have type="number"`);
}

/**
 * Element to be placed in end of the form field.
 * Resets form control by click.
 */
@Component({
    selector: 'kbq-cleaner',
    template: `
        <ng-content />
    `,
    styleUrls: ['cleaner.scss', '../icon/icon-button.scss', '../icon/icon-button-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-cleaner',
        // The cleaner is an icon-only control: without a role and an accessible name it is announced as an
        // unlabeled focusable graphic.
        role: 'button',
        '[attr.aria-label]': 'accessibleName()',
        '(click)': 'clear($event)',
        '(keydown.enter)': 'clear($event)',
        '(keydown.space)': 'clear($event)'
    },
    exportAs: 'kbqCleaner'
})
export class KbqCleaner extends KbqIconButton implements AfterContentInit {
    private readonly context = inject(KBQ_CLEANER_CONTEXT, { optional: true });

    /**
     * Whether the cleaner can be displayed for the current control state.
     * @docs-private
     */
    get canShow(): boolean {
        const control = this.context?.control;

        return control ? !control.disabled && !control.empty : true;
    }

    private readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    /** Accessible name of the cleaner. Defaults to the localized "Clear". */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

    /** @docs-private */
    protected readonly accessibleName = computed(() => this.ariaLabel() || this.a11yLocaleConfiguration().clear);

    constructor() {
        super();

        this.setIconName('kbq-circle-xmark_16');
        this.color = KbqComponentColors.ContrastFade;
        this.autoColor = true;
    }

    ngAfterContentInit(): void {
        super.ngAfterContentInit();

        if (this.context?.control?.controlType === 'input-number') {
            throw getKbqFormFieldYouCanNotUseCleanerInNumberInputError();
        }

        const keydownTarget = this.context?.keydownTarget;

        if (keydownTarget) {
            fromEvent<KeyboardEvent>(keydownTarget, 'keydown')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => this.onKeyDown(event));
        }
    }

    /**
     * Clears the owning control in response to pointer or keyboard activation.
     * @docs-private
     */
    clear(event: Event): void {
        if (!this.context || !this.canShow) return;

        event.stopPropagation();
        event.preventDefault();

        if (this.context.clear) {
            this.context.clear();
        } else {
            this.context.control.ngControl?.reset();
        }

        this.context.control.focus();
    }

    /**
     * Clears the focused control when Escape handling is enabled.
     */
    private onKeyDown(event: KeyboardEvent): void {
        if (event.keyCode === ESCAPE && this.context?.clearByEscape && this.context.control.focused && this.canShow) {
            this.clear(event);
        }
    }
}
