import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { Subject, from } from 'rxjs';
import { Router } from '@angular/router';
import { AppService } from '../services/app.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';


@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class SearchPage implements OnInit, OnDestroy {

  searchQuery: string = '';
  filter: 'all' | 'team' | 'player' | 'league' = 'all';
  isInfiniteScrollVisible = true;
  newItemsCount = 0;
  isLoading = false;

  filteredResults: {
  all: any[];
  team: any[];
  player: any[];
  league: any[];
  } = { all: [], team: [], player: [], league: [] };

  loadingMore: {
  all: boolean;
  team: boolean;
  player: boolean;
  league: boolean;
  } = { all: false, team: false, player: false, league: false };

  noMoreData: {
  all: boolean;
  team: boolean;
  player: boolean;
  league: boolean;
  } = { all: false, team: false, player: false, league: false };

  favorites: Set<string> = new Set();
  private destroy$: Subject<void> = new Subject<void>();

  currentPage: {
    all: number;
  team: number;
  player: number;
  league: number;
  } = { all: 0, team: 0, player: 0, league: 0 };
  itemsPerPage = 20;

  dataLoaded: {
  all: boolean;
  team: boolean;
  player: boolean;
  league: boolean;
  } = { all: false, team: false, player: false, league: false };

  private searchSubject = new Subject<{query: string, filter: 'all' | 'team' | 'player' | 'league'}>();

  constructor(private navController: NavController, private supabaseService: SupabaseService, private router: Router, private appService: AppService) { }

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged((prev, curr) => prev.query === curr.query && prev.filter === curr.filter),
      switchMap(({ query, filter }) => {
        this.isLoading = true; 
        return from(this.loadData(query, filter));
      })
    ).subscribe(() => {
      this.isLoading = false;
    });

    if (!this.dataLoaded[this.filter]) {
      this.searchSubject.next({ query: this.searchQuery, filter: this.filter });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubject.complete();
  }

  onSearchInput(searchQuery: string, filter: 'all' | 'team' | 'player' | 'league') {
    this.searchSubject.next({ query: searchQuery, filter: filter });
  }

  async loadData(searchQuery: string, filter: 'all' | 'team' | 'player' | 'league') {
    try {

  this.isInfiniteScrollVisible = false;
    setTimeout(() => {
      this.isInfiniteScrollVisible = true;
    }, 0);

      this.currentPage[filter] = 0;
      this.filteredResults[filter] = [];
      this.dataLoaded[filter] = false;
      this.loadingMore[filter] = false;
      this.noMoreData[filter] = false;

      await this.loadNextPage(searchQuery, filter);
      this.dataLoaded[filter] = true;
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async loadNextPage(searchQuery: string, filter: 'all' | 'team' | 'player' | 'league', event?: any) {
    try {
      if (this.loadingMore[filter]) return;
      this.loadingMore[filter] = true;

      this.newItemsCount = 0;

      if (filter === 'team') {
        const teamsData = await this.supabaseService.getTeamsWithOffset(searchQuery, this.currentPage[filter], this.itemsPerPage);
        const formattedTeams = await this.formatData(teamsData, 'team');
        this.filteredResults.team = [...this.filteredResults.team, ...formattedTeams]

        this.newItemsCount = formattedTeams.length;
      }
      else if (filter === 'league') {
        const leaguesData = await this.supabaseService.getLeaguesWithOffset(searchQuery, this.currentPage[filter], this.itemsPerPage);
        const formattedLeagues = await this.formatData(leaguesData, 'league');
        this.filteredResults.league = [...this.filteredResults.league, ...formattedLeagues]

        this.newItemsCount = formattedLeagues.length;
      }

      else if (filter === 'player') {
        const playersData = await this.supabaseService.getPlayersWithOffset(searchQuery, this.currentPage[filter], this.itemsPerPage);
        const formattedPlayers = await this.formatData(playersData, 'player');
        this.filteredResults.player = [...this.filteredResults.player, ...formattedPlayers]

        this.newItemsCount = formattedPlayers.length;
      }

      else {
        const teamsData = await this.supabaseService.getTeamsWithOffset(searchQuery, this.currentPage[filter], this.itemsPerPage);
        const formattedTeams = await this.formatData(teamsData, 'team');
        const leaguesData = await this.supabaseService.getLeaguesWithOffset(searchQuery, this.currentPage[filter], this.itemsPerPage);
        const formattedLeagues = await this.formatData(leaguesData, 'league');
        const playersData = await this.supabaseService.getPlayersWithOffset(searchQuery, this.currentPage[filter], this.itemsPerPage);
        const formattedPlayers = await this.formatData(playersData, 'player');
        this.filteredResults.all = [...this.filteredResults.all, ...formattedTeams, ...formattedLeagues, ...formattedPlayers];

        this.newItemsCount = formattedTeams.length + formattedLeagues.length + formattedPlayers.length;

      }

      if (this.newItemsCount < this.itemsPerPage) {
        this.noMoreData[filter] = true;
      }

      this.currentPage[filter]++;

      if (event) {
        event.target.complete();
      }

    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      this.loadingMore[filter] = false;
    }
  }

  async formatData(data: any[], type: string) {
    const formattedData = [];
    const storedFavorites = localStorage.getItem('favorites');
    const favorites = storedFavorites ? new Set(JSON.parse(storedFavorites)) : new Set<string>();

    for (const item of data) {
      const photoUrl = await this.supabaseService.getPhotoUrl(item.photo_url);
      formattedData.push({
        id: item.id,
        name: item.name || `${item.first_name} ${item.second_name}`,
        type,
        photoUrl,
        isFavorite: favorites.has(`${type}:${item.id}`),
      });
    }
    return formattedData;
  }

  toggleFavorite(item: any, type: 'league' | 'team' | 'player') {
    this.appService.toggleFavorite(item, type);
  }

  goBack() {
    this.navController.back();
  }

  onItemClick(event: Event, item: any, type: 'league' | 'team' | 'player') {
    this.appService.onItemClick(event, item, type);
  }

  isFavoriteItem(type: 'league' | 'team' | 'player', id: string): boolean {
    return this.appService.isFavoriteItem(type, id);
  }
}