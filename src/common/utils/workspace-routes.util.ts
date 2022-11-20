export const buildRoutePath = (path: string): string => path.replace(/\/$/, '').replace(/^\//, '');

export const buildRoutePattern = (route: string): RegExp =>
  new RegExp(`^${route.replace(/:[^/]+/g, '[^/]+').replace(/\*{1}/g, '[^/]+')}`);
