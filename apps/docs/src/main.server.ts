import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { DocsAppComponent } from './app/app.component';
import config from './config.server';

export default (context: BootstrapContext) => bootstrapApplication(DocsAppComponent, config, context);
