import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team',
  templateUrl: './team.page.html',
  styleUrls: ['./team.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class TeamPage implements OnInit {
  team: any;
  league: any;
  isLoading: boolean = true;
  selectedSegment: string = 'results';
  gamesPlayed: any[] = [];
  gamesToPlay: any[] = []; 
  opponent: any;
  favoriteTeams: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.loadFavoriteTeams();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = await this.supabaseService.getTeamById(id);
      if (data) {
        this.team = data;
        this.isLoading = false;
        this.loadPhotoUrl(this.team.photo_url);
        if (this.team.league_id) {
          this.loadLeagueForTeam(this.team.league_id);   
        }
        this.loadGamesWithTeams();
      }
    }
    this.isFavoriteItem('team', this.team.id);
  }

  navigateToTab(type: string) {
    this.router.navigate([`../tabs/${type}`]);
  }

  navigateToSearch() {
    this.router.navigate([`../search/`]);
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

  onMenuOpened() {
    this.loadFavoriteTeams();
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

   toggleFavoriteFromMenu(team: any, type: string) {
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
    this.loadFavoriteTeams(); 
  }

  isFavoriteItem(type: string, id: string): boolean {
    const storedFavorites = localStorage.getItem('favorites');
    if (!storedFavorites) {
      return false;
    }
  
    const favorites = new Set(JSON.parse(storedFavorites));
    
    return favorites.has(`${type}:${id}`);
    
  }

  async loadPhotoUrl(photoUrl: string) {
    try {
      const fullPhotoUrl = await this.supabaseService.getPhotoUrl(photoUrl);
      this.team.photoUrl = fullPhotoUrl;
    } catch (error) {
      console.error('Error loading team photo:', error);
    }
  }

  async loadLeagueForTeam(leagueId: number) {
    try {
      const leagueData = await this.supabaseService.getLeagueById(`${leagueId}`);
      this.league = leagueData;
    } catch (error) {
      console.error('Error loading league:', error);
    }
  }

  onSegmentChange(event: any) {
    console.log('Selected Segment:', event.detail.value);
  }

  async loadGamesWithTeams() {
    try {
      const games = await this.supabaseService.getGamesByTeamId(this.team.id);
  
      // Načtení domácího a venkovního týmu s jejich fotografiemi
      const gamesWithTeams = await Promise.all(games.map(async (game) => {
        const { homeTeam, awayTeam } = await this.supabaseService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);
        return {
          ...game,
          homeTeam,
          awayTeam
        };
      }));
  
      this.gamesPlayed = gamesWithTeams.filter(game => game.result).sort((a, b) => b.round_number - a.round_number);;
      this.gamesToPlay = gamesWithTeams.filter(game => !game.result);
  
    } catch (error) {
      console.error('Chyba při načítání zápasů s týmy:', error);
    }
  }

  onItemClick(event: Event, team: any) {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.tagName === 'ION-BUTTON') {
      event.preventDefault();
    } else {
      this.router.navigate(['../../team', team.id]);
    }
  }
}
