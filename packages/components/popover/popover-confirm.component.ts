import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    Optional,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { kbqPopoverAnimations } from './popover-animations';
import { KbqPopoverComponent, KbqPopoverTrigger } from './popover.component';

export const KBQ_POPOVER_CONFIRM_TEXT = new InjectionToken<string>('');
export const KBQ_POPOVER_CONFIRM_BUTTON_TEXT = new InjectionToken<string>('');

@Component({
    selector: 'kbq-popover-confirm-component',
    templateUrl: './popover-confirm.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.scss', './popover-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [kbqPopoverAnimations.popoverState]
})
export class KbqPopoverConfirmComponent extends KbqPopoverComponent {
    onConfirm = new Subject<void>();
    confirmButtonText: string;

    confirmText: string;
}

@Directive({
    selector: '[kbqPopoverConfirm]',
    exportAs: 'kbqPopoverConfirm',
    host: {
        '[class.kbq-popover_open]': 'isOpen',
        '(keydown)': 'handleKeydown($event)',
        '(touchend)': 'handleTouchend()'
    }
})
export class KbqPopoverConfirmTrigger extends KbqPopoverTrigger {
    @Output() confirm: EventEmitter<void> = new EventEmitter<void>();

    @Input('kbqPopoverConfirmText')
    get confirmText(): string {
        return this._confirmText;
    }

    set confirmText(value: string) {
        this._confirmText = value;

        this.updateData();
    }

    private _confirmText: string;

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
            this.confirm.emit();
            this.hide();
        });
    }

    getOverlayHandleComponentType() {
        return KbqPopoverConfirmComponent;
    }
}
