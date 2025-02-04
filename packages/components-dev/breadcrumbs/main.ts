import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Routes } from '@angular/router';
import { AboutComponent, BreadcrumbsDev, ProductComponent, ProductDetailsComponent } from './module';

const routes: Routes = [
    {
        path: '',
        data: { breadcrumb: 'Home' },
        children: [
            {
                path: 'products',
                data: { breadcrumb: 'Products' },
                component: ProductComponent,
                children: [
                    {
                        path: ':id',
                        data: { breadcrumb: 'Product Details' },
                        component: ProductDetailsComponent
                    }
                ]
            },
            {
                path: 'about',
                data: { breadcrumb: 'About' },
                component: AboutComponent
            }
        ]
    }
];

bootstrapApplication(BreadcrumbsDev, {
    providers: [
        provideAnimations(),
        provideRouter(routes)]
}).catch((error) => console.error(error));
