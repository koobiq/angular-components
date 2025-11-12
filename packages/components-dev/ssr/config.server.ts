import { mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import config from './config';

export default mergeApplicationConfig(config, {
    providers: [
        provideServerRendering()
    ]
});
