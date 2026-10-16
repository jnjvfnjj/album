/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { DashboardView } from './views/DashboardView';
import { AlbumDetailView } from './views/AlbumDetailView';
import { AlbumShareView } from './views/AlbumShareView';
import { GuestUploadView } from './views/GuestUploadView';
import { PublicGalleryView } from './views/PublicGalleryView';
import { SettingsView } from './views/SettingsView';
import { AuthView } from './views/AuthView';
import { LandingView } from './views/LandingView';

function AppRoutes() {
  const { match } = useRouter();

  switch (match.route) {
    case '/':
    case '/dashboard':
    case '/albums/new':
      return <DashboardView />;
    case '/albums/:id/share':
      return <AlbumShareView id={match.params.id} />;
    case '/albums/:id':
      return <AlbumDetailView id={match.params.id} />;
    case '/upload/:token':
      return <GuestUploadView token={match.params.token} />;
    case '/gallery/:token':
      return <PublicGalleryView token={match.params.token} />;
    case '/settings':
      return <SettingsView />;
    case '/auth':
      return <AuthView />;
    default:
      return <DashboardView />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}
