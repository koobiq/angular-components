import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Inject,
    InjectionToken,
    Input,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ENTER, SPACE, TAB } from '@koobiq/cdk/keycodes';

export interface KbqOptionActionParent {
    dropdownTrigger: {
        opened: boolean;
        restoreFocus: boolean;
        dropdownClosed: EventEmitter<void>;
        lastDestroyReason: void | 'click' | 'keydown' | 'tab';
        openedBy: Exclude<FocusOrigin, 'program' | null> | undefined;
        toggle(): void;
    };
    tooltipTrigger: {
        disabled: boolean;
    };
    focus(): void;
}

export const KBQ_OPTION_ACTION_PARENT = new InjectionToken<KbqOptionActionParent>('KBQ_OPTION_ACTION_PARENT');

@Component({
    selector: 'kbq-option-action',
    exportAs: 'kbqOptionAction',
    template: `
        <ng-content select="[kbq-icon]">
            <i class="kbq kbq-icon kbq-contrast-fade kbq-ellipsis-vertical_16"></i>
        </ng-content>
    `,
    styleUrls: ['./action.scss'],
    host: {
        class: 'kbq-option-action',
        '[class.kbq-expanded]': 'false',
        '[class.kbq-disabled]': 'disabled',

        '[attr.disabled]': 'disabled || null',
        '[attr.tabIndex]': '-1',

        '(click)': 'onClick($event)',
        '(keydown)': 'onKeyDown($event)'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqOptionActionComponent implements AfterViewInit, OnDestroy {
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    hasFocus: boolean = false;

    get active(): boolean {
        return this.hasFocus || !!this.option.dropdownTrigger?.opened;
    }

    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
        @Inject(KBQ_OPTION_ACTION_PARENT) private option: KbqOptionActionParent
    ) {}

    ngAfterViewInit(): void {
        this.focusMonitor
            .monitor(this.elementRef.nativeElement, true)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((result) => (this.hasFocus = !!result));

        if (!this.option.dropdownTrigger) return;

        this.option.dropdownTrigger.restoreFocus = false;

        this.option.dropdownTrigger.dropdownClosed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.preventShowingTooltip();

            const destroyReason: FocusOrigin =
                this.option.dropdownTrigger.lastDestroyReason === 'keydown' ? 'keyboard' : 'program';

            this.focus(destroyReason);
        });
    }

    ngOnDestroy(): void {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }

    focus(origin?: FocusOrigin, options?: FocusOptions) {
        if (this.focusMonitor && origin) {
            this.focusMonitor.focusVia(this.elementRef.nativeElement, origin, options);
        } else {
            this.elementRef.nativeElement.focus();
        }

        this.hasFocus = true;
    }

    onClick($event) {
        $event.stopPropagation();
    }

    onKeyDown($event) {
        if ([SPACE, ENTER].includes($event.keyCode) && this.option.dropdownTrigger) {
            this.option.dropdownTrigger.openedBy = 'keyboard';
        } else if ($event.shiftKey && $event.keyCode === TAB) {
            this.hasFocus = false;

            this.option.focus();
        } else if ($event.keyCode === TAB) {
            return;
        }

        $event.preventDefault();
        $event.stopPropagation();
    }

    private preventShowingTooltip() {
        if (!this.option.tooltipTrigger) {
            return;
        }

        this.option.tooltipTrigger.disabled = true;

        setTimeout(() => (this.option.tooltipTrigger.disabled = false));
    }
}
