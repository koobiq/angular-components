import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCardModule } from '@koobiq/components/card';
import { CardOverviewExample } from './card-overview/card-overview-example';

export { CardOverviewExample };

const EXAMPLES = [
    CardOverviewExample,
];

@NgModule({
    imports: [
        FormsModule,
        KbqCardModule,
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES,
})
export class CardExamplesModule {}
