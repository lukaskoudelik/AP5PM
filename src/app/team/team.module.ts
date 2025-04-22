import { NgModule } from '@angular/core';
import { TeamPage } from './team.page';

import { TeamPageRoutingModule } from './team-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    TeamPageRoutingModule,
    SharedModule
  ],
  declarations: [TeamPage]
})
export class TeamPageModule {}
