import { NgModule } from '@angular/core';
import {
    KbqBreadcrumbButton,
    KbqBreadcrumbItem,
    KbqBreadcrumbs,
    KbqBreadcrumbsSeparator,
    KbqBreadcrumbView
} from './breadcrumbs';

const COMPONENTS = [
    KbqBreadcrumbs,
    KbqBreadcrumbItem,
    KbqBreadcrumbView,
    KbqBreadcrumbsSeparator,
    KbqBreadcrumbButton
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqBreadcrumbsModule {}
