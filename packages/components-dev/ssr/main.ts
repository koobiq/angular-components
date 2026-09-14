import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import config from './config';
import { DevApp } from './module';

bootstrapApplication(DevApp, { ...config, providers: [provideZoneChangeDetection(), ...config.providers] }).catch(
    (err) => console.error(err)
);
