import { AnimationEvent } from '@angular/animations';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    Inject,
    OnDestroy,
    TemplateRef,
    ViewEncapsulation,
    forwardRef
} from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { BehaviorSubject, Subject, merge } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { kbqToastAnimations } from './toast-animations';
import { KbqToastService } from './toast.service';
import { KbqToastData, KbqToastStyle } from './toast.type';

@Directive({
    selector: '[kbq-toast-close-button]',
    host: {
        class: 'kbq-toast__close-button'
    }
})
export class KbqToastCloseButton {}

let id = 0;

@Component({
    selector: 'kbq-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    host: {
        class: 'kbq-toast',
        '[class]': 'toastStyle',
        '[class.kbq-toast_dismissible]': 'data.closeButton',
        '[@state]': 'animationState',
        '(@state.start)': 'onAnimation($event)',
        '(@state.done)': 'onAnimation($event)',

        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)',

        '(keydown.esc)': 'close()'
    },
    animations: [kbqToastAnimations.toastState],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqToastComponent implements OnDestroy {
    themePalette = ThemePalette;

    animationState = 'void';

    readonly hovered = new BehaviorSubject<boolean>(false);
    readonly focused = new BehaviorSubject<boolean>(false);

    id = id++;
    ttl;
    delay;

    $implicit;

    get toastStyle() {
        return {
            [`kbq-toast_${this.data.style}`]: true
        };
    }

    get isFocusedOrHovered(): boolean {
        return this.hovered.getValue() || this.focused.getValue();
    }

    private destroyed: Subject<boolean> = new Subject();

    constructor(
        readonly data: KbqToastData,
        @Inject(forwardRef(() => KbqToastService)) readonly service: KbqToastService,
        public elementRef: ElementRef,
        private focusMonitor: FocusMonitor
    ) {
        this.$implicit = this;

        this.data.style = this.data.style || KbqToastStyle.Contrast;
        this.data.icon = this.data.icon !== undefined ? this.data.icon : true;
        this.data.iconClass = this.data.iconClass || undefined;
        this.data.closeButton = this.data.closeButton !== undefined ? this.data.closeButton : true;

        this.animationState = 'visible';

        this.runFocusMonitor();

        this.hovered.subscribe(this.service.hovered);
        this.focused.subscribe(this.service.focused);

        merge(this.hovered, this.focused)
            .pipe(
                takeUntil(this.destroyed),
                filter((value) => value)
            )
            .subscribe(() => {
                if (this.ttl === 0) {
                    return;
                }

                this.ttl = this.ttl < this.delay ? this.delay : this.ttl;
            });
    }

    ngOnDestroy() {
        this.stopFocusMonitor();

        this.hovered.next(false);
        this.focused.next(false);

        this.destroyed.next(true);
    }

    close(): void {
        this.service.hide(this.id);
    }

    isTemplateRef(value): boolean {
        return value instanceof TemplateRef;
    }

    onAnimation($event: AnimationEvent) {
        this.service.animation.next($event);
    }

    private runFocusMonitor() {
        this.focusMonitor
            .monitor(this.elementRef.nativeElement, true)
            .subscribe((origin: FocusOrigin) => this.focused.next(!!origin));
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }
}
