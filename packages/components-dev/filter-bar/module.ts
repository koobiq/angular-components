import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqFilter, KbqFilterBarModule } from '@koobiq/components/filter-bar';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    filters: KbqFilter[] = [
        {
            name: 'Filter 1',
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: 'text',
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: 'select',
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 3',
                    value: '3',
                    type: 'multi-select',
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 4',
                    value: '3',
                    type: 'tree-select',
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 5',
                    value: '3',
                    type: 'multi-tree-select',
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                }
            ],
            type: '',
            readonly: false,
            disabled: false,
            changed: false
        },
        {
            name: 'Filter 2',
            pipes: [
                {
                    name: 'pipe 1',
                    value: '1',
                    type: '',
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 2',
                    value: '2',
                    type: '',
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                },
                {
                    name: 'pipe 3',
                    value: '3',
                    type: '',
                    readonly: false,
                    empty: false,
                    disabled: false,
                    changed: false,
                    multiple: false
                }
            ],
            type: '',
            readonly: false,
            disabled: false,
            changed: false
        }
    ];
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        KbqIconModule,
        KbqFilterBarModule,
        KbqDividerModule,
        KbqButtonModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}