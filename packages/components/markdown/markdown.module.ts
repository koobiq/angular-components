import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCommonModule } from '@koobiq/components/core';
import { KbqMarkdown } from './markdown.component';
import { KbqMarkdownService } from './markdown.service';

@NgModule({
    imports: [A11yModule, KbqCommonModule, FormsModule],
    exports: [KbqMarkdown],
    declarations: [KbqMarkdown],
    providers: [KbqMarkdownService]
})
export class KbqMarkdownModule {}
