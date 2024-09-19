import { AsyncPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTimezoneModule } from '@koobiq/components/timezone';
import { TimezoneOverviewExample } from './timezone-overview/timezone-overview-example';
import { TimezoneSearchOverviewExample } from './timezone-search-overview/timezone-search-overview-example';
import { TimezoneTriggerOverviewExample } from './timezone-trigger-overview/timezone-trigger-overview-example';

export { TimezoneOverviewExample, TimezoneSearchOverviewExample, TimezoneTriggerOverviewExample };

const EXAMPLES = [
    TimezoneOverviewExample,
    TimezoneSearchOverviewExample,
    TimezoneTriggerOverviewExample
];

@NgModule({
    imports: [
        FormsModule,
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqTimezoneModule,
        KbqSelectModule,
        KbqInputModule,
        KbqIconModule,
        AsyncPipe
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class TimezoneExamplesModule {}
