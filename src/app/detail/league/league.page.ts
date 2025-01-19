import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-league',
  templateUrl: './league.page.html',
  styleUrls: ['./league.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})

export class LeaguePage implements OnInit {
  league: any;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = await this.supabaseService.getLeagueById(id);
      if (data) {
        this.league = data;
        this.isLoading = false;
      }
    }
    this.isFavoriteItem('league', this.league.id);
  }

  navigateToTab(type: string) {
    this.router.navigate([`../tabs/${type}`]);
  }

  navigateToSearch() {
    this.router.navigate([`../search/`]);
  }

  // Přidání nebo odebrání lig z oblíbených
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


}
