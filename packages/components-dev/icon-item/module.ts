import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '../../components/icon/';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    colors = KbqComponentColors;
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqIconModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
