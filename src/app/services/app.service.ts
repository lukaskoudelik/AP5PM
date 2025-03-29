import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  searchedResults: any[] = [];
  filteredResults: any[] = [];
  itemsData: any[] = [];
  searchQuery: string = '';

  private favoriteItemsSubject = new BehaviorSubject<{ league: any[], team: any[], player: any[] }>({
    league: [],
    team: [],
    player: []
  });
  private activeTabSubject = new BehaviorSubject<'league' | 'team' | 'player'>('league');

  favoriteItems$ = this.favoriteItemsSubject.asObservable();
  activeTab$ = this.activeTabSubject.asObservable();

  constructor(private supabaseService: SupabaseService, private router: Router) {}

  onItemClick(event: Event, item: any, type: 'league' | 'team' | 'player') {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.tagName === 'ION-BUTTON') {
      event.preventDefault();
    } else {
      this.router.navigate([`../../${type}`, item.id]);
    }
  }

  setActiveTab(tab: 'league' | 'team' | 'player') {
    this.activeTabSubject.next(tab);
  }

  getActiveTab(): 'league' | 'team' | 'player' {
    return this.activeTabSubject.value;
  }

  // Načítání oblíbených z localStorage
  async loadFavorites(type: 'league' | 'team' | 'player') {
    const storedFavorites = localStorage.getItem('favorites');
    let favorites = new Set<string>();

    if (storedFavorites) {
      favorites = new Set(JSON.parse(storedFavorites));
    }
    
    const [leaguesData, teamsData, playersData] = await Promise.all([
      this.supabaseService.getLeagues(),
      this.supabaseService.getTeams(),
      this.supabaseService.getPlayers()
    ]);
    
    // Výběr správného pole podle vstupního parametru
    const dataMap = {
      league: leaguesData,
      team: teamsData,
      player: playersData
    };

    const selectedData = dataMap[type] || [];


    // Filtrování podle oblíbených a načtení obrázků
    const favoriteItems = await Promise.all(
      selectedData
        .filter(item => favorites.has(`${type}:${item.id}`))
        .map(async item => ({
          id: item.id,
          name: type === 'player' ? `${item.first_name} ${item.second_name}` : item.name,
          photoUrl: await this.supabaseService.getPhotoUrl(item.photo_url)
        }))
    );
    
    const currentFavorites = this.favoriteItemsSubject.value;
    this.favoriteItemsSubject.next({ ...currentFavorites, [type]: favoriteItems });

    return favoriteItems;

  }

  async loadAllFavorites() {
    await Promise.all([
      this.loadFavorites('league'),
      this.loadFavorites('team'),
      this.loadFavorites('player')
    ]);
  }

  toggleFavorite(item: any, type: 'league' | 'team' | 'player') {
    const key = `${type}:${item.id}`;
    const storedFavorites = localStorage.getItem('favorites');
    let favorites = new Set<string>();

    if (storedFavorites) {
      favorites = new Set(JSON.parse(storedFavorites));
    }

    if (favorites.has(key)) {
      favorites.delete(key);
    } else {
      favorites.add(key);
    }

    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
    this.loadFavorites(type);
  }

  isFavoriteItem(type: 'league' | 'team' | 'player', id: string): boolean {
    const storedFavorites = localStorage.getItem('favorites');
    if (!storedFavorites) {
      return false;
    }

    const favorites = new Set(JSON.parse(storedFavorites));

    return favorites.has(`${type}:${id}`);

  }

}
