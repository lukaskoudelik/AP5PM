import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class SearchPage implements OnInit, OnDestroy {
  searchQuery: string = '';
  searchResults: any[] = [];
  filteredResults: any[] = [];
  filter: string = 'all';
  favorites: Set<string> = new Set();
  private destroy$: Subject<void> = new Subject<void>();
  private dataLoaded = false;

  constructor(private navController: NavController, private supabaseService: SupabaseService, private router: Router) {}

  ionViewWillEnter() {
    if (!this.dataLoaded) {
      this.loadAllData();
    }
  }

  ionViewWillLeave() {
    this.filteredResults = [];
  }

  ngOnInit() {
    if (!this.dataLoaded) {
      this.loadAllData();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Funkce pro načítání lig, týmů a hráčů
  async loadAllData() {
    try {
      const leaguesData = await this.supabaseService.getLeagues();
      const teamsData = await this.supabaseService.getTeams();
      const playersData = await this.supabaseService.getPlayers();

      const formattedLeagues = await this.formatData(leaguesData, 'league');
      const formattedTeams = await this.formatData(teamsData, 'team');
      const formattedPlayers = await this.formatData(playersData, 'player');

      this.searchResults = [...formattedLeagues, ...formattedTeams, ...formattedPlayers];
      this.filteredResults = [...this.searchResults];
      this.dataLoaded = true;

      console.log('Loaded data:', this.searchResults);
      this.filterResults();
    } catch (error) {
      console.error('Error loading data:', error);
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

  onSearchInput() {
    this.filterResults();
  }

  onFilterChange() {
    this.filterResults();
  }

  filterResults() {
    this.filteredResults = [];
  
    if (this.filter === 'all') {
      this.filteredResults = this.searchResults.filter(item =>
        item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredResults = this.searchResults
        .filter(item => item.type === this.filter)
        .filter(item =>
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
    }
  }

  toggleFavorite(item: any, type: string) {
    const key = `${type}:${item.id}`;
    const storedFavorites = localStorage.getItem('favorites');
    let favorites = new Set<string>();

    if (storedFavorites) {
        favorites = new Set(JSON.parse(storedFavorites));
    }

    if (favorites.has(key)) {
        favorites.delete(key);
        item.isFavorite = false;
    } else {
        favorites.add(key);
        item.isFavorite = true;
    }

    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
}

updateFavoriteStatus(item: any) {
  const key = `${item.type}:${item.id}`;
  this.searchResults = this.searchResults.map(result =>
    `${result.type}:${result.id}` === key
      ? { ...result, isFavorite: this.favorites.has(key) }
      : result
  );
  this.filterResults();
}

saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(Array.from(this.favorites)));
}

loadFavorites() {
  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    this.favorites = new Set(JSON.parse(storedFavorites));
  }
}

  goBack() {
    this.navController.back();
  }

  onItemClick(event: Event, result: any) {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.tagName === 'ION-BUTTON') {
      event.preventDefault();
    } else {
      this.router.navigate(['../', result.type, result.id]);
    }
  }
}