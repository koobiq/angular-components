import { InjectionToken } from '@angular/core';
import type { KbqAccordion } from './accordion';
import type { KbqAccordionItem } from './accordion-item';

/**
 * Provided by `KbqAccordion`, so that its items and triggers inject it without importing the accordion back.
 *
 * @internal
 */
export const KBQ_ACCORDION = new InjectionToken<KbqAccordion>('KbqAccordion');

/**
 * Provided by `KbqAccordionItem`, so that its trigger and content inject it without importing the item back.
 *
 * @internal
 */
export const KBQ_ACCORDION_ITEM = new InjectionToken<KbqAccordionItem>('KbqAccordionItem');
