import { provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CheckConfig } from '../../../shared/config';

export const config: CheckConfig = {
    name: 'zone-animations',
    providers: [provideZoneChangeDetection(), provideAnimations()]
};
