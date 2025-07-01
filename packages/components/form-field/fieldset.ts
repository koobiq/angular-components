import { Component, Directive, ViewEncapsulation } from '@angular/core';

@Component({
    standalone: true,
    selector: 'kbq-fieldset',
    host: {
        class: 'kbq-fieldset',
        role: 'group'
    },
    styleUrls: ['./fieldset.scss'],
    template: `
        <ng-content select="[kbqLegend]" />

        <ng-content />
    `,
    encapsulation: ViewEncapsulation.None
})
export class KbqFieldset {}

@Directive({
    standalone: true,
    selector: '[kbqLegend]',
    host: {
        class: 'kbq-legend'
    }
})
export class KbqLegend {}

@Directive({
    standalone: true,
    selector: '[kbqFieldsetItem]',
    host: {
        class: 'kbq-fieldset-item'
    }
})
export class KbqFieldsetItem {}
