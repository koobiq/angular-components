import { NgClass } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Inject,
    Input,
    TemplateRef,
    ViewChild,
    ViewEncapsulation,
    forwardRef
} from '@angular/core';
import { KBQ_FORM_FIELD_REF, KbqFormFieldRef, PopUpTriggers } from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

/**
 * @TODO move into input module
 */

@Component({
    standalone: true,
    selector: `kbq-password-toggle`,
    exportAs: 'kbqPasswordToggle',
    template: `
        <i
            [ngClass]="iconClass"
            kbq-icon-button=""
        ></i>
    `,
    styleUrl: './password-toggle.scss',
    host: {
        class: 'kbq-password-toggle',

        '[style.visibility]': 'visibility',

        '(click)': 'toggle($event)',
        '(keydown.ENTER)': 'toggle($event)',
        '(keydown.SPACE)': 'toggle($event)'
    },
    /**
     * @TODO Component doesn't work without KbqToolTipModule
     */
    imports: [NgClass, KbqIconModule, KbqToolTipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPasswordToggle extends KbqTooltipTrigger implements AfterViewInit {
    @ViewChild(KbqIconButton) icon: KbqIconButton;
    @Input('kbqTooltipNotHidden')
    get content(): string | TemplateRef<any> {
        return (this.formField.control as any).elementType === 'password' ? this.kbqTooltipHidden : this._content;
    }

    set content(content: string | TemplateRef<any>) {
        this._content = content;

        this.updateData();
    }

    @Input() kbqTooltipHidden: string | TemplateRef<any>;

    get hidden(): boolean {
        return (this.formField.control as any).elementType === 'password';
    }

    get iconClass(): string {
        return this.hidden ? 'mc-eye_16' : 'mc-eye-crossed_16';
    }

    get visibility(): string {
        return this.disabled && this.formField.control.empty ? 'hidden' : 'visible';
    }

    constructor(
        @Inject(forwardRef(() => KBQ_FORM_FIELD_REF)) private formField: KbqFormFieldRef,
        private changeDetector: ChangeDetectorRef
    ) {
        super();

        this.trigger = `${PopUpTriggers.Hover}`;
    }

    ngAfterViewInit(): void {
        this.formField.control?.stateChanges.subscribe(this.updateState);
    }

    toggle(event: KeyboardEvent) {
        this.hide();

        const input = this.formField.control as any;

        input.toggleType();

        this.updateData();

        event.preventDefault();
    }

    private updateState = () => {
        this.icon.hasError = this.formField.control.errorState;

        this.changeDetector.markForCheck();
    };
}
