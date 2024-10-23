import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqSvgIconModule } from '../../components/svg-icon';
import { KbqSvgIconRegistryService } from '../../components/svg-icon/svg-icon-registry.service';

const folderOpen = require('@koobiq/icons/svg/folder-open_16.svg') as string;
const chevronDownS = require('@koobiq/icons/svg/chevron-down-s_16.svg') as string;
const calendarO = require('@koobiq/icons/svg/calendar-o_16.svg') as string;
const clock = require('@koobiq/icons/svg/clock_16.svg') as string;

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
        iconReg.addSvg('folder-open', folderOpen);
        iconReg.addSvg('chevron-down-s', chevronDownS);
        iconReg.addSvg('calendar-o', calendarO);
        iconReg.addSvg('clock', clock);
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
