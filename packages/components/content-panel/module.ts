import { NgModule } from '@angular/core';
import {
    KbqContentPanel,
    KbqContentPanelBody,
    KbqContentPanelFooter,
    KbqContentPanelHeader,
    KbqContentPanelTitle,
    KbqContentPanelToolbar
} from './content-panel';
import { KbqResizable } from './resize';

const COMPONENTS = [
    KbqContentPanel,
    KbqContentPanelBody,
    KbqContentPanelToolbar,
    KbqContentPanelHeader,
    KbqContentPanelFooter,
    KbqContentPanelTitle,
    KbqResizable
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqContentPanelModule {}
