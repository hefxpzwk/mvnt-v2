export const defaultPage = 'Home';

export const sideNavItems = [
  { id: 'Home', label: '홈', icon: 'House' },
  { id: 'Projects', label: '프로젝트', icon: 'FolderKanban' },
  { id: 'Search', label: '검색', icon: 'Search' },
  { id: 'Explore', label: '탐색', icon: 'Compass' },
  { id: 'Dance', label: '댄스', icon: 'Footprints' }
];

export const legacyRouteAliases = {
  Generate: 'Home',
  Create: 'Home',
  Studio: 'Projects'
};

export const routeIds = [...sideNavItems.map((item) => item.id), 'Credits'];

export function normalizeRouteId(value) {
  const rawValue = typeof value === 'string' ? value.trim() : value;
  const aliasValue = legacyRouteAliases[rawValue] || rawValue;
  const canonicalValue = routeIds.find((routeId) => routeId.toLowerCase() === String(aliasValue).toLowerCase());
  return canonicalValue || defaultPage;
}

export function readPageFromLocation(location) {
  if (!location) return defaultPage;

  const path = location.pathname?.replace(/^\/+|\/+$/g, '') || '';
  if (path) {
    const pageFromPath = normalizeRouteId(path);
    if (pageFromPath !== defaultPage || path.toLowerCase() === defaultPage.toLowerCase()) return pageFromPath;
  }

  try {
    const hashValue = decodeURIComponent((location.hash || '').replace(/^#\/?/, ''));
    return normalizeRouteId(hashValue);
  } catch {
    return defaultPage;
  }
}

export function buildPageUrl(page) {
  const normalizedPage = normalizeRouteId(page);
  if (normalizedPage !== page) return null;
  return normalizedPage === 'Credits' ? '/credits' : `/#/${encodeURIComponent(normalizedPage)}`;
}
