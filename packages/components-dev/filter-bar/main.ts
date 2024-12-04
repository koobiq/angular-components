import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { DemoModule } from './module';

platformBrowserDynamic()
    .bootstrapModule(DemoModule)
    .catch((error) => console.error(error));
