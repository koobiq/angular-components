## Server-side rendering (SSR) setup for local development

This guide explains how to enable SSR for your component development.

### Set up server config

Update `main.server.ts` with specific component development app:

```typescript
// ...other imports
import { DevApp } from '../<component>/module';
// ...other code
```

Replace `<component>` with the actual component name (e.g., `button`, `modal`, etc.).

---

### Client Hydration with live server

Update `main.ts` with specific component development app:

```typescript
// ...other imports
import { DevApp } from '../<component>/module';
// ...other code
```

Replace `<component>` with the actual component name (e.g., `button`, `modal`, etc.).

---

### How to run SSR locally

Build and run the server using the following commands:

```bash
yarn run dev:ssr-start
```

or for live server with client hydration

```bash
yarn run dev:ssr
```
