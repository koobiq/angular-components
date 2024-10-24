import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqComponentColors } from '@koobiq/components/core';
import { iconsNames, KbqSvgIconModule } from '../../components/svg-icon';
import { KbqSvgIconRegistryService } from '../../components/svg-icon/svg-icon-registry.service';

@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoComponent {
    protected readonly colors = KbqComponentColors;

    constructor(iconReg: KbqSvgIconRegistryService) {
        iconsNames.forEach((name) => {
            iconReg.loadSvg('/assets/SVGIcons/' + name + '.svg', name);
        });
    }
}

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
