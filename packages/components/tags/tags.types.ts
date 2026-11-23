import { InjectionToken } from '@angular/core';
import type { KbqTagList } from './tag-list.component';

/**
 * Provided by `KbqTagList`, so that its tags inject it without importing the list back.
 *
 * @internal
 */
export const KBQ_TAG_LIST = new InjectionToken<KbqTagList>('KbqTagList');
