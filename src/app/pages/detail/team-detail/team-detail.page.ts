import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TabsService } from 'src/app/services/domain/tabs.service';
import { TeamService } from 'src/app/services/domain/team.service';
import { FavouritesService } from 'src/app/services/domain/favourites.service';
import { NavigationService } from 'src/app/services/domain/navigation.service';
import { LeagueService } from 'src/app/services/domain/league.service';
import { GameService } from 'src/app/services/domain/game.service';
import { TableService } from 'src/app/services/domain/table.service';
import { PlayerService } from 'src/app/services/domain/player.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.page.html',
  styleUrls: ['./team-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, SharedModule],
})
export class TeamDetailPage implements OnInit {
  activeTab: 'team' = 'team';
  team: any;
  league: any;
  selectedSegment: string = 'results';
  gamesPlayed: any[] = [];
  gamesToPlay: any[] = [];
  opponent: any;
  favoriteTeams: any[] = [];
  leagueTable: any[] = [];
  players: any[] = [];

  isLoadingGames: boolean = true;
  isLoadingTable: boolean = true;
  isLoadingPlayers: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private tabsService: TabsService,
    private teamService: TeamService,
    private favouritesService: FavouritesService,
    private navigationService: NavigationService,
    private leagueService: LeagueService,
    private gameService: GameService,
    private tableService: TableService,
    private playerService: PlayerService
  ) { }

  async ngOnInit() {
    this.isLoadingTable = true;
    this.isLoadingGames = true;
    this.isLoadingPlayers = true;
    this.tabsService.setActiveTab(this.activeTab);
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      const data = await this.teamService.getTeam(id);
      if (!data) return;

      this.team = data;

      if (this.team.league_id) {
        try {
          this.league = await this.leagueService.loadLeagueForTeam(this.team.league_id);
          this.leagueTable = await this.tableService.loadLeagueTable(this.team.league_id);
        } catch (error) {
          console.error('Chyba při načítání ligy nebo tabulky:', error);
        } finally {
          this.isLoadingTable = false;
        }
      }

      try {
        [this.gamesPlayed, this.gamesToPlay] = await this.gameService.loadGamesWithTeams('team', this.team.id);
      } catch (error) {
        console.error('Chyba při načítání zápasů:', error);
      } finally {
        this.isLoadingGames = false;
      }

      try {
        this.players = await this.playerService.getPlayersWithPhotos(this.team.id);
      } catch (error) {
        console.error('Chyba při načítání hráčů:', error);
      } finally {
        this.isLoadingPlayers = false;
      }

      this.isItemFavorite('team', this.team.id);

    } catch (error) {
      console.error('Chyba při načítání dat týmu:', error);
      this.isLoadingTable = false;
      this.isLoadingGames = false;
      this.isLoadingPlayers = false;
    }

  }

  toggleFavoriteItem(item: any, type: 'league' | 'team' | 'player') {
    this.favouritesService.toggleFavorite(item, type);
  }

  isItemFavorite(type: 'league' | 'team' | 'player', id: string): boolean {
    return this.favouritesService.isFavoriteItem(type, id);
  }

  onItemClick(event: Event, item: any, type: 'league' | 'team' | 'player') {
    this.navigationService.goToItem(event, item, type);
  }

}
