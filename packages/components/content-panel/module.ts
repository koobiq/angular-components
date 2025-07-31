import { NgModule } from '@angular/core';
import {
    KbqContentPanel,
    KbqContentPanelAside,
    KbqContentPanelBody,
    KbqContentPanelContainer,
    KbqContentPanelFooter,
    KbqContentPanelHeader,
    KbqContentPanelHeaderActions,
    KbqContentPanelHeaderTitle
} from './content-panel';

const COMPONENTS = [
    KbqContentPanelContainer,
    KbqContentPanel,
    KbqContentPanelAside,
    KbqContentPanelHeader,
    KbqContentPanelHeaderTitle,
    KbqContentPanelHeaderActions,
    KbqContentPanelBody,
    KbqContentPanelFooter
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqContentPanelModule {}
