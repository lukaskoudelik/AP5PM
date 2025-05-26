import { NgModule } from '@angular/core';
import { PlayerPage } from './player.page';

import { PlayerPageRoutingModule } from './player-routing.module';
import { SharedModule } from '../shared/shared.module'; 


@NgModule({
  imports: [
    PlayerPageRoutingModule,
    SharedModule,
  ],
  declarations: [PlayerPage]
})
export class PlayerPageModule {}
