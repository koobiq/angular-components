import { animate, style, transition, trigger } from '@angular/animations';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    ElementRef,
    inject,
    input,
    numberAttribute,
    output,
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqAnimationCurves,
    KbqAnimationDurations,
    KbqComponentColors,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormField, KbqLabel } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { takeUntil } from 'rxjs/operators';
import { KbqFocusMonitor } from './focus-monitor';

const KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION = trigger('panelAnimation', [
    transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
            `${KbqAnimationDurations.Instant} ${KbqAnimationCurves.DecelerationCurve}`,
            style({ transform: 'translateY(0%)', opacity: 1 })
        )])

]);

const baseClass = 'kbq-inline-edit';

/**
 * Directive for template with view representation of control value
 * that is projected when inline edit switched to view mode.
 */
@Directive({
    standalone: true,
    selector: '[kbqInlineEditViewMode]',
    exportAs: 'kbqInlineEditViewMode'
})
export class KbqInlineEditViewMode {
    readonly templateRef = inject(TemplateRef);
}

/**
 * Directive for template with control that is projected when inline edit switched to edit mode.
 * Projected inside `cdkOverlay`.
 */
@Directive({
    standalone: true,
    selector: '[kbqInlineEditEditMode]',
    exportAs: 'kbqInlineEditEditMode'
})
export class KbqInlineEditEditMode {
    readonly templateRef = inject(TemplateRef);
}

/** Directive for easy using styles of inline edit placeholder publicly. */
@Directive({
    standalone: true,
    selector: '[kbqInlineEditPlaceholder]',
    exportAs: 'kbqInlineEditPlaceholder',
    host: {
        class: 'kbq-inline-edit__placeholder'
    }
})
export class KbqInlineEditPlaceholder {}

/**
 * This directive enhances element acting as dropdown trigger,
 * visually indicating the active state with the `kbq-active` class.
 * Also, it prevents click/keydown events from being propagated to disable mode toggling of parent component.
 */
@Directive({
    standalone: true,
    selector: '[kbqInlineEditMenu]',
    exportAs: 'kbqInlineEditMenu',
    host: {
        role: 'button',
        class: 'kbq-inline-edit__menu',
        '[class.kbq-active]': 'dropdownTrigger?.opened',
        '(click)': '$event.stopPropagation()',
        '(keydown.enter)': '$event.stopPropagation()',
        '(keydown.space)': '$event.stopPropagation()'
    }
})
export class KbqInlineEditMenu {
    dropdownTrigger = inject(KbqDropdownTrigger, { optional: true });
}

/**
 * Customizable component that enables edit-in-place logic for specified control and it's view.
 * This component is projecting edit/view mode templates and adds keyboard/pointer handlers.
 * Edit mode opens in a positioned overlay that matches the view mode width or can be customized.
 */
@Component({
    standalone: true,
    selector: 'kbq-inline-edit',
    exportAs: 'kbqInlineEdit',
    templateUrl: './inline-edit.html',
    styleUrls: ['./inline-edit.scss', './inline-edit-tokens.scss'],
    host: {
        class: baseClass,
        '[class.kbq-inline-edit_with-label]': '!!label()',
        '[class.kbq-inline-edit_with-menu]': '!!menu()',
        '[tabindex]': 'tabIndex()',
        '[class]': 'className()',
        '[class.kbq-inline-edit_disabled]': 'disabled()',
        '(click)': 'onClick($event)',
        '(keydown.enter)': 'onClick($event)',
        '(keydown.space)': 'onClick($event)'
    },
    hostDirectives: [KbqFocusMonitor],
    imports: [
        NgTemplateOutlet,
        CdkConnectedOverlay,
        CdkOverlayOrigin,
        CdkTrapFocus,
        KbqButtonModule,
        KbqIcon,
        KbqTooltipTrigger
    ],
    animations: [KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqInlineEdit {
    /**
     * Whether to show save/cancel action buttons in edit mode.
     * @default false
     */
    readonly showActions = input(false, { transform: booleanAttribute });
    /**
     * Whether to automatically show validation error tooltips on save attempts.
     * @default true
     */
    readonly showTooltipOnError = input(true, { transform: booleanAttribute });
    /** Custom validation tooltip message. */
    readonly validationTooltip = input<string | TemplateRef<any>>();
    /**
     * Disables the component, preventing interaction and mode switching. Only allows menu dropdown.
     * @default false
     */
    readonly disabled = input(false, { transform: booleanAttribute });
    /** Custom width in pixels for the edit mode overlay. Auto-calculated if not set. */
    readonly editModeWidth = input(undefined, { transform: numberAttribute });

    /** Emitted when the inline edit is saved successfully. */
    protected readonly saved = output();
    /** Emitted when the inline edit is canceled and changes are discarded. */
    protected readonly canceled = output();

    /** @docs-private */
    protected readonly viewModeTemplateRef = contentChild.required(KbqInlineEditViewMode);
    /** @docs-private */
    protected readonly editModeTemplateRef = contentChild.required(KbqInlineEditEditMode);
    /** @docs-private */
    protected readonly menu = contentChild(KbqInlineEditMenu);
    /** @docs-private */
    protected readonly label = contentChild(KbqLabel);
    /** @docs-private */
    protected readonly formFieldRef = contentChild(KbqFormField);

    /** @docs-private */
    protected readonly tooltipTrigger = viewChild.required(KbqTooltipTrigger);
    /** @docs-private */
    protected readonly overlayOrigin = viewChild(CdkOverlayOrigin);
    /** @docs-private */
    protected readonly overlayDir = viewChild(CdkConnectedOverlay);

    /** @docs-private */
    protected readonly mode = signal<'view' | 'edit' | 'read'>('view');
    /** @docs-private */
    protected readonly overlayWidth = signal<number | string>('');

    /** @docs-private */
    protected readonly className = computed(() => `${baseClass}_${this.mode()}`);
    /** @docs-private */
    protected readonly isEditMode = computed(() => this.mode() === 'edit');
    /** @docs-private */
    protected readonly tabIndex = computed(() => (this.isEditMode() || this.disabled() ? -1 : 0));

    /** @docs-private */
    protected readonly placements = PopUpPlacements;

    /** @docs-private */
    protected readonly colors = KbqComponentColors;

    /** @docs-private */
    private readonly elementRef = inject(ElementRef);

    private initialValue: unknown;

    /** @docs-private */
    protected toggleMode(): void {
        this.mode.update((mode) => (mode === 'view' ? 'edit' : 'view'));
    }

    /** @docs-private */
    protected onClick(event: Event): void {
        if (this.disabled() || this.isEditMode()) return;

        event.stopPropagation();
        this.toggleMode();
    }

    /** @docs-private */
    protected onAttach(): void {
        const formFieldRef = this.formFieldRef();

        this.setOverlayWidth();

        if (formFieldRef?.control) {
            formFieldRef.control.stateChanges
                .pipe(takeUntil(this.overlayDir()!.detach.asObservable()))
                .subscribe(() => {
                    if (!this.isInvalid()) {
                        const tooltipTrigger = this.tooltipTrigger();

                        tooltipTrigger.isOpen && tooltipTrigger.hide();
                    }
                });
        }

        setTimeout(() => {
            if (formFieldRef) {
                formFieldRef.focus();
                this.initialValue = this.getValue();

                const input: HTMLInputElement | HTMLTextAreaElement | null =
                    this.overlayDir()!.overlayRef.overlayElement.querySelector('input,textarea');

                if (this.initialValue) input?.select();
            }
        }, 0);
    }

    /** @docs-private */
    protected save($event?: Event): void {
        $event?.stopPropagation();

        if (this.isInvalid()) {
            this.showTooltipOnError() && this.tooltipTrigger()?.show();
        } else {
            this.toggleMode();
            this.saved.emit();
        }
    }

    /** @docs-private */
    protected cancel(): void {
        this.setValue(this.initialValue);

        this.toggleMode();
        this.canceled.emit();
    }

    /** @docs-private */
    protected onOverlayKeydown(event: KeyboardEvent): void {
        const { target, key } = event;

        switch (key) {
            case 'Escape': {
                this.cancel();
                break;
            }
            case 'Enter': {
                if (hasModifierKey(event, 'ctrlKey', 'metaKey') || !(target instanceof HTMLTextAreaElement)) {
                    this.save();
                }

                break;
            }
            default: {
                return;
            }
        }
    }

    private isInvalid(): boolean {
        const formFieldRef = this.formFieldRef();

        if (!formFieldRef) return false;

        return formFieldRef.control.errorState;
    }

    private getValue() {
        const control = this.coerceControl();

        return control?.value;
    }

    private setValue<T>(value: T): void {
        const control = this.coerceControl();

        if (!control) return;

        if (control instanceof AbstractControl) {
            control.setValue(value);
        } else {
            control.value = value;
        }
    }

    private coerceControl() {
        const formFieldRef = this.formFieldRef();

        if (!formFieldRef) return null;

        if (formFieldRef.control.ngControl instanceof NgControl) {
            return formFieldRef.control.ngControl.control;
        }

        return formFieldRef.control;
    }

    private setOverlayWidth(): void {
        const editModeWidth = this.editModeWidth();

        if (editModeWidth) {
            this.overlayWidth.set(editModeWidth);

            return;
        }

        const elementRef: ElementRef<HTMLElement> | undefined = this.label()
            ? this.overlayOrigin()?.elementRef
            : this.elementRef;

        this.overlayWidth.set(elementRef?.nativeElement.offsetWidth ?? '');
    }
}
