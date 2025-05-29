import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeagueDetailPage } from './league-detail.page';

const routes: Routes = [
  {
    path: '',
    component: LeagueDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeagueDetailPageRoutingModule {}
