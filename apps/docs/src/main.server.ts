import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { DocsAppComponent } from './app/app.component';
import { config } from './config.server';

// eslint-disable-next-line @typescript-eslint/naming-convention
const bootstrap = (context: BootstrapContext) => bootstrapApplication(DocsAppComponent, config, context);

export default bootstrap;
