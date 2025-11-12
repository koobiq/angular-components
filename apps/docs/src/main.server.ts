import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { DocsAppComponent } from './app/app.component';
import { docsConfig } from './app/app.config.server';

const docsBootstrap = (context: BootstrapContext) => bootstrapApplication(DocsAppComponent, docsConfig, context);

export default docsBootstrap;
