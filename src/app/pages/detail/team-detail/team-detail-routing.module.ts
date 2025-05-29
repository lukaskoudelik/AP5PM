import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeamDetailPage } from './team-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TeamDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeamDetailPageRoutingModule {}
