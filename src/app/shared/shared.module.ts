import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedContentComponent } from '../components/shared-content/shared-content.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LeagueNavigatorComponent } from '../components/league-navigator/league-navigator.component';
import { PlayerNavigatorComponent } from '../components/player-navigator/player-navigator.component';
import { TeamNavigatorComponent } from '../components/team-navigator/team-navigator.component';


@NgModule({
  declarations: [SharedContentComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    LeagueNavigatorComponent,
    PlayerNavigatorComponent,
    TeamNavigatorComponent
  ],
  exports: [SharedContentComponent]
})
export class SharedModule { }
