import { NgModule } from '@angular/core';
import {
    KbqContentPanel,
    KbqContentPanelBody,
    KbqContentPanelFooter,
    KbqContentPanelHeader,
    KbqContentPanelTitle,
    KbqContentPanelToolbar
} from './content-panel';

const COMPONENTS = [
    KbqContentPanel,
    KbqContentPanelBody,
    KbqContentPanelToolbar,
    KbqContentPanelHeader,
    KbqContentPanelFooter,
    KbqContentPanelTitle
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqContentPanelModule {}
