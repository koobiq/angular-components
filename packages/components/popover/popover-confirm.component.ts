import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Directive,
    ElementRef,
    EventEmitter,
    Inject,
    InjectionToken,
    Input,
    NgZone,
    Optional,
    Output,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { kbqPopoverAnimations } from './popover-animations';
import { KBQ_POPOVER_SCROLL_STRATEGY, KbqPopoverComponent, KbqPopoverTrigger } from './popover.component';

export const KBQ_POPOVER_CONFIRM_TEXT = new InjectionToken<string>('');
export const KBQ_POPOVER_CONFIRM_BUTTON_TEXT = new InjectionToken<string>('');

@Component({
    selector: 'kbq-popover-confirm-component',
    templateUrl: './popover-confirm.component.html',
    preserveWhitespaces: false,
    styleUrls: ['./popover.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [kbqPopoverAnimations.popoverState]
})
export class KbqPopoverConfirmComponent extends KbqPopoverComponent {
    onConfirm = new Subject<void>();
    confirmButtonText: string;

    confirmText: string;

    constructor(changeDetectorRef: ChangeDetectorRef) {
        super(changeDetectorRef);
    }
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
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(KBQ_POPOVER_SCROLL_STRATEGY) scrollStrategy,
        @Optional() direction: Directionality,
        @Optional() @Inject(KBQ_POPOVER_CONFIRM_TEXT) confirmText: string,
        @Optional() @Inject(KBQ_POPOVER_CONFIRM_BUTTON_TEXT) confirmButtonText: string
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction);

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
        this.instance.onConfirm.pipe(takeUntil(this.destroyed)).subscribe(() => {
            this.confirm.emit();
            this.hide();
        });
    }

    getOverlayHandleComponentType() {
        return KbqPopoverConfirmComponent;
    }
}
