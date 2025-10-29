import { A11yModule } from '@angular/cdk/a11y';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextarea } from './textarea.component';

@NgModule({
    imports: [A11yModule, FormsModule],
    exports: [KbqTextarea, KbqFormFieldModule],
    declarations: [KbqTextarea]
})
export class KbqTextareaModule {}
