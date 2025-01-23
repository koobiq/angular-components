import { NgModule } from '@angular/core';
import { KbqFilterBar } from './filter-bar';
import { KbqFilterBarButton } from './filter-bar-button';
import { KbqFilterBarRefresher } from './filter-bar-refresher';
import { KbqFilterReset } from './filter-bar-reset';
import { KbqFilterBarSearch } from './filter-bar-search';
import { KbqFilters } from './filters';
import { KbqPipeAdd } from './pipe-add';
import { KbqPipeDirective } from './pipe.directive';
import { KbqPipeButton } from './pipes/pipe-button';

const COMPONENTS = [
    KbqFilterBar,
    KbqFilters,
    KbqFilterBarRefresher,
    KbqFilterBarButton,
    KbqFilterReset,
    KbqPipeAdd,
    KbqPipeDirective,
    KbqPipeButton,
    KbqFilterBarSearch
];

@NgModule({
    exports: COMPONENTS,
    imports: COMPONENTS
})
export class KbqFilterBarModule {}
