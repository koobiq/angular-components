import { NgModule } from '@angular/core';
import { KbqSidebar, KbqSidebarClosed, KbqSidebarOpened } from './sidebar';

const COMPONENTS = [
    KbqSidebarClosed,
    KbqSidebarOpened,
    KbqSidebar
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqSidebarModule {}
