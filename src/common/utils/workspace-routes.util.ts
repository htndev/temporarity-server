import { Placeholder } from '../types/workspace-route.type';
import { URLLayer } from './../entities/url-layer.entity';

export const getSuitableRoute = (routeA: URLLayer | undefined, routeB: URLLayer | undefined, original: URLLayer) => {
  if (routeA === undefined) {
    return routeB;
  } else if (routeB === undefined) {
    return routeA;
  }

  if (routeA.value === original.value && routeB.value !== original.value) {
    return routeA;
  } else if (routeB.value === original.value && routeA.value !== original.value) {
    return routeB;
  } else if (routeA.value > routeB.value) {
    return routeA;
  } else if (routeA.value < routeB.value) {
    return routeB;
  } else if (routeB.value === routeA?.value && routeB.value === original.value) {
    for (let i = 0; i < routeB.schema.length; i++) {
      const schemaPart = original?.schema[i];
      const routeAPart = routeA?.schema[i];
      const routeBPart = routeB?.schema[i];

      const type = schemaPart.type;

      if ([Placeholder.DoubleWildcard, Placeholder.Wildcard, Placeholder.Param].includes(type)) {
        if (schemaPart.type === routeBPart.type && schemaPart.type === routeAPart.type) {
          continue;
        } else if (schemaPart.type === routeBPart.type) {
          return routeB;
        } else if (schemaPart.type === routeAPart.type) {
          return routeA;
        }
      } else {
        if (schemaPart.part === routeBPart.part && schemaPart.part === routeAPart.part) {
          continue;
        } else if (schemaPart.part === routeBPart.part) {
          return routeB;
        } else if (schemaPart.part === routeAPart.part) {
          return routeA;
        }
      }
    }

    return routeB;
  }
};

export const buildRoutePath = (path: string): string => path.replace(/\/$/, '').replace(/^\//, '');

export const buildRoutePattern = (route: string): RegExp =>
  new RegExp(
    `^${route
      .replace(/\*{2}/g, '.*')
      .replace(/:[^/]+/g, '[^/]+')
      .replace(/[^/.]\*{1}/g, '[^/]+')}`
  );
