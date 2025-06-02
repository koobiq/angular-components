## Server-side rendering (SSR) setup for local development

This guide explains how to enable SSR for your component development.

### Step 1: update `angular.json`

Modify `angular.json` with specific component configuration:

```json5
{
    // ...other config
    architect: {
        build: {
            // ...other build options
            options: {
                // ...other options
                server: 'packages/components-dev/<component>/main.server.ts',
                prerender: true,
                ssr: {
                    entry: 'packages/components-dev/<component>/server.ts'
                }
            }
        }
    }
}
```

Replace `<component>` with the actual component name (e.g., `button`, `modal`, etc.).

---

### Step 2: create SSR entry files

Inside your component’s development folder (`packages/components-dev/<component>/`), add the following files:

- `main.server.ts`
- `server.ts`
- `app.config.server.ts`

These files handle bootstrapping, rendering logic, and server configuration.

---

### How to run SSR locally

Build and run the server using the following commands:

```bash
ng build dev-<component-name>
node dist/components-dev/<component-name>/server/server.mjs
```
