import { NgModule } from '@angular/core';
import { PlayerPage } from './player.page';

import { PlayerPageRoutingModule } from './player-routing.module';
import { SharedModule } from '../shared/shared.module'; 
import { LeagueNavigatorComponent } from '../components/league-navigator/league-navigator.component';


@NgModule({
  imports: [
    PlayerPageRoutingModule,
    SharedModule,
    LeagueNavigatorComponent
  ],
  declarations: [PlayerPage]
})
export class PlayerPageModule {}
