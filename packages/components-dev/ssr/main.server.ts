import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import config from './config.server';
import { DevApp } from './module';

export default (context: BootstrapContext) => bootstrapApplication(DevApp, config, context);
