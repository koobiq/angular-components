import { NgModule } from '@angular/core';
import { NavbarAppLongNameExample } from './navbar-app-long-name/navbar-app-long-name-example';
import { NavbarItemSuffixExample } from './navbar-item-suffix/navbar-item-suffix-example';
import { NavbarOverviewExample } from './navbar-overview/navbar-overview-example';
import { NavbarTemplateOutletExample } from './navbar-template-outlet/navbar-template-outlet-example';
import { NavbarVerticalAppLongNameExample } from './navbar-vertical-app-long-name/navbar-vertical-app-long-name-example';
import { NavbarVerticalItemSuffixExample } from './navbar-vertical-item-suffix/navbar-vertical-item-suffix-example';
import { NavbarVerticalOpenOverExample } from './navbar-vertical-open-over/navbar-vertical-open-over-example';
import { NavbarVerticalExample } from './navbar-vertical/navbar-vertical-example';

export {
    NavbarAppLongNameExample,
    NavbarItemSuffixExample,
    NavbarOverviewExample,
    NavbarTemplateOutletExample,
    NavbarVerticalAppLongNameExample,
    NavbarVerticalExample,
    NavbarVerticalItemSuffixExample,
    NavbarVerticalOpenOverExample
};

const EXAMPLES = [
    NavbarOverviewExample,
    NavbarTemplateOutletExample,
    NavbarVerticalExample,
    NavbarVerticalOpenOverExample,
    NavbarVerticalAppLongNameExample,
    NavbarAppLongNameExample,
    NavbarItemSuffixExample,
    NavbarVerticalItemSuffixExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class NavbarExamplesModule {}
