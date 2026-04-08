### Dynamic configuration update

<!-- example(sidepanel-with-dynamic-config-update) -->

### Custom injector

The `injector` option in `KbqSidepanelConfig` allows passing a custom `Injector` as the parent for the sidepanel content's dependency injection hierarchy. This is useful when you need to provide injection tokens that are not available in the global injector — for example, tokens from a specific component, route, or lazily loaded module.

<!-- example(sidepanel-with-custom-injector) -->
