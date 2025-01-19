import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit{

    favoriteLeagues: any[] = [];
  
    constructor(private supabaseService: SupabaseService, private router: Router) {}
  
    ngOnInit() {
      this.loadFavoriteLeagues();
    }
  
    // Načítání oblíbených lig z localStorage
    async loadFavoriteLeagues() {
      const storedFavorites = localStorage.getItem('favorites');
      let favorites = new Set<string>();
  
      if (storedFavorites) {
        favorites = new Set(JSON.parse(storedFavorites));
      }
  
      const leaguesData = await this.supabaseService.getLeagues();
  
      this.favoriteLeagues = await Promise.all(
        leaguesData
          .filter(league => favorites.has(`league:${league.id}`))
          .map(async league => ({
            id: league.id,
            name: league.name,
            photoUrl: await this.supabaseService.getPhotoUrl(league.photo_url)
          }))
      );
    }
  
    // Přidání nebo odebrání lig z oblíbených
    toggleFavorite(league: any, type: string) {
      const key = `${type}:${league.id}`;
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
      this.loadFavoriteLeagues();
    }

    onMenuOpened() {
      this.loadFavoriteLeagues();
  }

  onItemClick(event: Event, league: any) {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.tagName === 'ION-BUTTON') {
      event.preventDefault();
    } else {
      this.router.navigate(['../../league', league.id]);
    }
  }
}
