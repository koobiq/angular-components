import { CdkMonitorFocus } from '@angular/cdk/a11y';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    NgZone,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ENTER, NUMPAD_DIVIDE, SLASH, SPACE } from '@koobiq/cdk/keycodes';
import { KBQ_WINDOW, PopUpPlacements } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqVerticalNavbar } from './vertical-navbar.component';

@Component({
    selector: 'kbq-navbar-toggle, [kbq-navbar-toggle]',
    template: `
        <span class="kbq-navbar-toggle__circle">
            <ng-content select="[kbq-icon]">
                <i
                    kbq-icon
                    [class.kbq-chevron-double-left-s_16]="navbar.expanded"
                    [class.kbq-chevron-double-right-s_16]="!navbar.expanded"
                ></i>
            </ng-content>
        </span>
    `,
    styleUrls: ['./navbar-toggle.scss'],
    host: {
        class: 'kbq-navbar-toggle kbq-vertical',
        '[class.kbq-collapsed]': '!navbar.expanded',
        '[class.kbq-expanded]': 'navbar.expanded',

        '(keydown)': 'keydownHandler($event)',
        '(click)': 'toggle()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    hostDirectives: [CdkMonitorFocus, KbqTooltipTrigger]
})
export class KbqNavbarToggle implements OnDestroy {
    private readonly window = inject(KBQ_WINDOW);
    private readonly ngZone = inject(NgZone);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    private readonly tooltip = inject(KbqTooltipTrigger, { self: true });

    /** @docs-private */
    protected readonly navbar = inject(KbqVerticalNavbar);

    constructor() {
        afterNextRender(() => {
            this.ngZone.runOutsideAngular(() => this.window.addEventListener('keydown', this.windowToggleHandler));
        });

        this.tooltip.arrow = false;
        this.updateTooltipContent();
        this.tooltip.tooltipPlacement = PopUpPlacements.Right;

        this.tooltip.visibleChange.pipe(takeUntilDestroyed()).subscribe(this.updateTooltipContent);
    }

    ngOnDestroy(): void {
        this.window.removeEventListener('keydown', this.windowToggleHandler);
    }

    /** @docs-private */
    keydownHandler($event: KeyboardEvent) {
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.toggle();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }

    /** toggles the state of the navbar */
    toggle() {
        this.navbar.toggle();
        this.tooltip.hide();

        this.changeDetectorRef.detectChanges();
    }

    private updateTooltipContent = () => {
        this.tooltip.content = this.navbar.expanded
            ? this.navbar.configuration.toggle.collapse
            : this.navbar.configuration.toggle.expand;
    };

    private windowToggleHandler = (event: KeyboardEvent) => {
        if (event.ctrlKey && [NUMPAD_DIVIDE, SLASH].includes(event.keyCode)) {
            this.ngZone.run(this.navbar.toggle);
        }
    };
}
