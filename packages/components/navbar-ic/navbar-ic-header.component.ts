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
import { KbqNavbarIcLogo, KbqNavbarIcTitle } from './navbar-ic-item.component';
import { KbqNavbarIc } from './navbar-ic.component';

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
        '[class.kbq-hovered]': 'hovered'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqNavbarIcHeader implements AfterContentInit {
    protected readonly navbar = inject(KbqNavbarIc);

    @ContentChild(KbqNavbarIcLogo) logo: KbqNavbarIcLogo;
    @ContentChild(KbqNavbarIcTitle) title: KbqNavbarIcTitle;

    hovered = false;

    private readonly destroyRef = inject(DestroyRef);

    ngAfterContentInit(): void {
        this.navbar?.animationDone
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.title?.checkTextOverflown());
    }
}
