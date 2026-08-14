import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    effect,
    inject,
    Injectable,
    NgZone,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    ENTER,
    KBQ_WINDOW,
    kbqInjectNativeElement,
    NUMPAD_DIVIDE,
    PopUpPlacements,
    SLASH,
    SPACE
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqVerticalNavbar } from './vertical-navbar.component';

/**
 * Dispatches the global `Ctrl+/` shortcut to exactly one navbar toggle.
 *
 * Every toggle used to bind its own window listener and call `toggle()` unconditionally, so a single keypress
 * collapsed *every* vertical navbar on the page. One shared listener instead picks the toggle whose navbar
 * currently holds focus, and falls back to the first registered one so the shortcut still works from anywhere.
 * @docs-private
 */
@Injectable({ providedIn: 'root' })
export class KbqNavbarToggleRegistry implements OnDestroy {
    private readonly window = inject(KBQ_WINDOW);
    private readonly document = inject(DOCUMENT);
    private readonly ngZone = inject(NgZone);

    private readonly toggles = new Set<KbqNavbarToggle>();

    /** Starts listening for the shortcut on behalf of the given toggle. */
    add(toggle: KbqNavbarToggle): void {
        if (this.toggles.size === 0) {
            this.ngZone.runOutsideAngular(() => this.window.addEventListener('keydown', this.handleKeydown));
        }

        this.toggles.add(toggle);
    }

    /** Stops dispatching the shortcut to the given toggle. */
    remove(toggle: KbqNavbarToggle): void {
        this.toggles.delete(toggle);

        if (this.toggles.size === 0) {
            this.window.removeEventListener('keydown', this.handleKeydown);
        }
    }

    ngOnDestroy(): void {
        this.window.removeEventListener('keydown', this.handleKeydown);

        this.toggles.clear();
    }

    private handleKeydown = (event: KeyboardEvent): void => {
        if (!event.ctrlKey || ![NUMPAD_DIVIDE, SLASH].includes(event.keyCode)) return;

        const target = this.resolveTarget();

        if (!target) return;

        this.ngZone.run(() => target.toggle());
    };

    private resolveTarget(): KbqNavbarToggle | undefined {
        const toggles = [...this.toggles];
        const activeElement = this.document.activeElement;
        const focused = activeElement && toggles.find((toggle) => toggle.contains(activeElement));

        return focused || toggles[0];
    }
}

@Component({
    selector: 'kbq-navbar-toggle, [kbq-navbar-toggle]',
    imports: [
        KbqIconModule
    ],
    template: `
        <span class="kbq-navbar-toggle__circle">
            <ng-content select="[kbq-icon]">
                <i
                    kbq-icon
                    [class.kbq-chevron-double-left-s_16]="navbar.expanded()"
                    [class.kbq-chevron-double-right-s_16]="!navbar.expanded()"
                ></i>
            </ng-content>
        </span>
    `,
    styleUrls: ['./navbar-toggle.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-navbar-toggle kbq-vertical',
        '[class.kbq-collapsed]': '!navbar.expanded()',
        '[class.kbq-expanded]': 'navbar.expanded()',

        // The toggle is icon-only and its tooltip is a transient overlay, never an accessible name. Role, name
        // and state are published on the host so assistive technology announces an expand/collapse control
        // instead of an unlabelled element.
        role: 'button',
        '[attr.aria-expanded]': 'navbar.expanded()',
        '[attr.aria-label]': 'label',
        'aria-keyshortcuts': 'Control+/',

        '(keydown)': 'keydownHandler($event)',
        '(click)': 'toggle()'
    },
    hostDirectives: [CdkMonitorFocus, KbqTooltipTrigger]
})
export class KbqNavbarToggle implements OnDestroy {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly registry = inject(KbqNavbarToggleRegistry);
    private readonly isBrowser = inject(Platform).isBrowser;

    private readonly tooltip = inject(KbqTooltipTrigger, { self: true });

    /** @docs-private */
    protected readonly navbar = inject(KbqVerticalNavbar);

    /** Accessible name of the toggle; it names the action the toggle performs. @docs-private */
    protected get label(): string {
        return this.navbar.expanded()
            ? this.navbar.configuration().toggle.collapse
            : this.navbar.configuration().toggle.expand;
    }

    constructor() {
        if (this.isBrowser) {
            this.registry.add(this);
        }

        this.tooltip.arrow = false;
        this.updateTooltipContent();
        this.tooltip.tooltipPlacement = PopUpPlacements.Right;

        this.tooltip.visibleChange.pipe(takeUntilDestroyed()).subscribe(this.updateTooltipContent);

        // `content` is a plain property, so a tooltip that is already open keeps the string it was given.
        // Reading the navbar's signal-backed configuration here re-applies it on a locale change instead
        // of leaving the previous locale on screen until the next show.
        effect(() => this.updateTooltipContent());
    }

    /** @docs-private */
    ngOnDestroy(): void {
        this.registry.remove(this);
    }

    /** Whether the given element sits inside the navbar this toggle belongs to. @docs-private */
    contains(element: Element): boolean {
        return this.navbar.getNativeElement().contains(element) || this.nativeElement.contains(element);
    }

    /** toggles the state of the navbar */
    toggle() {
        this.navbar.toggle();
        this.tooltip.hide();

        this.changeDetectorRef.markForCheck();
    }

    /** @docs-private */
    protected keydownHandler($event: KeyboardEvent) {
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.toggle();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }

    private updateTooltipContent = () => {
        this.tooltip.content = this.label;
    };
}
