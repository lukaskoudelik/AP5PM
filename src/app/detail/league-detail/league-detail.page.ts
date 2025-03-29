import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-league-detail',
  templateUrl: './league-detail.page.html',
  styleUrls: ['./league-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})

export class LeagueDetailPage implements OnInit {
  activeTab: 'league' = 'league';

  league: any;
  isLoading: boolean = true;
  selectedSegment: string = 'results';
  gamesPlayed: any[] = [];
  gamesToPlay: any[] = [];
  favoriteLeagues: any[] = [];
  leagueTable: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private router: Router,
    private appService: AppService
  ) { }


  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = await this.supabaseService.getLeagueById(id);
      if (data) {
        this.league = data;
        this.isLoading = false;
        this.loadPhotoUrl(this.league.photo_url);
        this.loadGamesWithTeams();
        this.loadTable(this.league.id);
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

  async toggleFavorite(item: any, type: 'league' | 'team' | 'player'){
    this.appService.toggleFavorite(item, type);
  }

  ionViewWillEnter() {
    this.appService.setActiveTab(this.activeTab);
  }

  isFavoriteItem(type: 'league' | 'team' | 'player', id: string): boolean {
    return this.appService.isFavoriteItem(type, id);
  }

  onItemClick(event: Event, league: any, type: 'league' | 'team' | 'player') {
    this.appService.onItemClick(event, league, type);
  }

  async loadPhotoUrl(photoUrl: string) {
    try {
      const fullPhotoUrl = await this.supabaseService.getPhotoUrl(photoUrl);
      this.league.photoUrl = fullPhotoUrl;
    } catch (error) {
      console.error('Error loading league photo:', error);
    }
  }


  async loadGamesWithTeams() {
    try {
      // Načtení zápasů týmu
      const games = await this.supabaseService.getGamesByLeagueId(this.league.id);

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

  async loadTable(leagueId: number) {
    try {
      this.isLoading = true;
      this.leagueTable = await this.loadLeagueTable(leagueId);
    } catch (error) {
      console.error('Chyba při načítání tabulky ligy:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadLeagueTable(leagueId: number) {
    try {
      // Načteme všechny zápasy pro danou ligu
      const games = await this.supabaseService.getGamesByLeagueId(`${leagueId}`);
      const teamsStats: { [teamId: number]: { points: number; goalsFor: number; goalsAgainst: number; gamesPlayed: number } } = {};

      games.forEach(game => {
        if (game.result) {
          const [homeScore, awayScore] = game.result.split('-').map(Number);

          // Inicializujeme týmy, pokud ještě nejsou v objektu
          if (!teamsStats[game.home_team_id]) {
            teamsStats[game.home_team_id] = { points: 0, goalsFor: 0, goalsAgainst: 0, gamesPlayed: 0 };
          }
          if (!teamsStats[game.away_team_id]) {
            teamsStats[game.away_team_id] = { points: 0, goalsFor: 0, goalsAgainst: 0, gamesPlayed: 0 };
          }

          // Přičteme skóre
          teamsStats[game.home_team_id].goalsFor += homeScore;
          teamsStats[game.home_team_id].goalsAgainst += awayScore;
          teamsStats[game.away_team_id].goalsFor += awayScore;
          teamsStats[game.away_team_id].goalsAgainst += homeScore;

          // Počet odehraných zápasů
          teamsStats[game.home_team_id].gamesPlayed++;
          teamsStats[game.away_team_id].gamesPlayed++;

          // Počítání bodů
          if (homeScore > awayScore) {
            teamsStats[game.home_team_id].points += 3;
          } else if (awayScore > homeScore) {
            teamsStats[game.away_team_id].points += 3;
          } else {
            teamsStats[game.home_team_id].points += 1;
            teamsStats[game.away_team_id].points += 1;
          }
        }
      });

      // Seřadíme týmy podle bodů a pak podle skóre
      const sortedTeams = Object.keys(teamsStats).map(teamId => ({
        teamId: Number(teamId),
        ...teamsStats[Number(teamId)],
      })).sort((a, b) => {
        if (b.points === a.points) {
          // Pokud mají stejný počet bodů, porovnáme skóre
          const goalDifferenceB = b.goalsFor - b.goalsAgainst;
          const goalDifferenceA = a.goalsFor - a.goalsAgainst;
          return goalDifferenceB - goalDifferenceA;
        }
        return b.points - a.points;  // Seřadíme podle bodů
      });

      // Načteme týmy a přiřadíme jim názvy
      const teams = await this.supabaseService.getTeamsByIds(sortedTeams.map(team => team.teamId.toString()));

      // Vytvoříme výslednou tabulku týmů
      const leagueTable = await Promise.all(sortedTeams.map(async teamStat => {
        const team = teams.find(t => t.id === teamStat.teamId);
        const photoUrl = await this.supabaseService.getPhotoUrl(team.photo_url);
        return {
          id: team.id,
          name: team.name,
          points: teamStat.points,
          goalsFor: teamStat.goalsFor,
          goalsAgainst: teamStat.goalsAgainst,
          gamesPlayed: teamStat.gamesPlayed,
          photoUrl
        };
      }));

      return leagueTable;
    } catch (error) {
      console.error('Chyba při načítání tabulky ligy:', error);
      throw error;
    }
  }



}
