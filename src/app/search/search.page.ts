import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Subject, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { NavigationService } from '../services/domain/navigation.service';
import { FavouritesService } from '../services/domain/favourites.service';
import { SearchService } from '../services/domain/search.service';


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

  favorites: Set<string> = new Set();
  private destroy$: Subject<void> = new Subject<void>();
  private searchSubject = new Subject<{ query: string, filter: 'all' | 'team' | 'player' | 'league' }>();

  constructor(private navController: NavController, private favouritesService: FavouritesService, private navigationService: NavigationService, private searchService: SearchService) { }

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
  if (this.loadingMore[filter]) return;

  this.loadingMore[filter] = true;
  this.newItemsCount = 0;

  try {
    const { newItemsCount, formattedResults } = await this.searchService.loadNextPage(searchQuery, filter, this.currentPage[filter], this.itemsPerPage);

    if (filter === 'all') {
      this.filteredResults.all = [...this.filteredResults.all, ...formattedResults];
    } else {
      this.filteredResults[filter] = [...this.filteredResults[filter], ...formattedResults];
    }

    this.newItemsCount = newItemsCount;

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

  toggleFavorite(item: any, type: 'league' | 'team' | 'player') {
    this.favouritesService.toggleFavorite(item, type);
  }

  goBack() {
    this.navController.back();
  }

  onItemClick(event: Event, item: any, type: 'league' | 'team' | 'player') {
    this.navigationService.goToItem(event, item, type);
  }

  isFavoriteItem(type: 'league' | 'team' | 'player', id: string): boolean {
    return this.favouritesService.isFavoriteItem(type, id);
  }
}