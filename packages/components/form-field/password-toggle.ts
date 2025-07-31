import { NgClass } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    Input,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_FORM_FIELD_REF, PopUpTriggers } from '@koobiq/components/core';
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
    standalone: true,
    imports: [NgClass, KbqIconModule, KbqToolTipModule],
    selector: `kbq-password-toggle`,
    exportAs: 'kbqPasswordToggle',
    template: `
        <i kbq-icon-button="" color="contrast-fade" [ngClass]="iconClass" [autoColor]="true"></i>
    `,
    styleUrls: ['password-toggle.scss'],
    host: {
        class: 'kbq-password-toggle',

        // legacy style for backward compatibility
        '[style.visibility]': 'visibility',
        '[class.cdk-visually-hidden]': 'visibility === "hidden"',
        '[attr.aria-hidden]': 'visibility === "hidden"',

        '(click)': 'toggle($event)',
        '(keydown.ENTER)': 'toggle($event)',
        '(keydown.SPACE)': 'toggle($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPasswordToggle extends KbqTooltipTrigger {
    // @TODO fix types (#DS-2915)
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;

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
        return this.control.disabled || this.control.empty ? 'hidden' : 'visible';
    }

    constructor() {
        super();

        this.trigger = `${PopUpTriggers.Hover}`;
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
}
