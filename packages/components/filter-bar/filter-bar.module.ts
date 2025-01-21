import { NgModule } from '@angular/core';
import { KbqFilterBarActions } from './filter-bar-actions.component';
import { KbqFilterAdd } from './filter-bar-add.component';
import { KbqFilterBarButton } from './filter-bar-button.component';
import { KbqFilterReset } from './filter-bar-reset.component';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilters } from './filters.component';
import { KbqPipeDirective } from './pipe.directive';

const COMPONENTS = [
    KbqFilterBar,
    KbqFilters,
    KbqFilterBarActions,
    KbqFilterBarButton,
    KbqFilterReset,
    KbqFilterAdd,
    KbqPipeDirective
];

@NgModule({
    exports: COMPONENTS,
    imports: COMPONENTS
})
export class KbqFilterBarModule {}
