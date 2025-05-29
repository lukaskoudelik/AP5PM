import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlayerDetailPage } from './player-detail.page';

const routes: Routes = [
  {
    path: '',
    component: PlayerDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlayerDetailPageRoutingModule {}
