// Only the state enum is public: `KbqSidepanelContainerComponent.animationState` and `setAnimationState()`
// are typed with it and are not `@docs-private`. `kbqSidepanelAnimations` and `kbqSidepanelTransformAnimation`
// are the container's own animation wiring and have no reason to be public.
export { KbqSidepanelAnimationState } from './sidepanel-animations';
export * from './sidepanel-config';
export * from './sidepanel-container.component';
export * from './sidepanel-directives';
export * from './sidepanel-ref';
export * from './sidepanel.module';
export * from './sidepanel.service';
