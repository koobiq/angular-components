import { NgModule } from '@angular/core';
import { KbqFilterBar } from './filter-bar';
import { KbqFilterBarButton } from './filter-bar-button';
import { kbqFilterBarPipesProvider } from './filter-bar-pipes';
import { KbqFilterRefresher } from './filter-refresher';
import { KbqFilterReset } from './filter-reset';
import { KbqFilters } from './filters';
import { KbqPipeAdd } from './pipe-add';
import { KbqPipeDirective } from './pipe.directive';
import { KbqPipeButton } from './pipes/pipe-button';
import { KbqPipeState } from './pipes/pipe-state';
import { KbqPipeTitle } from './pipes/pipe-title';

const COMPONENTS = [
    KbqFilterBar,
    KbqFilters,
    KbqFilterRefresher,
    KbqFilterBarButton,
    KbqFilterReset,
    KbqPipeAdd,
    KbqPipeDirective,
    KbqPipeButton,
    KbqPipeState,
    KbqPipeTitle
];

@NgModule({
    imports: COMPONENTS,
    providers: [kbqFilterBarPipesProvider()],
    exports: COMPONENTS
})
export class KbqFilterBarModule {}
