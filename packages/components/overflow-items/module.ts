import { NgModule } from '@angular/core';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsResult } from './overflow-items';

const COMPONENTS = [
    KbqOverflowItems,
    KbqOverflowItem,
    KbqOverflowItemsResult
];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqOverflowItemsModule {}
