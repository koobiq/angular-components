import { animate, style, transition, trigger } from '@angular/animations';
import { CdkMonitorFocus, CdkTrapFocus } from '@angular/cdk/a11y';
import { hasModifierKey } from '@angular/cdk/keycodes';
import { CdkConnectedOverlay, CdkOverlayOrigin, Overlay, ScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
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
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl, NgControl } from '@angular/forms';
import { KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqAnimationCurves,
    KbqAnimationDurations,
    KbqComponentColors,
    KbqFocusMonitor,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqFormField, KbqLabel } from '@koobiq/components/form-field';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqSelect } from '@koobiq/components/select';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqTreeSelect } from '@koobiq/components/tree-select';
import { skip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

const KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION = trigger('panelAnimation', [
    transition(':enter', [
        style({ transform: 'translateY(100%)', opacity: 0 }),
        animate(
            `${KbqAnimationDurations.Instant} ${KbqAnimationCurves.DecelerationCurve}`,
            style({ transform: 'translateY(0%)', opacity: 1 })
        )])

]);

const baseClass = 'kbq-inline-edit';

/** @docs-private */
@Directive({
    standalone: true,
    selector: '[kbqFocusRegionItem]',
    exportAs: 'kbqFocusRegionItem',
    host: {
        '(focusin)': 'isFocused = true',
        '(keydown.tab)': 'onTabOut($event)',
        '(keydown.shift.tab)': 'onTabOut($event)'
    }
})
export class KbqFocusRegionItem {
    readonly tabOut = output<KeyboardEvent>();

    protected isFocused = false;

    protected onTabOut(event: KeyboardEvent) {
        if (this.isFocused) {
            this.tabOut.emit(event);
        }

        this.isFocused = !this.isFocused;
    }
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
    /** @docs-private */
    protected readonly dropdownTrigger = inject(KbqDropdownTrigger, { optional: true });
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
        '[class]': 'className()',
        '[class.kbq-inline-edit_with-label]': '!!label()',
        '[class.kbq-inline-edit_with-menu]': '!!menu()',
        '[class.kbq-inline-edit_disabled]': 'disabled()',
        '(click)': 'onClick($event)',
        '(keydown.enter)': 'onClick($event)',
        '(keydown.space)': 'onClick($event)'
    },
    hostDirectives: [KbqFocusMonitor],
    imports: [
        CdkConnectedOverlay,
        CdkOverlayOrigin,
        KbqButtonModule,
        KbqIcon,
        KbqTooltipTrigger,
        KbqFocusRegionItem,
        CdkTrapFocus,
        CdkMonitorFocus
    ],
    animations: [KBQ_INLINE_EDIT_ACTION_BUTTONS_ANIMATION],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqInlineEdit {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly kbqFocusMonitor = inject(KbqFocusMonitor, { host: true });
    private readonly overlay = inject(Overlay);
    private readonly document = inject(DOCUMENT);

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
    /** User-defined tooltip placement */
    readonly tooltipPlacement = input<PopUpPlacements>();
    /** Handler function to retrieve the current value */
    readonly getValueHandler = input<() => unknown>();
    /** Handler function to update the value */
    readonly setValueHandler = input<(value: any) => void>();

    /** Emitted when the inline edit is saved successfully. */
    protected readonly saved = output();
    /** Emitted when the inline edit is canceled and changes are discarded. */
    protected readonly canceled = output();
    /** Emitted when mode switched to edit/view */
    protected readonly modeChange = output<'view' | 'edit'>();

    /** @docs-private */
    protected readonly menu = contentChild(KbqInlineEditMenu);
    /** @docs-private */
    protected readonly label = contentChild(KbqLabel);
    /** @docs-private */
    protected readonly formFieldRef = contentChild(KbqFormField);

    /** @docs-private */
    protected readonly overlayOrigin = viewChild.required(CdkOverlayOrigin);
    /** @docs-private */
    protected readonly tooltipTrigger = viewChild(KbqTooltipTrigger);
    /** @docs-private */
    protected readonly overlayDir = viewChild(CdkConnectedOverlay);
    /** @docs-private */
    protected readonly regionItems = viewChildren(KbqFocusRegionItem);

    /** @docs-private */
    protected readonly mode = signal<'view' | 'edit'>('view');
    /** @docs-private */
    protected readonly overlayWidth = signal<number | string>('');
    /** @docs-private */
    protected readonly scrollStrategy = signal<ScrollStrategy>(this.overlay.scrollStrategies.reposition());
    /** @docs-private */
    readonly modeAsReadonly = computed(() => this.mode());

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

    private initialValue: unknown;

    constructor() {
        toObservable(this.mode)
            .pipe(skip(1), takeUntilDestroyed())
            .subscribe((currentMode) => this.modeChange.emit(currentMode));
    }

    /** @docs-private */
    protected toggleMode(): void {
        this.mode.update((mode) => (mode === 'view' ? 'edit' : 'view'));
    }

    /** @docs-private */
    protected onClick(event: Event): void {
        if (this.disabled() || this.isEditMode()) return;

        event.preventDefault();
        event.stopPropagation();
        this.kbqFocusMonitor.focusVia(this.overlayOrigin().elementRef, 'program');

        this.toggleMode();
    }

    /** @docs-private */
    protected onAttach(): void {
        this.setOverlayWidth();
        this.setOverlayKeydownListener();

        const formFieldRef = this.formFieldRef();

        formFieldRef?.control.stateChanges
            .pipe(takeUntil(this.overlayDir()!.overlayRef.detachments()))
            .subscribe(() => {
                if (!this.isInvalid()) {
                    const tooltipTrigger = this.tooltipTrigger();

                    tooltipTrigger?.isOpen && tooltipTrigger?.hide();
                }
            });

        setTimeout(() => {
            formFieldRef?.focus();
            this.initialValue = this.getValue();

            const input = this.getInputNativeElement();

            if (this.initialValue) input?.select();

            if (formFieldRef) {
                this.openPanel(formFieldRef);
            }
        }, 0);
    }

    /** @docs-private */
    protected save($event?: Event): void {
        if (this.isInvalid()) {
            $event?.stopPropagation();
            this.showTooltipOnError() && this.tooltipTrigger()?.show();
        } else {
            this.toggleMode();
            this.saved.emit();
        }
    }

    /** @docs-private */
    protected cancel(): void {
        this.setValue(this.initialValue);

        const input = this.getInputNativeElement();

        if (input) {
            input.selectionStart = input.selectionEnd = null;
        }

        this.toggleMode();
        this.canceled.emit();
    }

    /** @docs-private */
    protected onOverlayKeydown(event: KeyboardEvent): void {
        const { target, key } = event;

        this.formFieldRef()?.control.ngControl?.control?.markAsTouched();

        switch (key) {
            case 'Escape': {
                this.cancel();
                break;
            }
            case 'Enter': {
                if (hasModifierKey(event, 'ctrlKey', 'metaKey') || !(target instanceof HTMLTextAreaElement)) {
                    event.preventDefault();
                    this.formFieldRef()?.control.ngControl?.control?.markAsTouched();
                    setTimeout(() => this.save(event));
                }

                break;
            }
            default: {
                return;
            }
        }
    }

    /**
     * Sets up Tab key listeners on region items.
     * Single item: Tab moves to next edit.
     * Multiple items: Shift+Tab on first or Tab on last moves to next edit.
     */
    private setOverlayKeydownListener(): void {
        const regionItems = this.regionItems();

        if (regionItems.length === 0) return;

        const firstItem = regionItems.at(0);
        const lastItem = regionItems.at(regionItems.length - 1);

        if (regionItems.length === 1) {
            firstItem?.tabOut.subscribe((event) => this.saveAndFocusNextInlineEdit(event));
        } else {
            firstItem?.tabOut.subscribe(
                (event) => hasModifierKey(event, 'shiftKey') && this.saveAndFocusNextInlineEdit(event)
            );

            lastItem?.tabOut.subscribe(
                (event) => !hasModifierKey(event, 'shiftKey') && this.saveAndFocusNextInlineEdit(event)
            );
        }
    }

    private saveAndFocusNextInlineEdit(event: KeyboardEvent): void {
        this.save(event);
        if (this.isInvalid()) return;

        setTimeout(() => {
            const activeElement = this.document.activeElement;

            if (activeElement?.classList?.contains('kbq-inline-edit__focus_container')) {
                activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            }
        });
    }

    private isInvalid(): boolean {
        const formFieldRef = this.formFieldRef();

        if (!formFieldRef) return false;

        return formFieldRef.invalid;
    }

    private getValue() {
        const getValueHandler = this.getValueHandler();

        if (getValueHandler) return getValueHandler();

        const control = this.coerceControl();

        return control?.value;
    }

    private setValue<T>(value: T): void {
        const setValue = this.setValueHandler();

        if (setValue) {
            setValue(this.initialValue);

            return;
        }

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
            ? this.overlayOrigin().elementRef
            : this.elementRef;

        this.overlayWidth.set(elementRef?.nativeElement.offsetWidth ?? '');
    }

    // @TODO refactor this (#DS-4181)
    private openPanel(formFieldRef: KbqFormField) {
        const control = formFieldRef.control;

        if (control instanceof KbqSelect || control instanceof KbqTreeSelect) {
            control.open();
        } else if (control instanceof KbqAutocompleteTrigger) {
            control.openPanel();
        }
    }

    private getInputNativeElement(): HTMLInputElement | HTMLTextAreaElement | null {
        return this.overlayDir()?.overlayRef.overlayElement.querySelector('input:not([type="file"]),textarea') ?? null;
    }
}
