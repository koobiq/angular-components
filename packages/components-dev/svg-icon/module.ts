import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqSvgIconModule } from '../../components/svg-icon';
import { HttpClientModule } from '@angular/common/http';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponent {}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        HttpClientModule,
        BrowserModule,
        KbqSvgIconModule.forRoot()
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
