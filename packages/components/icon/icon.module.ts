import { NgModule } from '@angular/core';
import { KbqIcon } from './icon.component';
import { KbqIconButton } from './icon-button.component';
import { KbqIconItem } from './icon-item.component';

const COMPONENTS = [
    KbqIcon,
    KbqIconButton,
    KbqIconItem
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqIconModule {}
