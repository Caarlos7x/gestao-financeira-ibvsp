import { ROUTES } from '@/constants/routes';
import { matchPath } from 'react-router-dom';

/** Indica se o caminho atual corresponde a alguma rota declarada (exceto login). */
export function matchesProtectedAppRoute(pathname: string): boolean {
  return Object.values(ROUTES).some((routePath) =>
    matchPath(
      { path: routePath, end: routePath === ROUTES.root },
      pathname
    )
  );
}
