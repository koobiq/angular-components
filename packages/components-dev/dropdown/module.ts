import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqTitleModule } from '@koobiq/components/title';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    colors = KbqComponentColors;
    styles = KbqButtonStyles;

    pools = [
        {
            id: 1,
            name: 'x',
            domains: [
                { id: 10, name: 'ax' },
                { id: 11, name: 'bx' }
            ]
        },
        {
            id: 2,
            name: 'y',
            domains: [
                { id: 20, name: 'ay' },
                { id: 21, name: 'by' }
            ]
        },
        {
            id: 3,
            name: 'z',
            domains: [
                { id: 30, name: 'az' },
                { id: 31, name: 'bz' }
            ]
        }
    ];

    someValue = 'Lazy Value';

    selectDomain(id: string): void {
        console.log('selected domain id', id);
    }
}

@NgModule({
    declarations: [
        DemoComponent
    ],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        KbqLinkModule,
        KbqIconModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqTitleModule,
        KbqDividerModule,
        KbqOptionModule
    ],
    bootstrap: [
        DemoComponent
    ]
})
export class DemoModule {}
