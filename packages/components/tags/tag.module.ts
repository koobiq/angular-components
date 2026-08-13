import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { ENTER } from '@koobiq/components/core';
import { KbqTagInput, kbqTagsDefaultOptionsProvider } from './tag-input';
import { KbqTagList } from './tag-list.component';
import {
    KbqTag,
    KbqTagAvatar,
    KbqTagEditInput,
    KbqTagEditSubmit,
    KbqTagPrefix,
    KbqTagRemove,
    KbqTagSuffix,
    KbqTagTrailingIcon
} from './tag.component';

const COMPONENTS = [
    KbqTagEditSubmit,
    KbqTagEditInput,
    KbqTagPrefix,
    KbqTagSuffix
];

@NgModule({
    imports: [
        PlatformModule,
        ...COMPONENTS,
        KbqTagList,
        KbqTag,
        KbqTagInput,
        KbqTagTrailingIcon,
        KbqTagAvatar,
        KbqTagRemove
    ],
    providers: [kbqTagsDefaultOptionsProvider({ separatorKeyCodes: [ENTER] })],
    exports: [
        KbqTagList,
        KbqTag,
        KbqTagInput,
        KbqTagTrailingIcon,
        KbqTagAvatar,
        KbqTagRemove,
        ...COMPONENTS
    ]
})
export class KbqTagsModule {}
