import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from 'src/app/services/supabase.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-game-detail',
  templateUrl: './game-detail.page.html',
  styleUrls: ['./game-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class GameDetailPage implements OnInit {

  game: any;
  isLoading: boolean = true;
  selectedSegment: string = 'events';
  homeStarters: any[] = [];
homeBench: any[] = [];
awayStarters: any[] = [];
awayBench: any[] = [];
homeGoals: any = [];
awayGoals: any = [];

  constructor(private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private router: Router,
    private appService: AppService) { }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = await this.supabaseService.getGameById(id);
      if (data) {
        this.game = data;
        await this.loadGameWithTeams(this.game.id);
        await this.loadLineups(this.game.id);
        await this.loadGoals(this.game.id);
      }
    }
  }

  async loadGameWithTeams(gameId: number) {
    try {
      this. isLoading = true;
      const game = await this.supabaseService.getGameById(`${gameId}`);

      if (!game) {
        console.warn('Zápas nenalezen');
        return;
      }

      const { homeTeam, awayTeam } = await this.supabaseService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);
      const league = await this.supabaseService.getLeagueById(`${game.league_id}`)

      this.game = {
        ...game,
        homeTeam,
        awayTeam,
        league
      };

      this. isLoading = false;

    } catch (error) {
      console.error('Chyba při načítání zápasu s týmy:', error);
    }
  }

  async loadLineups(gameId: number) {
    try {
      const gamePlayers = await this.supabaseService.getPlayersByGameId(`${gameId}`);
  
      const enrichedPlayers = await Promise.all(
        gamePlayers.map(async (gp) => {
          const player = await this.supabaseService.getPlayerById(gp.player_id);
          return {
            ...gp,
            player // přidané info o hráči (jméno, číslo, pozice atd.)
          };
        })
      );
  
      this.homeStarters = enrichedPlayers.filter(p => p.home_or_away === 'home' && p.role === 'starter');
      this.homeBench    = enrichedPlayers.filter(p => p.home_or_away === 'home' && p.role === 'bench');
      this.awayStarters = enrichedPlayers.filter(p => p.home_or_away === 'away' && p.role === 'starter');
      this.awayBench    = enrichedPlayers.filter(p => p.home_or_away === 'away' && p.role === 'bench');
  
    } catch (error) {
      console.error('Chyba při načítání sestav:', error);
    }
  }

  async loadGoals(gameId: number) {
    try {
      // Načteme góly pro daný zápas
      const goals = await this.supabaseService.getGoalsByGameId(`${gameId}`);
  
      // Enrich hráče pro každý gól (přidání jména hráče)
      const enrichedGoals = await Promise.all(
        goals.map(async (goal) => {
          const player = await this.supabaseService.getPlayerById(goal.player_id);
          return {
            ...goal,
            playerName: `${player.first_name} ${player.second_name}`,
            homeOrAway: goal.home_or_away // Rozdělení podle domácího/venkovního týmu
          };
        })
      );
  
      // Rozdělení gólů na domácí a venkovní
      this.homeGoals = enrichedGoals.filter(goal => goal.homeOrAway === 'home');
      this.awayGoals = enrichedGoals.filter(goal => goal.homeOrAway === 'away');
  
    } catch (error) {
      console.error('Chyba při načítání gólů:', error);
    }
  }
}
