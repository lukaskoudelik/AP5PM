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
  isLoadingEvents: boolean = true;
  isLoadingSquadlist: boolean = true;
  isLoadingTable: boolean = true;
  selectedSegment: string = 'events';
  homeStarters: any[] = [];
  homeBench: any[] = [];
  awayStarters: any[] = [];
  awayBench: any[] = [];
  homeGoals: any = [];
  awayGoals: any = [];
  allGoals: any = [];
  leagueTable: any[] = [];
  homeYellowCards: any = [];
  homeSecondYellowCards: any = [];
  homeRedCards: any = [];
  awayYellowCards: any = [];
  awaySecondYellowCards: any = [];
  awayRedCards: any = [];
  allYellowCards: any = [];
  allSecondYellowCards: any = [];
  allRedCards: any = [];
  allEvents: any = [];
  firstHalfEvents : any = [];
  secondHalfEvents : any = [];

  starters: number = 0;
  benchers: number = 0;
  startersIndexes: number[] = [];
  benchersIndexes: number[] = [];

  positionCounts: {
    goalkeeper: number;
    defender: number;
    midfielder: number;
    attacker: number;
    other: number;
  } = {
      goalkeeper: 0,
      defender: 0,
      midfielder: 0,
      attacker: 0,
      other: 0
    };

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
        await this.loadGoalsAndCards(this.game.id);
        await this.loadTable(this.game.league_id);
      }
    }
  }

  async loadGameWithTeams(gameId: number) {
    try {
      this.isLoading = true;
      const game = await this.supabaseService.getGameById(`${gameId}`);

      if (!game) {
        console.warn('Zápas nenalezen');
        return;
      }

      const { homeTeam, awayTeam } = await this.supabaseService.getTeamsWithPhotos(game.home_team_id, game.away_team_id);
      const league = await this.supabaseService.getLeagueById(`${game.league_id}`)
      const leaguePhotoUrl = await this.supabaseService.getPhotoUrl(league.photo_url);

      let score_home = null;
      let score_away = null;

      if (game.result) {
        const [home, away] = game.result.split('-').map(Number);
        score_home = home !== null ? home : null;
        score_away = away !== null ? away : null;
      }

      let stadiumName = null;
      if (game.stadium_id) {
        const stadium = await this.supabaseService.getStadiumById(`${game.stadium_id}`);
        stadiumName = stadium ? stadium.name : null;
      } else {
        const stadium = await this.supabaseService.getStadiumById(`${homeTeam.stadium_id}`)
        stadiumName = stadium ? stadium.name : null;
      }

      const referee = await this.supabaseService.getRefereeById(`${game.referee_id}`);
      const first_ar = await this.supabaseService.getRefereeById(`${game.first_assistant_id}`);
      const second_ar = await this.supabaseService.getRefereeById(`${game.second_assistant_id}`);

      this.game = {
        ...game,
        homeTeam,
        awayTeam,
        league,
        leaguePhotoUrl,
        score_home,
        score_away,
        stadiumName,
        referee,
        first_ar,
        second_ar,
      };


    } catch (error) {
      console.error('Chyba při načítání zápasu s týmy:', error);
    }
    finally {
      this.isLoading = false;
    }
  }

  async loadLineups(gameId: number) {
    try {
      this.isLoadingSquadlist = true;
      const gamePlayers = await this.supabaseService.getPlayersByGameId(`${gameId}`);

      const enrichedPlayers = await Promise.all(
        gamePlayers.map(async (gp) => {
          const player = await this.supabaseService.getPlayerById(gp.player_id);
          return {
            ...gp,
            player,
            id: player.id // přidané info o hráči (jméno, číslo, pozice atd.)
          };
        })
      );

      this.homeStarters = enrichedPlayers.filter(p => p.home_or_away === 'home' && p.role === 'starter');
      this.homeBench = enrichedPlayers.filter(p => p.home_or_away === 'home' && p.role === 'bench');
      this.awayStarters = enrichedPlayers.filter(p => p.home_or_away === 'away' && p.role === 'starter');
      this.awayBench = enrichedPlayers.filter(p => p.home_or_away === 'away' && p.role === 'bench');

      const positionOrder = ['goalkeeper', 'defender', 'midfielder', 'attacker'];

      // Sort podle pozic

      this.homeStarters = enrichedPlayers
        .filter(p => p.home_or_away === 'home' && p.role === 'starter')
        .sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));

      this.homeBench = enrichedPlayers
        .filter(p => p.home_or_away === 'home' && p.role === 'bench')
        .sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));

      this.awayStarters = enrichedPlayers
        .filter(p => p.home_or_away === 'away' && p.role === 'starter')
        .sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));

      this.awayBench = enrichedPlayers
        .filter(p => p.home_or_away === 'away' && p.role === 'bench')
        .sort((a, b) => positionOrder.indexOf(a.position) - positionOrder.indexOf(b.position));

      if (this.homeStarters.length >= this.awayStarters.length) {
        this.starters = this.homeStarters.length;
      }
      else {
        this.starters = this.awayStarters.length;
      }

      if (this.homeBench.length >= this.awayBench.length) {
        this.benchers = this.homeBench.length;
      }
      else {
        this.benchers = this.awayBench.length;
      }

      this.startersIndexes = Array.from({ length: this.starters }, (_, i) => i);
      this.benchersIndexes = Array.from({ length: this.benchers }, (_, i) => i);

      this.calculatePositionCounts();


    } catch (error) {
      console.error('Chyba při načítání sestav:', error);
    }
    finally {
      this.isLoadingSquadlist = false;
    }
  }

  async loadGoalsAndCards(gameId: number) {
    try {
      this.isLoadingEvents = true;
      // Načteme góly pro daný zápas
      const goals = await this.supabaseService.getGoalsByGameId(`${gameId}`);
      const cards = await this.supabaseService.getCardsByGameId(`${gameId}`);

      // Enrich hráče pro každý gól
      const enrichedGoals = await Promise.all(
        goals.map(async (goal) => {
          const player = await this.supabaseService.getPlayerById(goal.player_id);
          return {
            ...goal,
            playerName: `${player.first_name} ${player.second_name}`,
            homeOrAway: goal.home_or_away,
            player
          };
        })
      );

      // Enrich hráče pro každou kartu
      const enrichedCards = await Promise.all(
        cards.map(async (card) => {
          const player = await this.supabaseService.getPlayerById(card.player_id);
          return {
            ...card,
            playerName: `${player.first_name} ${player.second_name}`,
            homeOrAway: card.home_or_away,
            player
          };
        })
      );

      // Rozdělení gólů na domácí a venkovní
      this.homeGoals = enrichedGoals.filter(goal => goal.homeOrAway === 'home');
      this.awayGoals = enrichedGoals.filter(goal => goal.homeOrAway === 'away');

      // Rozdělení karet na domácí a venkovní
      this.homeYellowCards = enrichedCards.filter(card => card.type === 'yellow' && card.homeOrAway === 'home');
      this.awayYellowCards = enrichedCards.filter(card => card.type === 'yellow' && card.homeOrAway === 'away');

      this.homeSecondYellowCards = enrichedCards.filter(card => card.type === 'second_yellow' && card.homeOrAway === 'home');
      this.awaySecondYellowCards = enrichedCards.filter(card => card.type === 'second_yellow' && card.homeOrAway === 'away');

      this.homeRedCards = enrichedCards.filter(card => card.type === 'red' && card.homeOrAway === 'home');
      this.awayRedCards = enrichedCards.filter(card => card.type === 'red' && card.homeOrAway === 'away');

      this.allGoals = enrichedGoals.sort((a, b) => a.minute - b.minute);

      this.allYellowCards = enrichedCards.filter(card => card.type === 'yellow').sort((a, b) => a.minute - b.minute);
      this.allSecondYellowCards = enrichedCards.filter(card => card.type === 'second_yellow').sort((a, b) => a.minute - b.minute);
      this.allRedCards = enrichedCards.filter(card => card.type === 'red').sort((a, b) => a.minute - b.minute);

      const goalsWithType = enrichedGoals.map(goal => ({
        ...goal,
        type: 'goal'
      }));

      const allEvents = [...goalsWithType, ...enrichedCards];
      this.allEvents = allEvents.sort((a, b) => a.minute - b.minute);

      this.firstHalfEvents = this.allEvents.filter((event: any) => event.minute <= 45);
      this.secondHalfEvents = this.allEvents.filter((event: any) => event.minute > 45);

    } catch (error) {
      console.error('Chyba při načítání gólů a karet:', error);
    }
    finally {
      this.isLoadingEvents = false;
    }
  }

  onItemClick(event: Event, item: any, type: 'league' | 'team' | 'player') {
    this.appService.onItemClick(event, item, type);
  }

  getPositionShort(pos: string): string {
    return pos === 'goalkeeper' ? 'B' :
      pos === 'defender' ? 'O' :
        pos === 'midfielder' ? 'Z' :
          pos === 'attacker' ? 'Ú' : 'N';
  }

  getIconNameByPosition(position: string | null): string {
    switch (position) {
      case 'goalkeeper':
        return 'hand-right';
      case 'defender':
        return 'shirt';
      case 'midfielder':
        return 'shirt';
      case 'attacker':
        return 'shirt';
      default:
        return 'help-circle-outline';
    }
  }

  calculatePositionCounts() {
    this.positionCounts = {
      goalkeeper: 0,
      defender: 0,
      midfielder: 0,
      attacker: 0,
      other: 0
    };

    const allPlayers = [
      ...this.homeStarters,
      ...this.homeBench,
      ...this.awayStarters,
      ...this.awayBench
    ];

    allPlayers.forEach(player => {
      const pos = player.position;
      switch (pos) {
        case 'goalkeeper':
          this.positionCounts.goalkeeper++;
          break;
        case 'defender':
          this.positionCounts.defender++;
          break;
        case 'midfielder':
          this.positionCounts.midfielder++;
          break;
        case 'attacker':
          this.positionCounts.attacker++;
          break;
        default:
          this.positionCounts.other++;
          break;
      }
    });
  }

  async loadTable(leagueId: number) {
    try {
      this.isLoadingTable = true;
      this.leagueTable = await this.loadLeagueTable(leagueId);
    } catch (error) {
      console.error('Chyba při načítání tabulky ligy:', error);
    } finally {
      this.isLoadingTable = false;
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
