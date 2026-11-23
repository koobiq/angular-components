import { InjectionToken } from '@angular/core';
import type { KbqFormField } from './form-field';

/**
 * Injection token used to access the owning `KbqFormField`. Declared apart from the form field, so that the controls
 * it queries for inject it without importing the form field back.
 *
 * @docs-private
 */
export const KBQ_FORM_FIELD = new InjectionToken<KbqFormField>('KbqFormField');
