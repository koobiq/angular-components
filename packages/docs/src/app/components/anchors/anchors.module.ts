import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AnchorsComponent } from './anchors.component';
import { HeaderDirective } from './header.directive';


@NgModule({
    imports: [CommonModule, RouterModule],
    exports: [AnchorsComponent, HeaderDirective],
    declarations: [AnchorsComponent, HeaderDirective]
})
export class AnchorsModule {}
