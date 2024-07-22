import { PlatformModule } from '@angular/cdk/platform';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ENTER } from '@koobiq/cdk/keycodes';
import { KBQ_TAGS_DEFAULT_OPTIONS, KbqTagsDefaultOptions } from './tag-default-options';
import { KbqTagInput } from './tag-input';
import { KbqTagList } from './tag-list.component';
import { KbqTag, KbqTagAvatar, KbqTagRemove, KbqTagTrailingIcon } from './tag.component';

@NgModule({
    imports: [CommonModule, PlatformModule],
    exports: [
        KbqTagList,
        KbqTag,
        KbqTagInput,
        KbqTagTrailingIcon,
        KbqTagAvatar,
        KbqTagRemove
    ],
    declarations: [
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
            // tslint:disable-next-line: no-object-literal-type-assertion
            useValue: { separatorKeyCodes: [ENTER] } as KbqTagsDefaultOptions
        }
    ]
})
export class KbqTagsModule {}
