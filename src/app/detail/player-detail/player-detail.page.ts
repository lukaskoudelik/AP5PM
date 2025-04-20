import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-player-detail',
  templateUrl: './player-detail.page.html',
  styleUrls: ['./player-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class PlayerDetailPage implements OnInit {
  activeTab: 'player' = 'player';
  player: any;
  team: any;
  games: any[] = [];
  playersGame: any[] = [];
  isLoading: boolean = true;
  favoritePlayers: any[] = [];
  selectedSegment: string = 'results';
  role: any;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private router: Router,
    private appService: AppService
  ) { }

  async ngOnInit() {
    this.appService.setActiveTab(this.activeTab);
    const id = await this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = await this.supabaseService.getPlayerById(id);
      if (data) {
        this.player = data;
        await this.loadPhotoUrl(this.player.photo_url);
        await this.loadteamForPlayer(this.player.team_id);
        await this.loadGamesWithTeams(this.player.id);
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

  toggleFavorite(item: any, type: 'league' | 'team' | 'player'){
    this.appService.toggleFavorite(item, type);
  }

  isFavoriteItem(type: 'league' | 'team' | 'player', id: string): boolean {
    return this.appService.isFavoriteItem(type, id);
  }


  onItemClick(event: Event, item: any, type: 'league' | 'team' | 'player') {
    this.appService.onItemClick(event, item, type);
  }

  async loadPhotoUrl(photoUrl: string) {
    try {
      const fullPhotoUrl = await this.supabaseService.getPhotoUrl(photoUrl);
      this.player.photoUrl = fullPhotoUrl;
    } catch (error) {
      console.error('Error loading team photo:', error);
    }
  }

  async loadteamForPlayer(teamId: number) {
    try {
      const teamData = await this.supabaseService.getTeamById(`${teamId}`);
      this.team = teamData;
    } catch (error) {
      console.error('Error loading league:', error);
    }
  }

  async loadGamesWithTeams(playerId: number) {
    try {
      this.isLoading = true;
      const gamePlayersData = await this.supabaseService.getGamePlayersByPlayerId(`${playerId}`);
      this.playersGame = gamePlayersData;
      this.games = [];
      for (const playerGame of this.playersGame) {
        const game = await this.supabaseService.getGameById(`${playerGame.game_id}`); // Zavoláme službu pro získání zápasu podle ID
        if (game) {
          this.games.push(game);
        }
      }

      const games = this.games;
  
      // Načtení domácího a venkovního týmu s jejich fotografiemi
      const gamesWithTeams = await Promise.all(games.map(async (game) => {
        const playerGame = this.playersGame.find(pg => pg.game_id === game.id);
        const { homeTeam, awayTeam } = await this.supabaseService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);

        const goals = await this.supabaseService.getGoalsByGameId(`${game.id}`); // Načtení všech gólů pro daný zápas
        const playerGoals = goals.filter(goal => goal.player_id === this.player.id);

        const playerGoalsCount = playerGoals.length;
        const playerGoalsMinutes = playerGoalsCount > 0
        ? `${playerGoals.map(goal => `${goal.minute}'`).join(', ')}`
        : '';

        let playerRole: string;
        if (playerGame?.role == "starter")
        {
          playerRole = "základní sestava";
        }
        else if (playerGame?.role == "bench")
        {
          playerRole = "střídající hráč";
        }
        else {
          playerRole = "mimo sestavu";
        }

        const role = playerRole;

        return {
          ...game,
          homeTeam,
          awayTeam,
          role,
          playerGoalsCount,
          playerGoalsMinutes
        };
      }));
  
      this.games = gamesWithTeams.filter(game => game.result).sort((a, b) => b.round_number - a.round_number);;
      this.isLoading = false;
  
    } catch (error) {
      console.error('Chyba při načítání zápasů s týmy:', error);
    }
  }

  goToGameDetail(gameId: string) {
    this.appService.goToGameDetail(gameId);
  }

}
