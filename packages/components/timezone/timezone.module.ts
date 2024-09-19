import { OverlayModule } from '@angular/cdk/overlay';
import { KeyValuePipe, NgClass } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqHighlightModule, KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { CitiesByFilterPipe } from './cities-by-filter.pipe';
import { KbqTimezoneOption } from './timezone-option.component';
import { KbqTimezoneOptionTooltip } from './timezone-option.directive';
import { KbqTimezoneSelect, KbqTimezoneSelectTrigger } from './timezone-select.component';
import { UtcOffsetPipe } from './utc-offset.pipe';

@NgModule({
    imports: [
        OverlayModule,
        KbqFormFieldModule,
        KbqOptionModule,
        KbqSelectModule,
        KbqIconModule,
        KbqTagsModule,
        KbqToolTipModule,
        KbqHighlightModule,
        NgClass,
        KeyValuePipe
    ],
    declarations: [
        UtcOffsetPipe,
        CitiesByFilterPipe,
        KbqTimezoneSelect,
        KbqTimezoneOption,
        KbqTimezoneOptionTooltip,
        KbqTimezoneSelectTrigger
    ],
    exports: [
        KbqTimezoneSelect,
        KbqTimezoneOption,
        KbqTimezoneOptionTooltip,
        KbqTimezoneSelectTrigger
    ]
})
export class KbqTimezoneModule {}
