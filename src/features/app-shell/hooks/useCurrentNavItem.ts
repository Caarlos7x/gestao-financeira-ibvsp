import { PRIMARY_NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { matchPath, useLocation } from 'react-router-dom';

export function useCurrentNavItem() {
  const { pathname } = useLocation();

  return PRIMARY_NAV_ITEMS.find((item) =>
    matchPath({ path: item.to, end: item.to === ROUTES.root }, pathname)
  );
}
