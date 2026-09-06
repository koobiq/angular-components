import { NgModule } from '@angular/core';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { CitiesByFilterPipe } from './cities-by-filter.pipe';
import { KbqTimezoneOption } from './timezone-option.component';
import { KbqTimezoneOptionTooltip } from './timezone-option.directive';
import { KbqTimezoneSelect, KbqTimezoneSelectTrigger } from './timezone-select.component';
import { UtcOffsetPipe } from './utc-offset.pipe';

@NgModule({
    imports: [
        UtcOffsetPipe,
        CitiesByFilterPipe,
        KbqTimezoneSelect,
        KbqTimezoneOption,
        KbqTimezoneOptionTooltip,
        KbqTimezoneSelectTrigger
    ],
    exports: [
        UtcOffsetPipe,
        CitiesByFilterPipe,
        KbqTimezoneSelect,
        KbqTimezoneOption,
        KbqTimezoneOptionTooltip,
        KbqTimezoneSelectTrigger,
        // Re-exported rather than only imported: every documented usage groups the options with
        // `kbq-optgroup` and renders the select inside a `kbq-form-field`.
        KbqOptionModule,
        KbqFormFieldModule
    ]
})
export class KbqTimezoneModule {}
