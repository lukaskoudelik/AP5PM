import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'search',
    loadComponent: () => import('./search/search.page').then(m => m.SearchPage),
  },
  {
    path: 'team/:id',
    loadComponent: () => import('./detail/team/team.page').then( m => m.TeamPage)
  },
  {
    path: 'league/:id',
    loadComponent: () => import('./detail/league/league.page').then( m => m.LeaguePage)
  },
  {
    path: 'player/:id',
    loadComponent: () => import('./detail/player/player.page').then( m => m.PlayerPage)
  },
  
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
