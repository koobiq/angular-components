import { NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AnchorsComponent } from './anchors.component';
import { HeaderDirective } from './header.directive';
import { KbqTitleModule } from '../../../../../../packages/components/title';

@NgModule({
    imports: [
        RouterModule,
        NgClass,
        KbqTitleModule
    ],
    exports: [AnchorsComponent, HeaderDirective],
    declarations: [AnchorsComponent, HeaderDirective]
})
export class AnchorsModule {}
