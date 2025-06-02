import { bootstrapApplication } from '@angular/platform-browser';
import { devConfig } from './app.config.server';
import { DevApp } from './module';

const devBootstrap = () => bootstrapApplication(DevApp, devConfig);

export default devBootstrap;
