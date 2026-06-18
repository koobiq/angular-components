import { NgModule } from '@angular/core';
import { TitleCustomContentExample } from './title-custom-content/title-custom-content-example';
import { TitleListOptionExample } from './title-list-option/title-list-option-example';
import { TitleMultipleTextExample } from './title-multiple-text/title-multiple-text-example';
import { TitleOverviewExample } from './title-overview/title-overview-example';
import { TitleVerticalOverflowExample } from './title-vertical-overflow/title-vertical-overflow-example';

export {
    TitleCustomContentExample,
    TitleListOptionExample,
    TitleMultipleTextExample,
    TitleOverviewExample,
    TitleVerticalOverflowExample
};

const EXAMPLES = [
    TitleOverviewExample,
    TitleCustomContentExample,
    TitleMultipleTextExample,
    TitleVerticalOverflowExample,
    TitleListOptionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TitleExamplesModule {}
