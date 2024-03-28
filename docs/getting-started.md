### Getting started

### Step 1: Install

#### NPM
```bash
npm install --save @angular/cdk @koobiq/components @koobiq/cdk @koobiq/icons @koobiq/angular-luxon-adapter @mosaic-design/date-adapter @mosaic-design/date-formatter @mosaic-design/tokens-builder @koobiq/design-tokens luxon @messageformat/core
```

#### Yarn
```bash
yarn add @angular/cdk @koobiq/components @koobiq/cdk @koobiq/icons @koobiq/angular-luxon-adapter @mosaic-design/date-adapter @mosaic-design/date-formatter @mosaic-design/tokens-builder @koobiq/design-tokens luxon @messageformat/core
```

### Step 2: Animations

#### NPM
```bash
npm install --save @angular/animations
```

#### Yarn
```bash
yarn add @angular/animations
```

```ts
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  ...
  imports: [ BrowserAnimationsModule ],
  ...
})
export class AppModule { }
```

### Step 3: Import the component modules

You can create a separate NgModule that imports all the components that you will use in your application.
You can then include this module wherever you'd like to use the components.

```ts
import { KbqButtonModule, KbqCheckboxModule } from '@koobiq/components';

@NgModule({
    imports: [ KbqButtonModule, KbqCheckboxModule ],
    exports: [ KbqButtonModule, KbqCheckboxModule ]
})
export class CoreCustomModule { }
```

### Step 4: Include a theme

Including a theme is **required** to apply all of the core and theme styles to your application.

```scss
@use '@koobiq/components/prebuilt-themes/default-theme.css';
```

You should include mosaic-icons in order to use icons classes

```scss
@use '@koobiq/icons/dist/styles/mc-icons.css';
```
