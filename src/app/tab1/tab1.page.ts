import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit{

  favoriteTeams: any[] = []; // Seznam oblíbených týmů

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadFavoriteTeams();
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

  onItemClick(event: Event, team: any) {
    const clickedElement = event.target as HTMLElement;

    // Zkontrolujeme, zda byl kliknut tlačítko nebo jiný prvek
    if (clickedElement.tagName === 'ION-BUTTON') {
      event.preventDefault(); // Zruší přesměrování při kliknutí na tlačítko
    } else {
      // Zpracování normálního kliknutí
      this.router.navigate(['../../team', team.id]);
    }
  }
}
