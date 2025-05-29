import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedContentComponent } from './components/shared-content/shared-content.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeagueNavigatorComponent } from './components/navigators/league-navigator/league-navigator.component';
import { PlayerNavigatorComponent } from './components/navigators/player-navigator/player-navigator.component';
import { TeamNavigatorComponent } from './components/navigators/team-navigator/team-navigator.component';
import { GameListComponent } from './components/game-list/game-list.component';
import { LeagueTableComponent } from './components/league-table/league-table.component';


@NgModule({
  declarations: [
    SharedContentComponent,
    GameListComponent,
    LeagueTableComponent,
    LeagueNavigatorComponent,
    PlayerNavigatorComponent,
    TeamNavigatorComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
  ],
  exports: [SharedContentComponent, GameListComponent, LeagueTableComponent]
})
export class SharedModule { }
