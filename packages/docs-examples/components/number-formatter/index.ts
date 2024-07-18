import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { NumberFormatterOverviewExample } from './number-formatter-overview/number-formatter-overview-example';

export { NumberFormatterOverviewExample };

const EXAMPLES = [NumberFormatterOverviewExample];

@NgModule({
    imports: [
        CommonModule,
        KbqFormattersModule,
        KbqInputModule,
        KbqFormFieldModule,
        FormsModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class NumberFormatterExamplesModule {}
