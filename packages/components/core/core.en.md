The `core` module is a foundational part of the **Koobiq** design system.  
It provides essential utilities, services, and components used across other modules in the system.

## Pinning a theme by name

Besides following the OS color scheme via `mode`, `KbqThemeService` lets you pin one theme out of the registered `themes()` by name — no light/dark polarity involved, the pin simply overrides `mode` resolution until cleared. Useful for a "select exact theme" picker, as opposed to a light/dark/auto switch.

<!-- example(theme-static-selection) -->
