import { NgModule } from '@angular/core';
import { LoaderOverlayDefaultExample } from './loader-overlay-default/loader-overlay-default-example';
import { LoaderOverlayFixedTopExample } from './loader-overlay-fixed-top/loader-overlay-fixed-top-example';
import { LoaderOverlayLargeExample } from './loader-overlay-large/loader-overlay-large-example';
import { LoaderOverlayOverviewExample } from './loader-overlay-overview/loader-overlay-overview-example';
import { LoaderOverlaySizeExample } from './loader-overlay-size/loader-overlay-size-example';

export {
    LoaderOverlayDefaultExample,
    LoaderOverlayFixedTopExample,
    LoaderOverlayLargeExample,
    LoaderOverlayOverviewExample,
    LoaderOverlaySizeExample
};

const EXAMPLES = [
    LoaderOverlayOverviewExample,
    LoaderOverlayFixedTopExample,
    LoaderOverlayDefaultExample,
    LoaderOverlayLargeExample,
    LoaderOverlaySizeExample
];

@NgModule({
    imports: EXAMPLES,
    exports: EXAMPLES
})
export class LoaderOverlayExamplesModule {}
