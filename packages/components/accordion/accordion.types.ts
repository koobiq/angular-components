import { InjectionToken } from '@angular/core';
import type { KbqAccordion } from './accordion';
import type { KbqAccordionItem } from './accordion-item';

/**
 * Keeps the concrete type exposed by the public `KbqAccordionItem.accordion` field.
 *
 * @internal
 */
export const KBQ_ACCORDION = new InjectionToken<KbqAccordion>('KbqAccordion');

/**
 * Keeps the concrete type exposed to subclasses through the header, trigger and content directives' protected
 * `item` fields.
 *
 * @internal
 */
export const KBQ_ACCORDION_ITEM = new InjectionToken<KbqAccordionItem>('KbqAccordionItem');
