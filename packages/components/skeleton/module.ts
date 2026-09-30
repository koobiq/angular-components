import { NgModule } from '@angular/core';
import { KbqSkeleton } from './skeleton';
import {
    KbqSkeletonAccordion,
    KbqSkeletonBadge,
    KbqSkeletonButton,
    KbqSkeletonCheckable,
    KbqSkeletonDl,
    KbqSkeletonFormField,
    KbqSkeletonGroup,
    KbqSkeletonIcon,
    KbqSkeletonLink,
    KbqSkeletonTable,
    KbqSkeletonTabs,
    KbqSkeletonTag,
    KbqSkeletonTree,
    KbqSkeletonTypography
} from './skeleton-presets';

const COMPONENTS = [
    KbqSkeleton,
    KbqSkeletonButton,
    KbqSkeletonBadge,
    KbqSkeletonTag,
    KbqSkeletonIcon,
    KbqSkeletonLink,
    KbqSkeletonTypography,
    KbqSkeletonDl,
    KbqSkeletonTable,
    KbqSkeletonGroup,
    KbqSkeletonFormField,
    KbqSkeletonAccordion,
    KbqSkeletonCheckable,
    KbqSkeletonTabs,
    KbqSkeletonTree
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqSkeletonModule {}
