import { NgModule } from '@angular/core';
import { KbqFilterBarActions } from './filter-bar-actions.component';
import { KbqFilterAdd } from './filter-bar-add.component';
import { KbqFilterBarButton } from './filter-bar-button.component';
import { KbqFilterReset } from './filter-bar-reset.component';
import { KbqFilterBar } from './filter-bar.component';
import { KbqFilters } from './filters.component';
import { KbqPipeComponent } from './pipe.component';

const COMPONENTS = [
    KbqFilterBar,
    KbqFilters,
    KbqPipeComponent,
    KbqFilterBarActions,
    KbqFilterBarButton,
    KbqFilterReset,
    KbqFilterAdd
];

@NgModule({
    exports: COMPONENTS,
    imports: COMPONENTS
})
export class KbqFilterBarModule {}
