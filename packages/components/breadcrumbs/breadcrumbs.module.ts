import { NgModule } from '@angular/core';
import {
    KbqBreadcrumbButton,
    KbqBreadcrumbItem,
    KbqBreadcrumbItemContainer,
    KbqBreadcrumbs,
    KbqBreadcrumbsSeparator,
    KbqBreadcrumbView
} from './breadcrumbs';

const COMPONENTS = [
    KbqBreadcrumbs,
    KbqBreadcrumbItem,
    KbqBreadcrumbView,
    KbqBreadcrumbsSeparator,
    KbqBreadcrumbButton,
    KbqBreadcrumbItemContainer
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqBreadcrumbsModule {}
