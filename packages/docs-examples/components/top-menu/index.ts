import { NgModule } from '@angular/core';
import { TopMenuOverviewExample } from './top-menu-overview/top-menu-overview-example';

export { TopMenuOverviewExample };

const EXAMPLES = [
    TopMenuOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class TopMenuExamplesModule {}
