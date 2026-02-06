import { NgModule } from '@angular/core';
import { KbqSkeleton } from './skeleton';

const COMPONENTS = [KbqSkeleton];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqSkeletonModule {}
