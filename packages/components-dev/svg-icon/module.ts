import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqSvgIconModule, provideKbqSvgIconsConfig } from '../../components/svg-icon';

const mockKbqSvgIcons = {
    AngleDownL16: '<svg></svg>'
};

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponent {
    protected readonly colors = KbqComponentColors;
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        HttpClientModule,
        BrowserModule,
        KbqSvgIconModule.withIcons(mockKbqSvgIcons)],
    bootstrap: [DemoComponent],
    providers: [
        provideKbqSvgIconsConfig({
            size: '24px',
            color: 'black'
        })

    ]
})
export class DemoModule {}
