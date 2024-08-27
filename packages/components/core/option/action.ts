import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    DestroyRef,
    ElementRef,
    EventEmitter,
    inject,
    Inject,
    InjectionToken,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ENTER, SPACE, TAB } from '@koobiq/cdk/keycodes';
import { CanDisableCtor, HasTabIndexCtor, mixinDisabled, mixinTabIndex } from '../common-behaviors';

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

/** @docs-private */
export class KbqOptionActionBase {}

/** @docs-private */
export const KbqOptionActionMixinBase: HasTabIndexCtor & CanDisableCtor & typeof KbqOptionActionBase = mixinTabIndex(
    mixinDisabled(KbqOptionActionBase)
);

@Component({
    selector: 'kbq-option-action',
    exportAs: 'kbqOptionAction',
    template: `
        @if (!!customIcon) {
            <ng-content select="[kbq-icon]" />
        } @else {
            <i class="kbq kbq-icon kbq-ellipsis-vertical_16"></i>
        }
    `,
    styleUrls: ['./action.scss', 'option-action-tokens.scss'],
    host: {
        class: 'kbq-option-action',
        '[class.kbq-expanded]': 'false',
        '[class.kbq-disabled]': 'disabled',

        '[attr.disabled]': 'disabled || null',
        '[attr.tabIndex]': '-1',

        '(focus)': 'onFocus($event)',
        '(blur)': 'onBlur()',
        '(click)': 'onClick($event)',
        '(keydown)': 'onKeyDown($event)'
    },
    inputs: ['disabled'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqOptionActionComponent extends KbqOptionActionMixinBase implements AfterViewInit, OnDestroy {
    @ContentChild('customIcon') customIcon: ElementRef;

    hasFocus: boolean = false;

    get active(): boolean {
        return this.hasFocus || !!this.option.dropdownTrigger?.opened;
    }

    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private elementRef: ElementRef,
        private focusMonitor: FocusMonitor,
        @Inject(KBQ_OPTION_ACTION_PARENT) private option: KbqOptionActionParent
    ) {
        super();

        this.focusMonitor.monitor(this.elementRef.nativeElement);
    }

    ngAfterViewInit(): void {
        if (!this.option.dropdownTrigger) {
            return;
        }

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

    onFocus($event) {
        $event.stopPropagation();

        this.hasFocus = true;
    }

    onBlur() {
        this.hasFocus = false;
    }

    onClick($event) {
        $event.stopPropagation();
    }

    onKeyDown($event) {
        if ([SPACE, ENTER].includes($event.keyCode) && this.option.dropdownTrigger) {
            this.option.dropdownTrigger.openedBy = 'keyboard';
            this.option.dropdownTrigger.toggle();
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
