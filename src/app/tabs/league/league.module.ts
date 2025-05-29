import { NgModule } from '@angular/core';
import { LeaguePage } from './league.page';

import { LeaguePageRoutingModule } from './league-routing.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    LeaguePageRoutingModule,
    SharedModule,
  ],
  declarations: [LeaguePage]
})
export class LeaguePageModule {}
