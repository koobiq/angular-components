import { CdkMonitorFocus } from '@angular/cdk/a11y';
import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    inject,
    NgZone,
    OnDestroy,
    ViewEncapsulation
} from '@angular/core';
import { ENTER, NUMPAD_DIVIDE, SLASH, SPACE } from '@koobiq/cdk/keycodes';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqVerticalNavbar } from './vertical-navbar.component';

@Component({
    selector: 'kbq-navbar-toggle, [kbq-navbar-toggle]',
    template: `
        <ng-content select="[kbq-icon]">
            <i
                kbq-icon
                [class.kbq-chevron-double-left-s_16]="navbar.expanded"
                [class.kbq-chevron-double-right-s_16]="!navbar.expanded"
            ></i>
        </ng-content>
    `,
    styleUrls: ['./navbar-toggle.scss'],
    host: {
        class: 'kbq-navbar-toggle kbq-vertical',
        '[class.kbq-collapsed]': '!navbar.expanded',
        '[class.kbq-expanded]': 'navbar.expanded',

        '(keydown)': 'keydownHandler($event)',
        '(click)': 'navbar.toggle()'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    hostDirectives: [CdkMonitorFocus]
})
export class KbqNavbarToggle implements OnDestroy {
    private readonly window = inject(KBQ_WINDOW);
    private readonly ngZone = inject(NgZone);

    protected readonly navbar = inject(KbqVerticalNavbar);

    constructor() {
        afterNextRender(() => {
            this.ngZone.runOutsideAngular(() => this.window.addEventListener('keydown', this.windowToggleHandler));
        });
    }

    ngOnDestroy(): void {
        this.window.removeEventListener('keydown', this.windowToggleHandler);
    }

    keydownHandler($event: KeyboardEvent) {
        if ([SPACE, ENTER].includes($event.keyCode)) {
            this.navbar.toggle();

            $event.stopPropagation();
            $event.preventDefault();
        }
    }

    private windowToggleHandler = (event: KeyboardEvent) => {
        if (event.ctrlKey && [NUMPAD_DIVIDE, SLASH].includes(event.keyCode)) {
            this.ngZone.run(this.navbar.toggle);
        }
    };
}
