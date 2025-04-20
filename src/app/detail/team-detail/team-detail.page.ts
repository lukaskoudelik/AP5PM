import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppService } from 'src/app/services/app.service';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.page.html',
  styleUrls: ['./team-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class TeamDetailPage implements OnInit {
  activeTab: 'team' = 'team';
  team: any;
  league: any;
  selectedSegment: string = 'results';
  gamesPlayed: any[] = [];
  gamesToPlay: any[] = []; 
  opponent: any;
  favoriteTeams: any[] = [];
  leagueTable: any[] = []; 

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private router: Router,
    private appService: AppService
  ) {}

  async ngOnInit() {
    this.appService.setActiveTab(this.activeTab);
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const data = await this.supabaseService.getTeamById(id);
      if (data) {
        this.team = data;
        this.loadPhotoUrl(this.team.photo_url);
        if (this.team.league_id) {
          this.loadLeagueForTeam(this.team.league_id);   
          this.loadTable(this.team.league_id);
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

  async loadTable(leagueId: number) {
    try {
      this.leagueTable = await this.loadLeagueTable(leagueId);  // Uložení výsledků do proměnné
    } catch (error) {
      console.error('Chyba při načítání tabulky ligy:', error);
    } finally {
    }
  }

  async loadPhotoToTable(photourl: string){
      const url = await this.supabaseService.getPhotoUrl(photourl);
      return(url);
  }

  async loadLeagueTable(leagueId: number) {
    try {
      // Načteme všechny zápasy pro danou ligu
      const games = await this.supabaseService.getGamesByLeagueId(`${leagueId}`);
  
      // Vytvoříme objekt pro uložení informací o týmech s konkrétním typem
      const teamsStats: { [teamId: number]: { points: number; goalsFor: number; goalsAgainst: number; gamesPlayed: number } } = {};
  
      games.forEach(game => {
        // Extrahujeme výsledek zápasu
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
            teamsStats[game.home_team_id].points += 3;  // Domácí vítězství
          } else if (awayScore > homeScore) {
            teamsStats[game.away_team_id].points += 3;  // Hostující vítězství
          } else {
            teamsStats[game.home_team_id].points += 1;  // Remíza - domácí dostanou 1 bod
            teamsStats[game.away_team_id].points += 1;  // Remíza - hosté dostanou 1 bod
          }
        }
      });
  
      // Seřadíme týmy podle bodů a pak podle skóre
      const sortedTeams = Object.keys(teamsStats).map(teamId => ({
        teamId: Number(teamId), // Ujistíme se, že ID týmu je číslo
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
      const leagueTable = await Promise.all(sortedTeams.map( async teamStat => {
        const team = teams.find(t => t.id === teamStat.teamId);
        const photoUrl = await this.supabaseService.getPhotoUrl(team.photo_url);
        return {
          name: team.name,
          points: teamStat.points,
          goalsFor: teamStat.goalsFor,
          goalsAgainst: teamStat.goalsAgainst,
          gamesPlayed: teamStat.gamesPlayed,
          photoUrl,
          id: team.id
        };
      }));
  
      // Jeden return, který vrací konečnou tabulku
      return leagueTable;
    } catch (error) {
      console.error('Chyba při načítání tabulky ligy:', error);
      throw error; // Případně vyhození chyby, pokud se něco nepovede
    }
  }

  goToGameDetail(gameId: string) {
    this.appService.goToGameDetail(gameId);
  }
}
