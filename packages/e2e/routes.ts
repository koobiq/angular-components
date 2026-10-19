import { reflectComponentType } from '@angular/core';
import { Routes } from '@angular/router';
import * as scenarios from './scenarios';

// Keyed by export name: the production configuration minifies the bundle and mangles class names, so
// the route path has to come from the namespace key rather than from `component.name`. Lint requires the
// `E2e` prefix of every exported class, so an export without it is a helper that is not a scenario, and
// neither is an `E2e` class that is not a component.
export const e2eRoutes: Routes = Object.entries(scenarios)
    .filter(([name, component]) => name.startsWith('E2e') && reflectComponentType(component))
    .map(([path, component]) => ({ path, component }));
