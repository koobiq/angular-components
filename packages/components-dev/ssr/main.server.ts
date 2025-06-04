import { bootstrapApplication } from '@angular/platform-browser';
import { DevApp } from '../breadcrumbs/module';
import { devConfig } from './app.config.server';

const devBootstrap = () => bootstrapApplication(DevApp, devConfig);

export default devBootstrap;
