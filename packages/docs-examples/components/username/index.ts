import { NgModule } from '@angular/core';
import { UsernameAsLinkExample } from './username-as-link/username-as-link-example';
import { UsernameCustomExample } from './username-custom/username-custom-example';
import { UsernameFilterBarOptionExample } from './username-filter-bar-option/username-filter-bar-option-example';
import { UsernameOverviewExample } from './username-overview/username-overview-example';
import { UsernamePlaygroundExample } from './username-playground/username-playground-example';
import { UsernameSearchExample } from './username-search/username-search-example';

export {
    UsernameAsLinkExample,
    UsernameCustomExample,
    UsernameFilterBarOptionExample,
    UsernameOverviewExample,
    UsernamePlaygroundExample,
    UsernameSearchExample
};

const EXAMPLES = [
    UsernameCustomExample,
    UsernameOverviewExample,
    UsernamePlaygroundExample,
    UsernameAsLinkExample,
    UsernameSearchExample,
    UsernameFilterBarOptionExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class UsernameExamplesModule {}
