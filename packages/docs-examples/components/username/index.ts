import { NgModule } from '@angular/core';
import { UsernameCustomExample } from './username-custom/username-custom-example';
import { UsernameOverviewExample } from './username-overview/username-overview-example';
import { UsernamePlaygroundExample } from './username-playground/username-playground-example';

export { UsernameCustomExample, UsernameOverviewExample, UsernamePlaygroundExample };

const EXAMPLES = [
    UsernameCustomExample,
    UsernameOverviewExample,
    UsernamePlaygroundExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class UsernameExamplesModule {}
