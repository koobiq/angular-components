import { AnimationEvent } from '@angular/animations';
import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ElementRef,
    OnDestroy,
    TemplateRef,
    ViewEncapsulation,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, KbqReadStateDirective, kbqInjectA11yLocaleConfiguration } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { kbqToastAnimations } from './toast-animations';
import { KBQ_TOAST_STACK, KbqToastData, KbqToastStyle } from './toast.type';

@Directive({
    selector: '[kbq-toast-close-button]',
    host: {
        class: 'kbq-toast__close-button'
    }
})
export class KbqToastCloseButton {}

let id = 0;

/** Glyph rendered by the built-in icon of every style. A style outside the map renders no default icon. */
const defaultIcons: { [style: string]: string | undefined } = {
    [KbqToastStyle.Contrast]: 'kbq-circle-info_16',
    [KbqToastStyle.Success]: 'kbq-circle-check_16',
    [KbqToastStyle.Warning]: 'kbq-triangle-exclamation_16',
    [KbqToastStyle.Error]: 'kbq-triangle-exclamation_16'
};

/** Styles whose message interrupts the user instead of waiting for the next graceful moment. */
const assertiveStyles: string[] = [KbqToastStyle.Warning, KbqToastStyle.Error];

@Component({
    selector: 'kbq-toast',
    imports: [
        NgTemplateOutlet,
        KbqIconModule,
        KbqTitleModule,
        KbqToastCloseButton
    ],
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss', './toast-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-toast',
        '[class]': 'styleClass',
        '[class.kbq-toast_dismissible]': 'closeButton',
        // A toast is inserted into an already rendered page, so the toast itself has to be the live region:
        // screen readers announce a node inserted with `role="alert"`/`role="status"`, while an `aria-live`
        // wrapper has to be in the accessibility tree before its content changes.
        '[attr.role]': 'role',
        'aria-atomic': 'true',
        '[@state]': 'animationState',
        '[@.disabled]': 'reducedMotion',
        '(@state.start)': 'onAnimation($event)',
        '(@state.done)': 'onAnimation($event)',
        '(mouseenter)': 'hovered.next(true)',
        '(mouseleave)': 'hovered.next(false)',
        '(keydown.esc)': 'close()'
    },
    hostDirectives: [KbqReadStateDirective],
    animations: [kbqToastAnimations.toastState]
})
export class KbqToastComponent implements OnDestroy {
    readonly data = inject(KbqToastData);

    private readonly stack = inject(KBQ_TOAST_STACK);
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly focusMonitor = inject(FocusMonitor);
    private readonly window = inject(KBQ_WINDOW);

    protected readonly readStateDirective = inject(KbqReadStateDirective, { host: true });
    protected readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    /**
     * Animations are the only motion a toast carries, so disabling them honors the user's system setting.
     * `matchMedia` is absent outside a real browser (server-side rendering, jsdom), where nothing animates anyway.
     */
    protected readonly reducedMotion = this.window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    animationState = 'void';

    readonly hovered = new BehaviorSubject<boolean>(false);
    readonly focused = new BehaviorSubject<boolean>(false);

    id = id++;

    /** Context of the templates a consumer passes through `KbqToastData`. */
    readonly $implicit: this = this;

    // The injected data belongs to the caller, so every default lives here instead of being written back into it.
    protected readonly style = this.data.style || KbqToastStyle.Contrast;
    protected readonly styleClass = `kbq-toast_${this.style}`;
    protected readonly role = assertiveStyles.includes(this.style) ? 'alert' : 'status';
    protected readonly closeButton = this.data.closeButton !== undefined ? this.data.closeButton : true;
    protected readonly icon = this.data.icon !== undefined ? this.data.icon : true;
    protected readonly defaultIcon: string | null = defaultIcons[this.style] ?? null;

    // The slot templates are fixed once the toast is created, so they are resolved once instead of on every
    // change detection cycle.
    protected readonly iconTemplate = this.asTemplateRef(this.icon);
    protected readonly titleTemplate = this.asTemplateRef(this.data.title);
    protected readonly captionTemplate = this.asTemplateRef(this.data.caption);
    protected readonly contentTemplate = this.asTemplateRef(this.data.content);
    protected readonly actionsTemplate = this.asTemplateRef(this.data.actions);
    protected readonly closeButtonTemplate = this.asTemplateRef(this.closeButton);

    private alreadyRead = false;

    get isFocusedOrHovered(): boolean {
        return this.hovered.getValue() || this.focused.getValue();
    }

    constructor() {
        this.animationState = 'visible';

        this.runFocusMonitor();

        this.hovered.pipe(takeUntilDestroyed()).subscribe((hovered) => this.stack.setHovered(this.id, hovered));

        // `read` is a `BehaviorSubject` re-emitted by every hover long enough to count as read, while a toast
        // is read exactly once.
        this.readStateDirective.read
            .pipe(filter(Boolean), take(1), takeUntilDestroyed())
            .subscribe(() => this.markAsRead());
    }

    ngOnDestroy() {
        this.stopFocusMonitor();

        this.stack.setHovered(this.id, false);
        this.stack.setFocused(this.id, null);
    }

    close(): void {
        this.markAsRead();
        this.stack.hide(this.id);
    }

    onAnimation($event: AnimationEvent) {
        this.stack.animation.next($event);
    }

    private markAsRead(): void {
        if (this.alreadyRead) {
            return;
        }

        this.alreadyRead = true;
        this.stack.read.next(this.data);
    }

    private asTemplateRef(value: unknown): TemplateRef<{ $implicit: KbqToastComponent }> | null {
        return value instanceof TemplateRef ? value : null;
    }

    private runFocusMonitor() {
        this.focusMonitor
            .monitor(this.elementRef.nativeElement, true)
            .pipe(takeUntilDestroyed())
            .subscribe((origin: FocusOrigin) => {
                this.focused.next(!!origin);
                this.stack.setFocused(this.id, origin);
            });
    }

    private stopFocusMonitor() {
        this.focusMonitor.stopMonitoring(this.elementRef.nativeElement);
    }
}
