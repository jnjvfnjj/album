import React, { createContext, useContext, useEffect, useState } from 'react';

export type RoutePath =
  | '/'
  | '/dashboard'
  | '/albums/new'
  | '/albums/:id'
  | '/albums/:id/share'
  | '/upload/:token'
  | '/gallery/:token'
  | '/settings'
  | '/auth';

export interface RouteMatch {
  route: RoutePath;
  params: Record<string, string>;
  pathname: string;
}

interface RouterContextType {
  pathname: string;
  navigate: (to: string) => void;
  match: RouteMatch;
  back: () => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

function parseRoute(currentPath: string): RouteMatch {
  // Normalize path from pathname, hash or query
  let path = (currentPath || '/').split('?')[0] || '/';
  if (path.startsWith('#')) path = path.slice(1);
  if (!path.startsWith('/')) path = '/' + path;

  // Check query parameters for guest upload: ?upload=token or ?u=token (supporting both query & hash routing)
  if (typeof window !== 'undefined') {
    try {
      let search = window.location.search || '';
      if (!search && window.location.hash && window.location.hash.includes('?')) {
        search = window.location.hash.slice(window.location.hash.indexOf('?'));
      }
      const params = new URLSearchParams(search);
      const uploadToken = params.get('upload') || params.get('u') || params.get('token');
      if (uploadToken) {
        return { route: '/upload/:token', params: { token: uploadToken }, pathname: `/upload/${uploadToken}` };
      }
      const galleryToken = params.get('gallery') || params.get('g');
      if (galleryToken) {
        return { route: '/gallery/:token', params: { token: galleryToken }, pathname: `/gallery/${galleryToken}` };
      }
    } catch (e) {
      console.warn('Router parse query error', e);
    }
  }

  // 1. Dynamic route: /upload/:token
  const uploadMatch = path.match(/^\/upload\/([^/?#]+)\/?$/i);
  if (uploadMatch) {
    return { route: '/upload/:token', params: { token: uploadMatch[1] }, pathname: path };
  }

  // 2. Dynamic route: /gallery/:token
  const galleryMatch = path.match(/^\/gallery\/([^/?#]+)\/?$/i);
  if (galleryMatch) {
    return { route: '/gallery/:token', params: { token: galleryMatch[1] }, pathname: path };
  }

  // 3. Dynamic route: /albums/:id/share
  const shareMatch = path.match(/^\/albums\/([^/?#]+)\/share\/?$/i);
  if (shareMatch) {
    return { route: '/albums/:id/share', params: { id: shareMatch[1] }, pathname: path };
  }

  // 4. Dynamic route: /albums/:id
  const albumMatch = path.match(/^\/albums\/([^/?#]+)\/?$/i);
  if (albumMatch) {
    return { route: '/albums/:id', params: { id: albumMatch[1] }, pathname: path };
  }

  // 5. Static routes
  if (path === '/dashboard') return { route: '/dashboard', params: {}, pathname: path };
  if (path === '/albums/new') return { route: '/albums/new', params: {}, pathname: path };
  if (path === '/settings') return { route: '/settings', params: {}, pathname: path };
  if (path === '/auth') return { route: '/auth', params: {}, pathname: path };

  // Default fallback to dashboard
  return { route: '/dashboard', params: {}, pathname: path };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && hash.startsWith('/')) return hash;
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && hash.startsWith('/')) {
        setPathname(hash);
      } else {
        setPathname(window.location.pathname || '/');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (to: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', to);
      setPathname(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const back = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const match = parseRoute(pathname);

  return (
    <RouterContext.Provider value={{ pathname, navigate, match, back }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
