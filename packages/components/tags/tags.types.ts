import { InjectionToken } from '@angular/core';
import type { KbqTagList } from './tag-list.component';

type TagListHost = Pick<
    KbqTagList,
    | 'disabled'
    | 'draggable'
    | 'editable'
    | 'removable'
    | 'selectable'
    | 'selected'
    | 'handleSelectionInteraction'
    | 'removeSelected'
>;

/**
 * Provided by `KbqTagList`, so that its tags inject it without importing the list back.
 *
 * @internal
 */
export const KBQ_TAG_LIST = new InjectionToken<TagListHost>('KbqTagList');
