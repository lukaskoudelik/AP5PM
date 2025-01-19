import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player',
  templateUrl: './player.page.html',
  styleUrls: ['./player.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class PlayerPage implements OnInit {
  player: any;
  isLoading: boolean = true;
  favoritePlayers: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadFavoritePlayers();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = await this.supabaseService.getPlayerById(id);
      if (data) {
        this.player = data;
        this.isLoading = false;
      }
    }
    this.isFavoriteItem('player', this.player.id);
  }

  navigateToTab(type: string) {
    this.router.navigate([`../tabs/${type}`]);
  }

  navigateToSearch() {
    this.router.navigate([`../search/`]);
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
    this.isFavoriteItem(type, item.id);
  }

  isFavoriteItem(type: string, id: string): boolean {
    const storedFavorites = localStorage.getItem('favorites');
    if (!storedFavorites) {
      return false;
    }
  
    const favorites = new Set(JSON.parse(storedFavorites));
    
    return favorites.has(`${type}:${id}`);
    
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
  toggleFavoriteFromMenu(player: any, type: string) {
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
