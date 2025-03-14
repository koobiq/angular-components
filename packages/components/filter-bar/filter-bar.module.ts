import { NgModule } from '@angular/core';
import { KbqFilterBar } from './filter-bar';
import { KbqFilterBarButton } from './filter-bar-button';
import { KbqFilterBarRefresher } from './filter-refresher';
import { KbqFilterReset } from './filter-reset';
import { KbqFilterBarSearch } from './filter-search';
import { KbqFilters } from './filters';
import { KbqPipeAdd } from './pipe-add';
import { KbqPipeDirective } from './pipe.directive';
import { KbqPipeButton } from './pipes/pipe-button';
import { KbqPipeState } from './pipes/pipe-state';
import { KbqPipeTitleDirective } from './pipes/pipe-title';

const COMPONENTS = [
    KbqFilterBar,
    KbqFilters,
    KbqFilterBarRefresher,
    KbqFilterBarButton,
    KbqFilterReset,
    KbqPipeAdd,
    KbqPipeDirective,
    KbqPipeButton,
    KbqFilterBarSearch,
    KbqPipeTitleDirective,
    KbqPipeState
];

@NgModule({
    exports: COMPONENTS,
    imports: COMPONENTS
})
export class KbqFilterBarModule {}
