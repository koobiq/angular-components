import { NgModule } from '@angular/core';
import { KbqActionsPanelContainer } from './actions-panel-container';

const COMPONENTS = [
    KbqActionsPanelContainer
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqActionsPanelModule {}
