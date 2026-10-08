import { provideZoneChangeDetection } from '@angular/core';
import { CheckConfig } from '../../../shared/config';

export const config: CheckConfig = {
    name: 'zone',
    providers: [provideZoneChangeDetection()]
};
