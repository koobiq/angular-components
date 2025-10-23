import { AnimationEvent } from '@angular/animations';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    Inject,
    OnDestroy,
    TemplateRef,
    ViewEncapsulation,
    forwardRef,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqReadStateDirective, ThemePalette } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { BehaviorSubject, merge } from 'rxjs';
import { filter } from 'rxjs/operators';
import { kbqToastAnimations } from './toast-animations';
import { KbqToastService } from './toast.service';
import { KbqToastData, KbqToastStyle } from './toast.type';

@Directive({
    standalone: true,
    selector: '[kbq-toast-close-button]',
    host: {
        class: 'kbq-toast__close-button'
    }
})
export class KbqToastCloseButton {}

let id = 0;

@Component({
    standalone: true,
    imports: [
        NgTemplateOutlet,
        KbqIconModule,
        NgClass,
        KbqTitleModule,
        KbqToastCloseButton
    ],
    selector: 'kbq-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss', './toast-tokens.scss'],
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
    hostDirectives: [KbqReadStateDirective],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqToastComponent implements OnDestroy {
    protected readonly readStateDirective = inject(KbqReadStateDirective, { host: true });

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

    constructor(
        readonly data: KbqToastData,
        @Inject(forwardRef(() => KbqToastService)) readonly service: KbqToastService,
        public elementRef: ElementRef<HTMLElement>,
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
                filter((value) => value),
                takeUntilDestroyed()
            )
            .subscribe(() => {
                if (this.ttl === 0) {
                    return;
                }

                this.ttl = this.ttl < this.delay ? this.delay : this.ttl;
            });

        this.readStateDirective.read
            .pipe(
                filter((value) => value),
                takeUntilDestroyed()
            )
            .subscribe(() => this.service.read.next(this.data));
    }

    ngOnDestroy() {
        this.stopFocusMonitor();

        this.hovered.next(false);
        this.focused.next(false);
    }

    close(): void {
        this.service.read.next(this.data);
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
