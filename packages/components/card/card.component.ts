import { FocusMonitor } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Output,
    ViewEncapsulation
} from '@angular/core';
import { SPACE } from '@koobiq/cdk/keycodes';
import { CanColorCtor, mixinColor } from '@koobiq/components/core';

/** @docs-private */
export class KbqCardBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqCardBaseMixin: CanColorCtor & typeof KbqCardBase = mixinColor(KbqCardBase);

@Component({
    selector: 'kbq-card',
    templateUrl: './card.component.html',
    styleUrls: ['./card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    inputs: ['color'],
    host: {
        class: 'kbq-card',
        '[class.kbq-card_readonly]': 'readonly',
        '[class.kbq-selected]': 'selected',
        '[attr.tabindex]': 'tabIndex',
        '(keydown)': 'onKeyDown($event)',
        '(click)': 'onClick($event)'
    }
})
export class KbqCard extends KbqCardBaseMixin implements OnDestroy {
    @Input()
    readonly = false;

    @Input()
    selected = false;

    @Output()
    selectedChange = new EventEmitter<boolean>();

    @Input()
    get tabIndex(): number | null {
        return this.readonly ? null : this._tabIndex;
    }

    set tabIndex(value: number | null) {
        this._tabIndex = value;
    }

    private _tabIndex: number | null = 0;

    constructor(
        elementRef: ElementRef,
        private _focusMonitor: FocusMonitor
    ) {
        super(elementRef);

        this._focusMonitor.monitor(this.elementRef.nativeElement, false);
    }

    ngOnDestroy() {
        this._focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(): void {
        this.hostElement.focus();
    }

    onClick($event: MouseEvent) {
        if (!this.readonly) {
            $event.stopPropagation();

            this.selectedChange.emit(!this.selected);
        }
    }

    onKeyDown($event: KeyboardEvent) {
        // tslint:disable-next-line:deprecation
        switch ($event.keyCode) {
            case SPACE:
                if (!this.readonly) {
                    $event.preventDefault();
                    this.selectedChange.emit(!this.selected);
                }
                break;
            default:
        }
    }

    private get hostElement() {
        return this.elementRef.nativeElement;
    }
}
