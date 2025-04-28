import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Layout-flex behaviour modifiers
 */
@Component({
    standalone: true,
    selector: 'layout-flex-behaviour-modifiers-example',
    styleUrls: ['layout-flex-behaviour-modifiers-example.css'],
    imports: [
        KbqRadioModule,
        FormsModule
    ],
    template: `
        <div class="example-controls  layout-margin-top-4xl">
            <kbq-radio-group [(ngModel)]="flexClass">
                <kbq-radio-button [value]="'flex'">flex</kbq-radio-button>
                <kbq-radio-button [value]="'flex-none'">flex-none</kbq-radio-button>
                <kbq-radio-button [value]="'flex-auto'">flex-auto</kbq-radio-button>
                <kbq-radio-button [value]="'flex-grow'">flex-grow</kbq-radio-button>
                <kbq-radio-button [value]="'flex-nogrow'">flex-nogrow</kbq-radio-button>
                <kbq-radio-button [value]="'flex-noshrink'">flex-noshrink</kbq-radio-button>
            </kbq-radio-group>
        </div>
        <div class="layout-row example-block  layout-margin-top-4xl">
            <div class="example-block {{ flexClass }}">flex</div>
            <div class="flex example-block">flex</div>
            <div class="flex-none example-block">flex-none</div>
        </div>
    `
})
export class LayoutFlexBehaviourModifiersExample {
    flexClass: string = 'flex';
}
