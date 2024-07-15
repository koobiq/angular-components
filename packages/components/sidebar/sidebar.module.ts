import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqSidebar, KbqSidebarClosed, KbqSidebarOpened } from './sidebar.component';

@NgModule({
    imports: [CommonModule],
    declarations: [
        KbqSidebarClosed,
        KbqSidebarOpened,
        KbqSidebar,
    ],
    exports: [
        KbqSidebarClosed,
        KbqSidebarOpened,
        KbqSidebar,
    ],
})
export class KbqSidebarModule {}
