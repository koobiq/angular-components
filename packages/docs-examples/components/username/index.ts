import { NgModule } from '@angular/core';
import { UsernameAsLinkExample } from './username-as-link/username-as-link-example';
import { UsernameCustomExample } from './username-custom/username-custom-example';
import { UsernameOverviewExample } from './username-overview/username-overview-example';
import { UsernamePlaygroundExample } from './username-playground/username-playground-example';

export { UsernameAsLinkExample, UsernameCustomExample, UsernameOverviewExample, UsernamePlaygroundExample };

const EXAMPLES = [
    UsernameCustomExample,
    UsernameOverviewExample,
    UsernamePlaygroundExample,
    UsernameAsLinkExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class UsernameExamplesModule {}
