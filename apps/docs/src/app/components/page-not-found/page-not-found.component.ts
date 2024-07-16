import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'page-not-found',
    templateUrl: 'page-not-found.html',
    styleUrls: ['page-not-found.scss'],
    host: {
        class: 'page-not-found'
    },
    encapsulation: ViewEncapsulation.None
})
export class PageNotFoundComponent {}
