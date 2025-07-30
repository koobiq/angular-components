import { NgModule } from '@angular/core';
import { UsernameOverviewExample } from './username-overview/username-overview-example';

export { UsernameOverviewExample };

const EXAMPLES = [
    UsernameOverviewExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class UsernameExamplesModule {}
