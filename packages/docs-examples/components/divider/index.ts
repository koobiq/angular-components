import { NgModule } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

import { DividerOverviewExample } from './divider-overview/divider-overview-example';
import { DividerVerticalExample } from './divider-vertical/divider-vertical-example';


export {
    DividerOverviewExample,
    DividerVerticalExample
};

const EXAMPLES = [
    DividerOverviewExample,
    DividerVerticalExample
];

@NgModule({
    imports: [KbqDividerModule],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class DividerExamplesModule {}
