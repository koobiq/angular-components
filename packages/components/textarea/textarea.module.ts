import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCommonModule } from '@koobiq/components/core';
import { KbqTextarea } from './textarea.component';

@NgModule({
    imports: [A11yModule, KbqCommonModule, FormsModule],
    exports: [KbqTextarea],
    declarations: [KbqTextarea]
})
export class KbqTextareaModule {}
