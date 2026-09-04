import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';
import {
    KbqSelectFooter,
    KbqSelectMatcher,
    KbqSelectSearch,
    KbqSelectSearchEmptyResult,
    KbqSelectTrigger
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelect } from './tree-select.component';

/**
 * The module declares nothing — `KbqTreeSelect` is standalone and brings its own imports — so the
 * entries below are here either to be re-exported or for the providers they carry (`OverlayModule`,
 * `KbqTagsModule`, `KbqTreeModule`).
 */
@NgModule({
    imports: [
        OverlayModule,
        KbqTreeModule,
        KbqTagsModule,
        KbqSelectSearch,
        KbqSelectFooter,
        KbqSelectMatcher,
        KbqSelectTrigger,
        KbqSelectSearchEmptyResult,
        KbqTreeSelect
    ],
    exports: [
        KbqTreeSelect,
        // `kbq-tree-selection` content is mandatory, so importing the tree-select without the tree
        // gives a consumer a control they cannot fill.
        KbqTreeModule,
        KbqSelectSearch,
        KbqSelectFooter,
        KbqSelectMatcher,
        KbqSelectTrigger,
        KbqSelectSearchEmptyResult,
        KbqFormFieldModule
    ]
})
export class KbqTreeSelectModule {}
