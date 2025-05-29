import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'search',
    loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage),
  },
  {
    path: 'team/:id',
    loadComponent: () => import('./pages/detail/team-detail/team-detail.page').then( m => m.TeamDetailPage)
  },
  {
    path: 'league/:id',
    loadComponent: () => import('./pages/detail/league-detail/league-detail.page').then( m => m.LeagueDetailPage)
  },
  {
    path: 'player/:id',
    loadComponent: () => import('./pages/detail/player-detail/player-detail.page').then( m => m.PlayerDetailPage)
  },
  {
    path: 'game/:id',
    loadComponent: () => import('./pages/detail/game-detail/game-detail.page').then( m => m.GameDetailPage)
  },
  
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
