import { EnvironmentProviders, Provider } from '@angular/core';

/** The change detection setup a consumer application runs Koobiq in, named after its Angular project. */
export interface CheckConfig {
    name: 'zoneless' | 'zone' | 'zone-animations';
    /** What the application bootstraps with, and what the suites give TestBed. */
    providers: (Provider | EnvironmentProviders)[];
}
