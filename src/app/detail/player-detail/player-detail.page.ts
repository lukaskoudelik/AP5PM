import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { TabsService } from 'src/app/services/domain/tabs.service';
import { TeamService } from 'src/app/services/domain/team.service';
import { FavouritesService } from 'src/app/services/domain/favourites.service';
import { NavigationService } from 'src/app/services/domain/navigation.service';
import { LeagueService } from 'src/app/services/domain/league.service';
import { GameService } from 'src/app/services/domain/game.service';
import { TableService } from 'src/app/services/domain/table.service';
import { PlayerService } from 'src/app/services/domain/player.service';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  styleUrls: ['./player-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class PlayerDetailPage implements OnInit {
  activeTab: 'player' = 'player';
  player: any;
  team: any;
  games: any[] = [];
  isLoadingGames: boolean = true;
  isLoadingInfo: boolean = true;
  favoritePlayers: any[] = [];
  selectedSegment: string = 'results';
  role: any;
  motherClub: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tabsService: TabsService,
    private teamService: TeamService,
    private favouritesService: FavouritesService,
    private navigationService: NavigationService,
    private gameService: GameService,
    private playerService: PlayerService
  ) { }

  async ngOnInit() {
    this.isLoadingGames = true;
    this.isLoadingInfo = true;

    this.tabsService.setActiveTab(this.activeTab);

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      const data = await this.playerService.getPlayer(id);
      if (!data) return;

      this.player = data;

      try {
        if (this.player.team_id) {
          this.team = await this.teamService.loadTeamForPlayer(this.player.team_id);
        }
      } catch (error) {
        console.error('Chyba při načítání týmu hráče:', error);
      }

      try {
        this.games = await this.gameService.loadPlayersGames(this.player.id);
      } catch (error) {
        console.error('Chyba při načítání zápasů hráče:', error);
      } finally {
        this.isLoadingGames = false;
      }

      try {
        this.motherClub = await this.teamService.getTeam(this.player.mother_club_id);
      } catch (error) {
        console.error('Chyba při načítání mateřského klubu:', error);
      } finally {
        this.isLoadingInfo = false;
      }

      this.isFavoriteItem('player', this.player.id);

    } catch (error) {
      console.error('Chyba při načítání dat hráče:', error);
      this.isLoadingGames = false;
      this.isLoadingInfo = false;
    }
  }

  navigateToTab(type: string) {
    this.router.navigate([`../tabs/${type}`]);
  }

  navigateToSearch() {
    this.router.navigate([`../search/`]);
  }

  toggleFavorite(item: any, type: 'league' | 'team' | 'player') {
    this.favouritesService.toggleFavorite(item, type);
  }

  isFavoriteItem(type: 'league' | 'team' | 'player', id: string): boolean {
    return this.favouritesService.isFavoriteItem(type, id);
  }

  onItemClick(event: Event, item: any, type: 'league' | 'team' | 'player') {
    this.navigationService.goToItem(event, item, type);
  }

  goToGameDetail(gameId: string) {
    this.navigationService.goToGameDetail(gameId);
  }

  getPlayerAge(birthDate: string): number {
    this.isLoadingInfo = true;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    this.isLoadingInfo = false;
    return age;
  }
}
