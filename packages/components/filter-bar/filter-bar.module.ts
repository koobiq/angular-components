import { NgModule } from '@angular/core';
import { KbqFilterBarActions } from './filter-bar-actions.component';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilters } from './filters.component';
import { KbqPipes } from './pipes.component';
import { KbqPipeComponent } from './pipes/pipe.component';

const COMPONENTS = [
    KbqFilterBar,
    KbqFilters,
    KbqPipes,
    KbqPipeComponent,
    KbqFilterBarActions
];

@NgModule({
    exports: COMPONENTS,
    imports: COMPONENTS
})
export class KbqFilterBarModule {}
