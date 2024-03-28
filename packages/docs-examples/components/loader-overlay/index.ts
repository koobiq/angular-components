import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

import { LoaderOverlayDefaultExample } from './loader-overlay-default/loader-overlay-default-example';
import {
    LoaderOverlayFixedTopExample
} from './loader-overlay-fixed-top/loader-overlay-fixed-top-example';
import { LoaderOverlayLargeExample } from './loader-overlay-large/loader-overlay-large-example';
import { LoaderOverlayOverviewExample } from './loader-overlay-overview/loader-overlay-overview-example';


export {
    LoaderOverlayOverviewExample,
    LoaderOverlayFixedTopExample,
    LoaderOverlayDefaultExample,
    LoaderOverlayLargeExample
};

const EXAMPLES = [
    LoaderOverlayOverviewExample,
    LoaderOverlayFixedTopExample,
    LoaderOverlayDefaultExample,
    LoaderOverlayLargeExample
];

@NgModule({
    imports: [
        CommonModule,
        KbqProgressSpinnerModule,
        KbqLoaderOverlayModule
    ],
    declarations: EXAMPLES,
    exports: EXAMPLES
})
export class LoaderOverlayExamplesModule {}
