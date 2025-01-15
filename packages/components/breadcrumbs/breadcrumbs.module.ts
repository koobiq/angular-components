import { NgModule } from '@angular/core';
import {
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    KbqBreadcrumbsSeparator,
    KbqBreadcrumbView,
    KbqDefaultBreadcrumbStyler
} from './breadcrumbs';

const COMPONENTS = [
    KbqBreadcrumbs,
    KbqBreadcrumbItem,
    KbqBreadcrumbView,
    KbqBreadcrumbsSeparator,
    KbqDefaultBreadcrumbStyler
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqBreadcrumbsModule {}
