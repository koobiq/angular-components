import { NgModule } from '@angular/core';
import { KbqActionsPanel } from './actions-panel';
import { KbqActionsPanelContainer } from './actions-panel-container';

const COMPONENTS = [
    KbqActionsPanelContainer
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS,
    providers: [KbqActionsPanel]
})
export class KbqActionsPanelModule {}
