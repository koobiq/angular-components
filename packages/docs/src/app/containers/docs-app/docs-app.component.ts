import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ViewEncapsulation } from '@angular/core';

import { DocsNavbarState, DocStates } from '../../components/doс-states';


@Component({
    selector: 'docs-app',
    templateUrl: 'docs-app.component.html',
    styleUrls: ['docs-app.component.scss'],
    host: {
        class: 'docs-app'
    },
    encapsulation: ViewEncapsulation.None,
    animations: [
        trigger('openCloseSidenav', [
            state('open', style({ right: '0' })),
            state('closed', style({ right: '-100%', display: 'none' })),
            transition('open => closed', [
                animate('300ms ease-out')
            ]),
            transition('closed => open', [
                animate('300ms ease-out')
            ])
        ]),
        trigger('fadeInOutSidenav', [
            state('fadeIn', style({
                opacity: '1',
                display: 'block'
            })),
            state('fadeOut', style({
                opacity: '0',
                display: 'none'
            })),
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
    opened: boolean;

    constructor(public docStates: DocStates) {
        this.docStates.navbarMenu
            .subscribe((navbarMenuState) => this.opened = navbarMenuState === DocsNavbarState.opened);
    }

}
