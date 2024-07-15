import { A11yModule } from '@angular/cdk/a11y';
import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { KbqIconButton } from './icon-button.component';
import { KbqIconItem } from './icon-item.component';
import { KbqIcon } from './icon.component';

@NgModule({
    imports: [
        CommonModule,
        A11yModule,
        PlatformModule,
    ],
    exports: [
        KbqIcon,
        KbqIconButton,
        KbqIconItem,
    ],
    declarations: [
        KbqIcon,
        KbqIconButton,
        KbqIconItem,
    ],
})
export class KbqIconModule {}
