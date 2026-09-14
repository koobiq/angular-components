import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import config from './config.server';
import { DevApp } from './module';

export default (context: BootstrapContext) =>
    bootstrapApplication(
        DevApp,
        { ...config, providers: [provideZoneChangeDetection(), ...config.providers] },
        context
    );
