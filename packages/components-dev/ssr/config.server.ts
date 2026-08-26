import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import config from './config';
import { devTimezoneServerProvider } from './timezone';

export default mergeApplicationConfig(config, {
    providers: [
        provideServerRendering(),
        devTimezoneServerProvider()
    ]
});
