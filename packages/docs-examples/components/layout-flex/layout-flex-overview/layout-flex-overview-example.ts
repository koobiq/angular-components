import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Layout-flex
 */
@Component({
    standalone: true,
    selector: 'layout-flex-overview-example',
    styleUrls: ['layout-flex-overview-example.css'],
    imports: [
        KbqRadioModule,
        FormsModule
    ],
    template: `
        <kbq-radio-group class="layout-margin-top-4xl" [(ngModel)]="layoutDirection">
            <kbq-radio-button [value]="'layout-column'">layout-column</kbq-radio-button>
            <kbq-radio-button [value]="'layout-row'">layout-row</kbq-radio-button>
        </kbq-radio-group>
        <div class="layout-margin-top-4xl" [class]="layoutDirection">
            <div class="flex block">first</div>
            <div class="flex block">second</div>
            <div class="flex block">third</div>
        </div>
    `
})
export class LayoutFlexOverviewExample {
    layoutDirection: string = 'layout-column';
}
