import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})

export class Tab3Page implements OnInit{

    favoritePlayers: any[] = [];
  
    constructor(private supabaseService: SupabaseService, private router: Router) {}
  
    ngOnInit() {
      this.loadFavoritePlayers();
    }
  
    // Načítání oblíbených hráčů z localStorage
    async loadFavoritePlayers() {
      const storedFavorites = localStorage.getItem('favorites');
      let favorites = new Set<string>();
  
      if (storedFavorites) {
        favorites = new Set(JSON.parse(storedFavorites));
      }
  
      const playersData = await this.supabaseService.getPlayers();
  
      this.favoritePlayers = await Promise.all(
        playersData
          .filter(player => favorites.has(`player:${player.id}`))
          .map(async player => ({
            id: player.id,
            name: `${player.first_name} ${player.second_name}`,
            photoUrl: await this.supabaseService.getPhotoUrl(player.photo_url)
          }))
      );
    }
  
    // Přidání nebo odebrání hráčů z oblíbených
    toggleFavorite(player: any, type: string) {
      const key = `${type}:${player.id}`;
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
      this.loadFavoritePlayers();
    }

    onMenuOpened() {
      this.loadFavoritePlayers();
  }

  onItemClick(event: Event, player: any) {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.tagName === 'ION-BUTTON') {
      event.preventDefault();
    } else {
      this.router.navigate(['../../player', player.id]);
    }
  }

}
