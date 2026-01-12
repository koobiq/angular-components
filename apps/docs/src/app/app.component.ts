import { animate, state, style, transition, trigger } from '@angular/animations';
import { AsyncPipe } from '@angular/common';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { KbqDividerModule } from '@koobiq/components/divider';
import { map, Observable } from 'rxjs';
import { DocsNavbarComponent } from './components/navbar/navbar.component';
import { DocsSidenav } from './components/sidenav/sidenav';
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
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-app'
    },
    animations: [
        trigger('openCloseSidenav', [
            state('open', style({ right: '0' })),
            state('closed', style({ right: '-100%' })),
            transition('open => closed', [animate('300ms ease-out')]),
            transition('closed => open', [animate('300ms ease-out')])
        ]),
        trigger('fadeInOutSidenav', [
            state(
                'fadeIn',
                style({
                    opacity: '1',
                    display: 'block'
                })
            ),
            state(
                'fadeOut',
                style({
                    opacity: '0',
                    display: 'none'
                })
            ),
            transition('fadeIn => fadeOut', [
                animate('300ms ease-out')
            ]),
            transition('fadeOut => fadeIn', [
                animate('300ms ease-out')
            ])
        ])
    ]
})
export class DocsAppComponent {
    readonly docStates = inject(DocsDocStates);

    readonly opened$: Observable<boolean> = this.docStates.navbarMenu.pipe(
        map((state) => state === DocsNavbarState.Opened)
    );
}
