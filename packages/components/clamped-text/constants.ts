import { InjectionToken } from '@angular/core';
import { KbqClampedTextConfig } from './types';

export const kbqClampedTextDefaultMaxRows = 5;

export const KBQ_CLAMPED_TEXT_CONFIGURATION = new InjectionToken<KbqClampedTextConfig>('KbqClampedTextConfig');
