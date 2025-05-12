import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Layout-flex alignment
 */
@Component({
    standalone: true,
    selector: 'layout-flex-alignment-example',
    styleUrls: ['layout-flex-alignment-example.css'],
    imports: [
        KbqRadioModule,
        FormsModule
    ],
    template: `
        <div class="example-controls layout-margin-top-4xl">
            <kbq-radio-group [(ngModel)]="layoutHorizontalAlignment">
                <header>Horizontal</header>
                <kbq-radio-button [value]="'-start'">start</kbq-radio-button>
                <kbq-radio-button [value]="'-center'">center</kbq-radio-button>
                <kbq-radio-button [value]="'-end'">end</kbq-radio-button>
                <kbq-radio-button [value]="'-space-around'">space-around</kbq-radio-button>
                <kbq-radio-button [value]="'-space-between'">space-between</kbq-radio-button>
            </kbq-radio-group>

            <kbq-radio-group [(ngModel)]="layoutVerticalAlignment">
                <header>Vertical</header>
                <kbq-radio-button [value]="">(none)</kbq-radio-button>
                <kbq-radio-button [value]="'-start'">start</kbq-radio-button>
                <kbq-radio-button [value]="'-center'">center</kbq-radio-button>
                <kbq-radio-button [value]="'-end'">end</kbq-radio-button>
                <kbq-radio-button [value]="'-stretch'">stretch</kbq-radio-button>
            </kbq-radio-group>
        </div>

        <header class="layout-padding  layout-margin-top-4xl">
            class: layout-align{{ layoutHorizontalAlignment }}{{ layoutVerticalAlignment }}
        </header>
        <div
            class="example-container example-block layout-row layout-align{{ layoutHorizontalAlignment }}{{
                layoutVerticalAlignment
            }}"
        >
            <div class="example-block">block 1</div>
            <div class="example-block">block 2</div>
            <div class="example-block">block 3</div>
        </div>
    `
})
export class LayoutFlexAlignmentExample {
    layoutHorizontalAlignment: string = '-start';
    layoutVerticalAlignment: string = '-start';
}
