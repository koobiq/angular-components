import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    DestroyRef,
    inject,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { kbqInjectNativeElement, PopUpPlacements, PopUpTriggers } from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { distinctUntilChanged } from 'rxjs/operators';
import { KbqNavbarIc } from './navbar-ic';
import { KbqNavbarIcLogo, KbqNavbarIcTitle } from './navbar-ic-item';
import { toggleNavbarIcItemAnimation } from './navbar-ic.animation';

/**
 * @deprecated Will be removed in the next major release.
 */
@Component({
    selector: 'kbq-navbar-ic-header, [kbq-navbar-ic-header]',
    template: `
        <div class="kbq-navbar-ic-header__inner">
            <ng-content select="[kbqNavbarIcLogo]" />

            <div [@toggle]="navbar.state.value">
                <ng-content select="[kbqNavbarIcTitle]" />
            </div>
            <ng-content />
        </div>
    `,
    styleUrl: './navbar-ic-header.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqNavbarIcHeader',
    host: {
        class: 'kbq-navbar-ic-header',
        '[class.kbq-navbar-ic-header_interactive]': 'isLink'
    },
    animations: [toggleNavbarIcItemAnimation()]
})
export class KbqNavbarIcHeader extends KbqTooltipTrigger implements AfterContentInit {
    protected readonly navbar = inject(KbqNavbarIc);
    protected readonly nativeElement = kbqInjectNativeElement();
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

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

        this.navbar.state.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.changeDetectorRef.detectChanges();
        });

        this.title?.checkTextOverflown();

        if (this.title?.isTextOverflown) {
            this.content = this.titleText;
        }
    }
}
