import { PlatformModule } from '@angular/cdk/platform';
import { NgModule } from '@angular/core';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KBQ_TAGS_DEFAULT_OPTIONS, KbqTagsDefaultOptions } from './tag-default-options';
import { KbqTagInput } from './tag-input';
import { KbqTagList } from './tag-list.component';
import {
    KbqTag,
    KbqTagAvatar,
    KbqTagEditInput,
    KbqTagEditSubmit,
    KbqTagRemove,
    KbqTagTrailingIcon
} from './tag.component';

const COMPONENTS = [
    KbqTagEditSubmit,
    KbqTagEditInput
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
    providers: [
        {
            provide: KBQ_TAGS_DEFAULT_OPTIONS,
            useValue: { separatorKeyCodes: [ENTER] } as KbqTagsDefaultOptions
        }
    ],
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
