import { FocusMonitor } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, ScrollDispatcher } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Inject,
    Input,
    NgZone,
    Optional,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_FORM_FIELD_REF, KbqFormFieldRef, PopUpTriggers } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';
import { KBQ_TOOLTIP_SCROLL_STRATEGY, KbqTooltipTrigger } from '@koobiq/components/tooltip';


@Component({
    selector: `kbq-password-toggle`,
    exportAs: 'kbqPasswordToggle',
    template: '<i kbq-icon-button="" [ngClass]="iconClass"></i>',
    styleUrls: ['password-toggle.scss'],
    host: {
        class: 'kbq-password-toggle',

        '[style.visibility]': 'visibility',

        '(click)': 'toggle($event)',
        '(keydown.ENTER)': 'toggle($event)',
        '(keydown.SPACE)': 'toggle($event)'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPasswordToggle extends KbqTooltipTrigger implements AfterViewInit {

    @ViewChild(KbqIconButton) icon: KbqIconButton;
    @Input('kbqTooltipNotHidden')
    get content(): string | TemplateRef<any> {
        return (this.formField.control as any).elementType === 'password' ?
            this.kbqTooltipHidden :
            this._content;
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
        overlay: Overlay,
        elementRef: ElementRef,
        ngZone: NgZone,
        scrollDispatcher: ScrollDispatcher,
        hostView: ViewContainerRef,
        @Inject(KBQ_TOOLTIP_SCROLL_STRATEGY) scrollStrategy,
        focusMonitor: FocusMonitor,
        @Optional() direction: Directionality,
        @Inject(forwardRef(() => KBQ_FORM_FIELD_REF)) private formField: KbqFormFieldRef,
        private changeDetector: ChangeDetectorRef
    ) {
        super(overlay, elementRef, ngZone, scrollDispatcher, hostView, scrollStrategy, direction, focusMonitor);

        this.trigger = `${PopUpTriggers.Hover}`;
    }

    ngAfterViewInit(): void {
        this.formField.control?.stateChanges
            .subscribe(this.updateState);
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
    }
}
