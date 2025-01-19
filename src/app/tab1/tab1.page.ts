import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router, NavigationEnd  } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit{

  favoriteTeams: any[] = []; // Seznam oblíbených týmů
  searchQuery: string = '';
  searchedResults: any[] = [];
  filteredResults: any[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFavoriteTeams();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd && event.urlAfterRedirects === '/tabs/tab1') {
        // Znovunačtení dat při návratu
        this.loadFavoriteTeams();
      }
    });
  }

  // Načítání oblíbených týmů z localStorage
  async loadFavoriteTeams() {
    const storedFavorites = localStorage.getItem('favorites');
    let favorites = new Set<string>();

    if (storedFavorites) {
      favorites = new Set(JSON.parse(storedFavorites));
    }

    const teamsData = await this.supabaseService.getTeams();

    this.favoriteTeams = await Promise.all(
      teamsData
        .filter(team => favorites.has(`team:${team.id}`))
        .map(async team => ({
          id: team.id,
          name: team.name,
          photoUrl: await this.supabaseService.getPhotoUrl(team.photo_url)
        }))
    );
  }

  // Přidání nebo odebrání týmu z oblíbených
  toggleFavorite(team: any, type: string) {
    const key = `${type}:${team.id}`;
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
    this.loadFavoriteTeams(); // Aktualizace seznamu
  }

   // Zavolá se, když je menu otevřeno
   onMenuOpened() {
      this.loadFavoriteTeams();
  }

  filterResults() {
    this.filteredResults = [];
    this.filteredResults = this.searchedResults.filter(item =>
      item.name.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

  }

  onItemClick(event: Event, team: any) {
    const clickedElement = event.target as HTMLElement;
    if (clickedElement.tagName === 'ION-BUTTON') {
      event.preventDefault();
    } else {

      this.router.navigate(['../../team', team.id]);
    }
  }

  onSearchInput() {
    if (!this.searchQuery) {
      this.searchedResults = [];
      this.filteredResults = [];
    } else {
      this.loadAllTeams();
    }
  }

  async loadAllTeams() {
    try {
      const teamsData = await this.supabaseService.getTeams();
      const formattedTeams = await this.formatData(teamsData, 'team');

      this.searchedResults = [...formattedTeams];
      this.filteredResults = [...this.searchedResults];
      this.filterResults();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  async formatData(data: any[], type: string) {
    const formattedData = [];
    
    for (const item of data) {
      const photoUrl = await this.supabaseService.getPhotoUrl(item.photo_url);
      formattedData.push({
        id: item.id,
        name: item.name,
        photoUrl,
      });
    }
    return formattedData;
  }


  ionViewWillEnter() {
    this.loadFavoriteTeams();
  }
}
