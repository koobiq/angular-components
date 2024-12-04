import { NgModule } from '@angular/core';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilters } from './filters.component';

const COMPONENTS = [
    KbqFilterBar,
    KbqFilters
];

@NgModule({
    exports: COMPONENTS,
    imports: COMPONENTS
})
export class KbqFilterBarModule {}
