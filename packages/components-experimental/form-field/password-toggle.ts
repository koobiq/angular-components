import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KBQ_FORM_FIELD_REF } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputPassword } from '@koobiq/components/input';
import { KbqFormField } from './form-field';

const getKbqPasswordToggleMissingControlError = (): Error => {
    return Error('kbq-password-toggle should use with kbqInputPassword');
};

/** Component which changes password visibility. */
@Component({
    selector: `kbq-password-toggle`,
    imports: [NgClass, KbqIconModule],
    template: `
        <i color="contrast-fade" kbq-icon-button="" [ngClass]="icon" [autoColor]="true"></i>
    `,
    styleUrl: './password-toggle.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqPasswordToggle',
    host: {
        class: 'kbq-password-toggle___EXPERIMENTAL',
        '[style.visibility]': 'visible ? "visible" : "hidden"',
        '[attr.aria-hidden]': '!visible',
        '(click)': 'toggleType($event)',
        '(keydown.ENTER)': 'toggleType($event)',
        '(keydown.SPACE)': 'toggleType($event)'
    }
})
export class KbqPasswordToggle {
    // @TODO fix types (#DS-2915)
    private readonly formField = inject(KBQ_FORM_FIELD_REF, { optional: true }) as unknown as KbqFormField | undefined;

    /** Form field password control. */
    protected get control(): KbqInputPassword {
        const control = this.formField?.control;

        if (!(control instanceof KbqInputPassword)) {
            throw getKbqPasswordToggleMissingControlError();
        }

        return control;
    }

    /** The icon selector. */
    protected get icon(): string {
        return this.control.elementType === 'password' ? 'kbq-eye_16' : 'kbq-eye-slash_16';
    }

    /** Whether to display the password toggle. */
    get visible(): boolean {
        return !this.formField?.disabled;
    }

    /** Toggles the password visibility. */
    protected toggleType(event: KeyboardEvent | MouseEvent): void {
        event.stopPropagation();

        this.control.toggleType();
    }
}
