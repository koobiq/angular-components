import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { DevAboutPage, DevApp, DevProductDetailsPage, DevProductsPage } from './module';

export const devRoutes: Routes = [
    {
        path: '',
        data: { breadcrumb: 'Home' },
        children: [
            {
                path: 'products',
                data: { breadcrumb: 'Products' },
                component: DevProductsPage,
                children: [
                    {
                        path: ':id',
                        data: { breadcrumb: 'Product Details' },
                        component: DevProductDetailsPage
                    }
                ]
            },
            {
                path: 'about',
                data: { breadcrumb: 'About' },
                component: DevAboutPage
            }
        ]
    }
];

export const devAppConfig: ApplicationConfig = {
    providers: [
        provideRouter(devRoutes)
    ]
};

bootstrapApplication(DevApp, {
    ...devAppConfig,
    providers: [provideZonelessChangeDetection(), ...devAppConfig.providers]
}).catch((error) => console.error(error));
