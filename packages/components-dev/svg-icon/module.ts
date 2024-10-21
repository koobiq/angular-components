import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton, KbqIconItem } from '@koobiq/components/icon';
import { KbqSvgIconModule } from '../../components/svg-icon';

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
        KbqSvgIconModule.forRoot(),
        KbqIcon,
        KbqIconButton,
        KbqIconItem
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
