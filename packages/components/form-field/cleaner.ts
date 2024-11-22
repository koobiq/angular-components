import { Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'kbq-cleaner',
    exportAs: 'kbqCleaner',
    template: `
        <i [autoColor]="true" kbq-icon-button="kbq-xmark-circle_16"></i>
    `,
    styleUrls: ['cleaner.scss'],
    host: {
        class: 'kbq-cleaner'
    },
    encapsulation: ViewEncapsulation.None
})
export class KbqCleaner {}
