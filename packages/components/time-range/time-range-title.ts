import { NgTemplateOutlet } from '@angular/common';
import { Component, input, TemplateRef } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';

@Component({
    standalone: true,
    selector: 'kbq-time-range-title',
    imports: [
        KbqLinkModule,
        KbqIconModule,
        NgTemplateOutlet
    ],
    template: `
        @if (titleTemplate()) {
            <ng-container *ngTemplateOutlet="titleTemplate()!; context: titleContext ?? null" />
        } @else {
            <a kbq-link pseudo>
                <span class="kbq-link__text">Mock Label</span>

                <i kbq-icon="kbq-calendar-o_16"></i>
            </a>
        }
    `
})
export class KbqTimeRangeTitle {
    readonly titleTemplate = input<TemplateRef<any>>();

    protected titleContext?: any;
}
