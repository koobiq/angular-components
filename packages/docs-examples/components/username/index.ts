import { NgModule } from '@angular/core';
import { UsernameOverviewExample } from './username-overview/username-overview-example';
import { UsernamePlaygroundExample } from './username-playground/username-playground-example';

export { UsernameOverviewExample, UsernamePlaygroundExample };

const EXAMPLES = [
    UsernameOverviewExample,
    UsernamePlaygroundExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class UsernameExamplesModule {}
