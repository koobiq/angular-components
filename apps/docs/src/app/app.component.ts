import { AsyncPipe, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { KbqDividerModule } from '@koobiq/components/divider';
import { filter, map, Observable } from 'rxjs';
import { DocsNavbarComponent } from './components/navbar/navbar.component';
import { DocsSidenav } from './components/sidenav/sidenav';
import { docsIsExamplePageUrl } from './constants/example-page';
import { DocsDocStates, DocsNavbarState } from './services/doc-states';

@Component({
    selector: 'docs-app',
    imports: [
        RouterOutlet,
        KbqDividerModule,
        DocsNavbarComponent,
        DocsSidenav,
        AsyncPipe
    ],
    templateUrl: 'app.component.html',
    styleUrl: 'app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-app'
    }
})
export class DocsAppComponent {
    readonly docStates = inject(DocsDocStates);
    readonly router = inject(Router);

    readonly opened$: Observable<boolean> = this.docStates.navbarMenu.pipe(
        map((state) => state === DocsNavbarState.Opened)
    );

    /**
     * Whether the page shows a single live example, without the site navigation. The template keeps one router outlet
     * for both layouts, so switching them never creates the routed page again.
     */
    protected readonly isExamplePage = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map((event) => docsIsExamplePageUrl(event.urlAfterRedirects))
        ),
        // Read from the URL rather than left `false` until the first navigation ends, or the site navigation would
        // render on the example page in the meantime.
        { initialValue: docsIsExamplePageUrl(inject(Location).path()) }
    );
}
