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
  selectedSegment: string = 'results';
  gamesPlayed: any[] = [];
  gamesToPlay: any[] = []; 
  favoriteLeagues: any[] = [];
  leagueTable: any[] = []; 

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  
  async ngOnInit() {
    this.loadFavoriteLeagues();
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

  async loadTable(leagueId: number) {
    try {
      this.isLoading = true;
      this.leagueTable = await this.loadLeagueTable(leagueId);  // Uložení výsledků do proměnné
    } catch (error) {
      console.error('Chyba při načítání tabulky ligy:', error);
    } finally {
      this.isLoading = false;
    }
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

  // Přidání nebo odebrání lig z oblíbených
  toggleFavoriteFromMenu(league: any, type: string) {
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
    const leagueTable = await Promise.all(sortedTeams.map( async teamStat => {
      const team = teams.find(t => t.id === teamStat.teamId);
      const photoUrl = await this.supabaseService.getPhotoUrl(team.photo_url);
      return {
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
