import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    DestroyRef,
    ElementRef,
    ViewEncapsulation,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PopUpPlacements, PopUpTriggers } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqNavbarIc } from './navbar-ic';
import { KbqNavbarIcLogo, KbqNavbarIcTitle } from './navbar-ic-item';

@Component({
    standalone: true,
    selector: 'kbq-navbar-ic-header, [kbq-navbar-ic-header]',
    exportAs: 'kbqNavbarIcHeader',
    template: `
        <div class="kbq-navbar-ic-header__inner">
            <ng-content />
        </div>
    `,
    styleUrl: './navbar-ic-header.scss',
    host: {
        class: 'kbq-navbar-ic-header',
        '[class.kbq-navbar-ic-header_interactive]': 'isLink'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarIcHeader extends KbqTooltipTrigger implements AfterContentInit {
    protected readonly navbar = inject(KbqNavbarIc);
    protected readonly nativeElement = inject(ElementRef).nativeElement;
    protected readonly destroyRef = inject(DestroyRef);

    @ContentChild(KbqNavbarIcLogo) logo: KbqNavbarIcLogo;
    @ContentChild(KbqNavbarIcTitle) title: KbqNavbarIcTitle;

    get titleText(): string {
        return this.title?.text || '';
    }

    get isLink(): boolean {
        return this.nativeElement.tagName === 'A';
    }

    constructor() {
        super();

        this._trigger = `${PopUpTriggers.Hover}`;

        this.arrow = false;
        this.offset = -8;
        this.tooltipPlacement = PopUpPlacements.RightTop;
    }

    ngAfterContentInit(): void {
        this.navbar?.animationDone
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.title?.checkTextOverflown());

        this.title?.checkTextOverflown();

        if (this.title?.isTextOverflown) {
            this.content = this.titleText;
        }
    }
}
