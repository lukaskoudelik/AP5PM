import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TabsService } from 'src/app/services/domain/tabs.service';
import { FavouritesService } from 'src/app/services/domain/favourites.service';
import { LeagueService } from 'src/app/services/domain/league.service';
import { GameService } from 'src/app/services/domain/game.service';
import { TableService } from 'src/app/services/domain/table.service';
import { OrganizationService } from 'src/app/services/domain/organization.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-league-detail',
  templateUrl: './league-detail.page.html',
  styleUrls: ['./league-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, SharedModule],
})

export class LeagueDetailPage implements OnInit {
  activeTab: 'league' = 'league';

  league: any;
  selectedSegment: string = 'results';
  playedGames: any[] = [];
  gamesToPlay: any[] = [];
  favoriteLeagues: any[] = [];
  leagueTable: any[] = [];
  isLoadingGames: boolean = true;
  isLoadingTable: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private tabsService: TabsService,
    private favouritesService: FavouritesService,
    private leagueService: LeagueService,
    private gameService: GameService,
    private tableService: TableService,
    private organizationService: OrganizationService
  ) { }


  async ngOnInit() {
    this.isLoadingGames = true;
    this.isLoadingTable = true;

    this.tabsService.setActiveTab(this.activeTab);

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      const data = await this.leagueService.getLeague(id);
      if (!data) return;

      this.league = data;

      try {
        this.league.organization = await this.organizationService.loadOrganizationForLeague(this.league.organization_id);
      } catch (error) {
        console.error('Chyba při načítání organizace:', error);
      }

      try {
        [this.playedGames, this.gamesToPlay] = await this.gameService.loadGamesWithTeams('league', this.league.id);
      } catch (error) {
        console.error('Chyba při načítání zápasů:', error);
      } finally {
        this.isLoadingGames = false;
      }

      try {
        this.leagueTable = await this.tableService.loadLeagueTable(this.league.id);
      } catch (error) {
        console.error('Chyba při načítání tabulky:', error);
      } finally {
        this.isLoadingTable = false;
      }

      this.isItemFavorite('league', this.league.id);

    } catch (error) {
      console.error('Chyba při načítání dat ligy:', error);
      this.isLoadingGames = false;
      this.isLoadingTable = false;
    }
  }

  async toggleFavoriteItem(item: any, type: 'league' | 'team' | 'player') {
    this.favouritesService.toggleFavorite(item, type);
  }

  ionViewWillEnter() {
    this.tabsService.setActiveTab(this.activeTab);
  }

  isItemFavorite(type: 'league' | 'team' | 'player', id: string): boolean {
    return this.favouritesService.isFavoriteItem(type, id);
  }

}
