import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NavigationService } from 'src/app/services/domain/navigation.service';
import { GameService } from 'src/app/services/domain/game.service';
import { TableService } from 'src/app/services/domain/table.service';
import { PlayerService } from 'src/app/services/domain/player.service';
import { GameLineUps } from 'src/app/shared/interfaces/game-lineups.interface';
import { GameEvents } from 'src/app/shared/interfaces/game-events.interface';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})

export class GameDetailPage implements OnInit {
 game: any;
  isLoading: boolean = true;
  isLoadingEvents: boolean = true;
  isLoadingSquadlist: boolean = true;
  isLoadingTable: boolean = true;
  selectedSegment: string = 'events';

  leagueTable: any[] = [];
  gameLineUps: GameLineUps = {
    homeStarters: [],
    homeBench: [],
    awayStarters: [],
    awayBench: [],
    starters: 0,
    benchers: 0,
    startersIndexes: [],
    benchersIndexes: [],
    positionCounts: {
      goalkeeper: 0,
      defender: 0,
      midfielder: 0,
      attacker: 0,
      other: 0
    }
  }

  gameEvents: GameEvents = {
    homeGoals: [],
    awayGoals: [],
    homeYellowCards: [],
    awayYellowCards: [],
    homeSecondYellowCards: [],
    awaySecondYellowCards: [],
    homeRedCards: [],
    awayRedCards: [],
    allGoals: [],
    allYellowCards: [],
    allSecondYellowCards: [],
    allRedCards: [],
    allEvents: [],
    firstHalfEvents: [],
    secondHalfEvents: []
  };

  constructor(
    private route: ActivatedRoute,
    private navigationService: NavigationService,
    private gameService: GameService,
    private tableService: TableService,
    private playerService: PlayerService
  ) { }

  async ngOnInit() {
    this.isLoading = true;
    this.isLoadingEvents = true;
    this.isLoadingTable = true;
    this.isLoadingSquadlist = true;

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      const gameData = await this.gameService.getGame(id);
      if (!gameData) return;

      try {
        this.game = await this.gameService.loadGameDetails(id);
      } catch (error) {
        console.error('Chyba při načítání detailu zápasu:', error);
      } finally {
        this.isLoading = false;
      }

      try {
        this.gameEvents = await this.gameService.loadGoalsAndCards(id);
      } catch (error) {
        console.error('Chyba při načítání událostí zápasu:', error);
      } finally {
        this.isLoadingEvents = false;
      }

      try {
        this.gameLineUps = await this.playerService.loadLineups(id);
      } catch (error) {
        console.error('Chyba při načítání sestav:', error);
      } finally {
        this.isLoadingSquadlist = false;
      }

      try {
        this.leagueTable = await this.tableService.loadLeagueTable(this.game.league_id);
      } catch (error) {
        console.error('Chyba při načítání tabulky:', error);
      } finally {
        this.isLoadingTable = false;
      }

    } catch (error) {
      console.error('Chyba při načítání zápasu:', error);
      this.isLoading = false;
      this.isLoadingEvents = false;
      this.isLoadingSquadlist = false;
      this.isLoadingTable = false;
    }
  }

  onItemClick(event: Event, item: any, type: 'league' | 'team' | 'player') {
    this.navigationService.goToItem(event, item, type);
  }

  getPositionShort(pos: string): string {
    return pos === 'goalkeeper' ? 'B' :
      pos === 'defender' ? 'O' :
        pos === 'midfielder' ? 'Z' :
          pos === 'attacker' ? 'Ú' : 'N';
  }

  getIconNameByPosition(position: string | null): string {
    switch (position) {
      case 'goalkeeper':
        return 'hand-right';
      case 'defender':
        return 'shirt';
      case 'midfielder':
        return 'shirt';
      case 'attacker':
        return 'shirt';
      default:
        return 'help-circle-outline';
    }
  }
}
