import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqSelectModule } from '@koobiq/components/select';
import { DocsearchComponent } from '../docsearch/docsearch.component';
import { NavbarComponent } from './navbar.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqLinkModule,
        KbqIconModule,
        KbqSelectModule,
        KbqNavbarModule,
        DocsearchComponent,
    ],
    exports: [NavbarComponent],
    declarations: [NavbarComponent],
})
export class NavbarModule {}
