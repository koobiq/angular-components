import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    DestroyRef,
    ViewEncapsulation,
    inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
        class: 'kbq-navbar-ic-header'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarIcHeader implements AfterContentInit {
    protected readonly navbar = inject(KbqNavbarIc);
    private readonly destroyRef = inject(DestroyRef);

    @ContentChild(KbqNavbarIcLogo) logo: KbqNavbarIcLogo;
    @ContentChild(KbqNavbarIcTitle) title: KbqNavbarIcTitle;

    ngAfterContentInit(): void {
        this.navbar?.animationDone
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.title?.checkTextOverflown());
    }
}
