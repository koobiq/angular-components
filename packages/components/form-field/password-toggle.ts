import { FocusMonitor } from '@angular/cdk/a11y';

import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Input,
    numberAttribute,
    OnDestroy,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_FORM_FIELD_REF, kbqInjectNativeElement, PopUpTriggers } from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
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
        <ng-content />
    `,
    styleUrls: ['password-toggle.scss', '../icon/icon-button.scss', '../icon/icon-button-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqPasswordToggle',
    host: {
        class: 'kbq-password-toggle kbq kbq-icon-button kbq-contrast-fade',
        '[class.kbq-error]': 'hasError',
        '[class.kbq-eye_16]': 'hidden',
        '[class.kbq-eye-slash_16]': '!hidden',
        // legacy style for backward compatibility
        '[style.visibility]': 'visibility',
        '[class.cdk-visually-hidden]': 'visibility === "hidden"',
        '[attr.aria-hidden]': 'visibility === "hidden"',
        '[attr.tabindex]': 'tabindex',
        '(click)': 'toggle($event)',
        '(keydown.ENTER)': 'toggle($event)',
        '(keydown.SPACE)': 'toggle($event)'
    }
})
export class KbqPasswordToggle extends KbqTooltipTrigger implements AfterViewInit, OnDestroy, AfterContentInit {
    protected readonly nativeElement = kbqInjectNativeElement();
    protected readonly focusMonitor = inject(FocusMonitor);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    // @TODO fix types (#DS-2915)
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;

    @Input({ transform: numberAttribute }) tabindex: number = 0;

    /**
     * @docs-private
     */
    @ViewChild(KbqIconButton) readonly icon: KbqIconButton;

    @Input('kbqTooltipNotHidden')
    get content(): string | TemplateRef<any> {
        return this.control.elementType === 'password' ? this.kbqTooltipHidden : this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    @Input() kbqTooltipHidden: string | TemplateRef<any>;

    protected hasError: boolean = false;

    /** Form field password control. */
    private get control(): KbqInputPassword {
        const control = this.formField?.control;

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

    constructor() {
        super();

        this.trigger = `${PopUpTriggers.Hover}`;
    }

    /**
     * @docs-private
     */
    ngAfterContentInit(): void {
        this.formField?.control?.stateChanges.subscribe(this.updateState);

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
    toggle(event: KeyboardEvent) {
        this.hide();

        const input = this.control;

        input.toggleType();

        this.updateData();

        event.preventDefault();
    }

    private updateState = () => {
        this.hasError = !!this.formField?.control?.errorState;

        this.changeDetectorRef.markForCheck();
    };
}
