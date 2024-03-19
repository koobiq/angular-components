// tslint:disable:no-console
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqBadgeColors } from '@koobiq/components/badge';

import { KbqRiskLevelModule } from '../../components/risk-level';


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    colors = KbqBadgeColors;
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqRiskLevelModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
