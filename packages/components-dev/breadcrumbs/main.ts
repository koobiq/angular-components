import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { DevAboutPage, DevApp, DevProductDetailsPage, DevProductsPage } from './module';

const routes: Routes = [
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

bootstrapApplication(DevApp, {
    providers: [
        provideAnimations(),
        provideRouter(routes)]
}).catch((error) => console.error(error));
