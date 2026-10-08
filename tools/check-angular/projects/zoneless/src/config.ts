import { provideZonelessChangeDetection } from '@angular/core';
import { CheckConfig } from '../../../shared/config';

export const config: CheckConfig = {
    name: 'zoneless',
    providers: [provideZonelessChangeDetection()]
};
