import { ErrorHandler, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import config from './config';
import { devTimezoneServerProvider } from './timezone';

/**
 * Rethrows errors caught during server rendering so that prerender failures produce a non-zero build exit code.
 * Angular's default ErrorHandler only logs these errors, which can otherwise emit incomplete HTML as successful.
 */
class SsrErrorHandler implements ErrorHandler {
    handleError(error: unknown): never {
        // Preserve default logging behavior, but fail the build.
        // eslint-disable-next-line no-console
        console.error(error);

        throw error instanceof Error ? error : new Error(String(error));
    }
}

export default mergeApplicationConfig(config, {
    providers: [
        provideServerRendering(),
        devTimezoneServerProvider(),
        { provide: ErrorHandler, useClass: SsrErrorHandler }
    ]
});
