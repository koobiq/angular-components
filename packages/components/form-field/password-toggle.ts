import { FocusMonitor } from '@angular/cdk/a11y';

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
import {
    KBQ_FORM_FIELD_REF,
    kbqInjectA11yLocaleConfiguration,
    kbqInjectNativeElement,
    PopUpTriggers
} from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { EMPTY } from 'rxjs';
import { KbqFormField } from './form-field';
import { KbqFormFieldControl } from './form-field-control';

// @TODO Temporary solution to resolve circular dependency (#DS-3893)
type KbqInputPassword = KbqFormFieldControl<unknown> & {
    elementType: string;
    toggleType: () => void;
};

// @TODO Temporary solution to resolve circular dependency (#DS-3893)
const isInputPassword = (control: KbqFormFieldControl<unknown>): control is KbqInputPassword => {
    return 'elementType' in control;
};

const getKbqPasswordToggleMissingControlError = (): Error => {
    return Error('kbq-password-toggle should use with kbqInputPassword');
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

    // @TODO fix types (#DS-2915)
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;

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
    private get control(): KbqInputPassword {
        const control = this.formField?.control();

        if (!control || !isInputPassword(control)) {
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

        // `stateChanges` is owned by the control and outlives the toggle, so the subscription has to be torn
        // down explicitly. Subscribing after render also keeps it off the server, matching KbqReactivePasswordHint.
        afterNextRender(() => {
            (this.formField?.control()?.stateChanges || EMPTY)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(this.updateState);
        });
    }

    /**
     * @docs-private
     */
    ngAfterContentInit(): void {
        this.updateState();
    }

    /**
     * @docs-private
     */
    ngAfterViewInit(): void {
        this.focusMonitor.monitor(this.nativeElement, true);
    }

    /**
     * @docs-private
     */
    ngOnDestroy() {
        this.focusMonitor.stopMonitoring(this.nativeElement);
    }

    /**
     * @docs-private
     */
    toggle(event: Event) {
        this.hide();

        this.control.toggleType();

        this.updateData();

        event.preventDefault();
    }

    private updateState = () => {
        this.hasError = !!this.formField?.control()?.errorState;

        this.changeDetectorRef.markForCheck();
    };
}
