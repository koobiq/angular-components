import { animate, style, transition, trigger } from '@angular/animations';
import { CdkTrapFocus } from '@angular/cdk/a11y';
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

@Directive({
    standalone: true,
    selector: '[kbqInlineEditViewMode]',
    exportAs: 'kbqInlineEditViewMode'
})
export class KbqInlineEditViewMode {
    readonly templateRef = inject(TemplateRef);
}

@Directive({
    standalone: true,
    selector: '[kbqInlineEditEditMode]',
    exportAs: 'kbqInlineEditEditMode'
})
export class KbqInlineEditEditMode {
    readonly templateRef = inject(TemplateRef);
}

@Directive({
    standalone: true,
    selector: '[kbqInlineEditPlaceholder]',
    exportAs: 'kbqInlineEditPlaceholder',
    host: {
        class: 'kbq-inline-edit__placeholder'
    }
})
export class KbqInlineEditPlaceholder {}

@Directive({
    standalone: true,
    selector: '[kbqInlineEditValidationTooltip]',
    exportAs: 'kbqInlineEditValidationTooltip'
})
export class KbqInlineEditValidationTooltip {
    readonly templateRef = inject(TemplateRef);
}

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
    readonly placeholder = input<string>();
    readonly showActions = input(false, { transform: booleanAttribute });
    readonly showTooltipOnError = input(true, { transform: booleanAttribute });
    readonly validationTooltip = input<string>();
    readonly disabled = input(false, { transform: booleanAttribute });

    protected readonly saved = output();
    protected readonly canceled = output();

    protected readonly viewModeTemplateRef = contentChild.required(KbqInlineEditViewMode);
    protected readonly editModeTemplateRef = contentChild.required(KbqInlineEditEditMode);
    protected readonly menu = contentChild(KbqInlineEditMenu);
    protected readonly label = contentChild(KbqLabel);
    protected readonly formFieldRef = contentChild(KbqFormField);
    protected readonly customTooltipContent = contentChild(KbqInlineEditValidationTooltip);

    protected readonly tooltipTrigger = viewChild(KbqTooltipTrigger);
    protected readonly overlayOrigin = viewChild(CdkOverlayOrigin);

    protected readonly mode = signal<'view' | 'edit' | 'read'>('view');

    protected readonly className = computed(() => `${baseClass}_${this.mode()}`);
    protected readonly isEditMode = computed(() => this.mode() === 'edit');
    protected readonly tabIndex = computed(() => (this.isEditMode() || this.disabled() ? -1 : 0));
    protected readonly overlayWidth = computed<number | string>(() => {
        const elementRef: ElementRef<HTMLElement> | undefined = this.label()
            ? this.overlayOrigin()?.elementRef
            : this.elementRef;

        return elementRef?.nativeElement.offsetWidth ?? '';
    });

    protected readonly elementRef = inject(ElementRef);

    private initialValue: unknown;

    /** @docs-private */
    toggleMode(): void {
        this.mode.update((mode) => (mode === 'view' ? 'edit' : 'view'));
    }

    /** @docs-private */
    onClick(event: Event): void {
        if (this.disabled() || this.isEditMode()) return;

        event.stopPropagation();
        this.toggleMode();
    }

    /** @docs-private */
    onAttach() {
        const formFieldRef = this.formFieldRef();

        setTimeout(() => {
            if (formFieldRef) {
                formFieldRef.focus();
                this.initialValue = this.getValue();
            }
        });
    }

    /** @docs-private */
    save($event?: Event): void {
        $event?.stopPropagation();

        if (this.isInvalid()) {
            this.showTooltipOnError() && this.tooltipTrigger()?.show();
        } else {
            this.toggleMode();
            this.saved.emit();
        }
    }

    /** @docs-private */
    cancel() {
        this.setValue(this.initialValue);

        this.toggleMode();
        this.canceled.emit();
    }

    /** @docs-private */
    onOverlayKeydown(event: KeyboardEvent) {
        const { target, key } = event;

        switch (key) {
            case 'Escape': {
                this.cancel();
                break;
            }
            case 'Enter': {
                if (target instanceof HTMLTextAreaElement) break;

                this.save();
                break;
            }
            default: {
                return;
            }
        }
    }

    private isInvalid(): boolean {
        const formFieldRef = this.formFieldRef();

        if (!formFieldRef) return true;

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

        if (!formFieldRef) return;

        if (formFieldRef.control.ngControl instanceof NgControl) {
            return formFieldRef.control.ngControl.control;
        }

        return formFieldRef.control;
    }

    /** @docs-private */
    protected readonly placements = PopUpPlacements;

    /** @docs-private */
    protected readonly colors = KbqComponentColors;
}
