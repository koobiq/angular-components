import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { KbqDdComponent, KbqDlComponent, KbqDtComponent } from './dl.component';

@NgModule({
    imports: [
        A11yModule,
        PlatformModule
    ],
    exports: [
        KbqDlComponent,
        KbqDtComponent,
        KbqDdComponent
    ],
    declarations: [
        KbqDlComponent,
        KbqDtComponent,
        KbqDdComponent
    ]
})
export class KbqDlModule {}
