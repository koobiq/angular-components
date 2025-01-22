import { NgModule } from '@angular/core';
import { KbqFilterBarActions } from './filter-bar-actions.component';
import { KbqFilterBarButton } from './filter-bar-button.component';
import { KbqFilterReset } from './filter-bar-reset.component';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilters } from './filters.component';
import { KbqPipeAdd } from './pipe-add';
import { KbqPipeDirective } from './pipe.directive';
import { KbqPipeButton } from './pipes/pipe-button';

const COMPONENTS = [
    KbqFilterBar,
    KbqFilters,
    KbqFilterBarActions,
    KbqFilterBarButton,
    KbqFilterReset,
    KbqPipeAdd,
    KbqPipeDirective,
    KbqPipeButton
];

@NgModule({
    exports: COMPONENTS,
    imports: COMPONENTS
})
export class KbqFilterBarModule {}
