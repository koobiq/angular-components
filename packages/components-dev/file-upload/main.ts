import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { FileUploadDev } from './module';

bootstrapApplication(FileUploadDev, {
    providers: [
        provideAnimations()
    ]
}).catch((error) => console.error(error));
