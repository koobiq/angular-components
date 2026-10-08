import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CheckApp } from '../../../shared/app';
import { config } from './config';

bootstrapApplication(CheckApp, { providers: [...config.providers, provideBrowserGlobalErrorListeners()] }).catch(
    (error) => console.error(error)
);
