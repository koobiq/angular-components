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
    signal,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqAnimationCurves, KbqAnimationDurations } from '@koobiq/components/core';
import { KbqFormField, KbqLabel } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
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

@Component({
    standalone: true,
    selector: 'kbq-inline-edit',
    exportAs: 'kbqInlineEdit',
    templateUrl: './inline-edit.html',
    styleUrls: ['./inline-edit.scss', './inline-edit-tokens.scss'],
    host: {
        class: baseClass,
        '[class.kbq-inline-edit_with-label]': '!!label()',
        '[tabindex]': 'tabIndex()',
        '[class]': 'className()',
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
        KbqIcon
    ],
    animations: [KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqInlineEdit {
    readonly placeholder = input<string>();
    readonly showActions = input(false, { transform: booleanAttribute });

    protected readonly viewModeTemplateRef = contentChild.required(KbqInlineEditViewMode);
    protected readonly editModeTemplateRef = contentChild.required(KbqInlineEditEditMode);
    protected readonly label = contentChild(KbqLabel);
    protected readonly formFieldRef = contentChild(KbqFormField);
    protected readonly overlayOrigin = viewChild(CdkOverlayOrigin);

    protected readonly mode = signal<'view' | 'edit'>('view');

    protected readonly className = computed(() => `${baseClass}_${this.mode()}`);
    protected readonly isEditMode = computed(() => this.mode() === 'edit');
    protected readonly tabIndex = computed(() => (this.isEditMode() ? -1 : 0));
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
        event.stopPropagation();
        this.toggleMode();
    }

    /** @docs-private */
    onAttach() {
        const formFieldRef = this.formFieldRef();

        setTimeout(() => {
            if (formFieldRef) {
                formFieldRef.focus();
                (formFieldRef.control as any).placeholder = this.placeholder();

                this.initialValue = this.getValue();
            }
        });
    }

    /** @docs-private */
    onOutsideClick() {
        this.save();
        this.toggleMode();
    }

    /** @docs-private */
    save() {
        this.validate();
    }

    /** @docs-private */
    cancel() {
        this.setValue(this.initialValue);

        this.toggleMode();
    }

    /** @docs-private */
    onKeydown(event: KeyboardEvent) {
        const { target, key } = event;

        switch (key) {
            case 'Escape': {
                this.cancel();
                break;
            }
            case 'Enter': {
                if (target instanceof HTMLTextAreaElement) break;

                this.onOutsideClick();
                break;
            }
            default: {
                return;
            }
        }
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

    private validate(): void {
        console.log('validate');
    }
}
