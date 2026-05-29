import { CdkTrapFocus } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    Inject,
    InjectionToken,
    Input,
    Optional,
    ViewEncapsulation,
    output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { Subject } from 'rxjs';
import { kbqPopoverAnimations } from './popover-animations';
import { KbqPopoverComponent, KbqPopoverTrigger } from './popover.component';

export const KBQ_POPOVER_CONFIRM_TEXT = new InjectionToken<string>('');
export const KBQ_POPOVER_CONFIRM_BUTTON_TEXT = new InjectionToken<string>('');

@Component({
    selector: 'kbq-popover-confirm-component',
    imports: [
        CdkTrapFocus,
        KbqButtonModule
    ],
    templateUrl: './popover-confirm.component.html',
    styleUrls: ['./popover.scss', './popover-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    animations: [kbqPopoverAnimations.popoverState],
    preserveWhitespaces: false
})
export class KbqPopoverConfirmComponent extends KbqPopoverComponent {
    onConfirm = new Subject<void>();
    confirmButtonText: string;

    confirmText: string;
}

@Directive({
    selector: '[kbqPopoverConfirm]',
    host: {
        '[class.kbq-popover_open]': 'isOpen',
        '(keydown)': 'keydownHandler($event)',
        '(touchend)': 'touchendHandler()'
    },
    exportAs: 'kbqPopoverConfirm'
})
export class KbqPopoverConfirmTrigger extends KbqPopoverTrigger {
    readonly confirm = output<void>();

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverConfirmText')
    get confirmText(): string {
        return this._confirmText;
    }

    set confirmText(value: string) {
        this._confirmText = value;

        this.updateData();
    }

    private _confirmText: string;

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input('kbqPopoverConfirmButtonText')
    get confirmButtonText(): string {
        return this._confirmButtonText;
    }

    set confirmButtonText(value: string) {
        this._confirmButtonText = value;

        this.updateData();
    }

    private _confirmButtonText: string = 'Да';

    constructor(
        @Optional() @Inject(KBQ_POPOVER_CONFIRM_TEXT) confirmText: string,
        @Optional() @Inject(KBQ_POPOVER_CONFIRM_BUTTON_TEXT) confirmButtonText: string
    ) {
        super();

        this.confirmText = confirmText || 'Вы уверены, что хотите продолжить?';
        this.confirmButtonText = confirmButtonText || 'Да';
    }

    updateData() {
        if (!this.instance) {
            return;
        }

        super.updateData();
        this.setupButtonEvents();
        this.instance.confirmButtonText = this.confirmButtonText;
        this.instance.confirmText = this.confirmText;
    }

    setupButtonEvents() {
        this.instance.onConfirm.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            // TODO: The 'emit' function requires a mandatory void argument
            this.confirm.emit();
            this.hide();
        });
    }

    getOverlayHandleComponentType() {
        return KbqPopoverConfirmComponent;
    }
}
