import { FocusMonitor } from '@angular/cdk/a11y';

import { F8 } from '@angular/cdk/keycodes';
import {
    AfterContentInit,
    afterNextRender,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Input,
    input,
    numberAttribute,
    OnDestroy,
    TemplateRef,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { kbqInjectA11yLocaleConfiguration, kbqInjectNativeElement, PopUpTriggers } from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { EMPTY, fromEvent } from 'rxjs';
import { KBQ_FORM_FIELD } from './form-field';
import { KbqFormFieldControl } from './form-field-control';

/**
 * Narrow structural contract for `kbqInputPassword`, duck-typed here to avoid a circular
 * dependency between `@koobiq/components/form-field` and `@koobiq/components/input`.
 */
type KbqPasswordToggleControl = KbqFormFieldControl<unknown> & {
    readonly controlType: 'input-password';
    elementType: 'text' | 'password';
    toggleType: () => void;
};

/**
 * Checks whether the given control structurally matches `KbqPasswordToggleControl`.
 */
const isPasswordToggleControl = (control: unknown): control is KbqPasswordToggleControl => {
    return (
        !!control &&
        typeof control === 'object' &&
        'controlType' in control &&
        control.controlType === 'input-password' &&
        'elementType' in control &&
        'toggleType' in control &&
        typeof control.toggleType === 'function'
    );
};

const getKbqPasswordToggleMissingControlError = (): Error => {
    return Error('You should use kbq-password-toggle with kbqInputPassword');
};

/** Component which changes password visibility. */
@Component({
    selector: `kbq-password-toggle`,
    imports: [KbqIconModule, KbqToolTipModule],
    template: `
        <ng-content>
            <i
                role="button"
                [attr.aria-label]="accessibleName"
                [attr.aria-pressed]="!hidden"
                [color]="hasError ? 'error' : 'contrast-fade'"
                [kbq-icon-button]="iconClass"
                [tabindex]="tabindex()"
            ></i>
        </ng-content>
    `,
    styleUrls: ['password-toggle.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-password-toggle',
        // `visibility` is what takes the disabled toggle out of the tab order and the accessibility tree;
        // `cdk-visually-hidden` and `aria-hidden` are kept for backward compatibility with consumer styles.
        '[style.visibility]': 'visibility',
        '[class.cdk-visually-hidden]': 'visibility === "hidden"',
        '[attr.aria-hidden]': 'visibility === "hidden"',
        '(click)': 'toggle($event)',
        '(keydown.ENTER)': 'toggle($event)',
        '(keydown.SPACE)': 'toggle($event)'
    },
    exportAs: 'kbqPasswordToggle'
})
export class KbqPasswordToggle extends KbqTooltipTrigger implements AfterViewInit, OnDestroy, AfterContentInit {
    protected readonly nativeElement = kbqInjectNativeElement();
    protected readonly focusMonitor = inject(FocusMonitor);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    private readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();
    private readonly formField = inject(KBQ_FORM_FIELD, { optional: true });

    readonly tabindex = input<number, unknown>(0, { transform: numberAttribute });

    /**
     * @docs-private
     */
    readonly icon = viewChild.required(KbqIconButton);

    /**
     * Tooltip shown while the password is visible. Reading it resolves to the tooltip matching the current
     * visibility, so that the base trigger renders the right one.
     */
    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqTooltipNotHidden')
    get content(): string | TemplateRef<any> {
        return this.control.elementType === 'password' ? this.kbqTooltipHidden() : this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    /** Tooltip shown while the password is hidden. */
    readonly kbqTooltipHidden = input<string | TemplateRef<any>>(undefined!);

    protected hasError: boolean = false;

    /** Form field password control. */
    private get control(): KbqPasswordToggleControl {
        const control = this.formField?.control();

        if (!isPasswordToggleControl(control)) {
            throw getKbqPasswordToggleMissingControlError();
        }

        return control;
    }

    /**
     * @docs-private
     */
    get hidden(): boolean {
        return this.control.elementType === 'password';
    }

    /**
     * @docs-private
     */
    get iconClass(): string {
        return this.hidden ? 'kbq-eye_16' : 'kbq-eye-slash_16';
    }

    /**
     * @docs-private
     */
    get visibility(): 'hidden' | 'visible' {
        return this.control.disabled ? 'hidden' : 'visible';
    }

    /**
     * Accessible name of the icon-only toggle, describing the action it performs.
     *
     * @docs-private
     */
    protected get accessibleName(): string {
        const { showPassword, hidePassword } = this.a11yLocaleConfiguration();

        return this.hidden ? showPassword : hidePassword;
    }

    constructor() {
        super();

        this.trigger = `${PopUpTriggers.Hover}`;

        const keydownTarget = this.formField?.elementRef.nativeElement;

        if (keydownTarget) {
            fromEvent<KeyboardEvent>(keydownTarget, 'keydown')
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event) => this.onFormFieldKeyDown(event));
        }

        // `stateChanges` is owned by the control and outlives the toggle, so the subscription has to be torn
        // down explicitly. Subscribing after render also keeps it off the server, matching KbqReactivePasswordHint.
        afterNextRender(() => {
            (this.formField?.control()?.stateChanges || EMPTY)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(this.updateState);
        });
    }

    ngAfterContentInit(): void {
        this.updateState();
    }

    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.nativeElement, true);
    }

    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.nativeElement);
    }

    /**
     * @docs-private
     */
    toggle(event: Event): void {
        if (this.control.disabled) return;

        this.hide();

        this.control.toggleType();

        this.updateData();

        event.preventDefault();
    }

    /**
     * Toggles password visibility for the Alt+F8 shortcut.
     */
    private onFormFieldKeyDown(event: KeyboardEvent): void {
        if (event.altKey && event.keyCode === F8) {
            this.toggle(event);
        }
    }

    private updateState = () => {
        this.hasError = !!this.control.errorState;

        this.changeDetectorRef.markForCheck();
    };
}
