import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarModule } from '@koobiq/components/scrollbar';
import { KbqTreeModule } from '@koobiq/components/tree';
import { DocumentationItems } from '../documentation-items';
import { FooterModule } from '../footer/footer.module';
import { ComponentSidenav } from './sidenav.component';

@NgModule({
    imports: [
        RouterModule,
        FormsModule,
        KbqIconModule,
        KbqTreeModule,
        KbqDividerModule,
        FooterModule,
        KbqScrollbarModule
    ],
    exports: [ComponentSidenav],
    declarations: [ComponentSidenav],
    providers: [DocumentationItems]
})
export class SidenavModule {}
