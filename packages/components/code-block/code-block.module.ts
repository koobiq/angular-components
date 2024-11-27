import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqActionBarComponent } from './actionbar.component';
import { KbqCodeBlockContent } from './code-block-content';
import { KbqCodeBlockComponent } from './code-block.component';

@NgModule({
    imports: [
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqTabsModule,
        KbqCodeBlockContent
    ],
    declarations: [
        KbqCodeBlockComponent,
        KbqActionBarComponent
    ],
    exports: [KbqCodeBlockComponent]
})
export class KbqCodeBlockModule {}
