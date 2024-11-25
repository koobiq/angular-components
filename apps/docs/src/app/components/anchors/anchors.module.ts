import { NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { KbqTitleModule } from '../../../../../../packages/components/title';
import { AnchorsComponent } from './anchors.component';
import { HeaderDirective } from './header.directive';

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
