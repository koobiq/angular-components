import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { HIGHLIGHT_OPTIONS, HighlightModule } from 'ngx-highlightjs';

import { KbqActionBarComponent } from './actionbar.component';
import { KbqCodeBlockComponent } from './code-block.component';


@NgModule({
    imports: [
        CommonModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        HighlightModule,
        KbqTabsModule
    ], // , I18nModule
    declarations: [
        KbqCodeBlockComponent,
        KbqActionBarComponent
    ],
    providers: [{
        provide: HIGHLIGHT_OPTIONS,
        useValue: {
            fullLibraryLoader: () => import('highlight.js'),
            lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'),
            lineNumbers: true
        }
    }],
    exports: [KbqCodeBlockComponent]
})
export class KbqCodeBlockModule {}
