import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class PlayerRepository {
    async getPlayers() {
    const { data, error } = await supabase.from('players').select('*');
    if (error) {
      console.error('Chyba při načítání hráčů:', error.message);
      return [];
    }
    return data || [];
  }

  async getPlayersWithOffset(searchQuery: string, page: number, itemsPerPage: number) {
    const offset = page * itemsPerPage;
    let query;

    if (searchQuery.includes(' ')) {
      const [firstPart, ...rest] = searchQuery.split(' ');
      const secondPart = rest.join(' ');

      query = supabase
        .from('players')
        .select('*')
        .ilike('first_name', `%${firstPart}%`)
        .ilike('second_name', `%${secondPart}%`);
    } else {

      query = supabase
        .from('players')
        .select('*')
        .or(`first_name.ilike.%${searchQuery}%,second_name.ilike.%${searchQuery}%`);
    }

    const { data, error } = await query.range(offset, offset + itemsPerPage - 1);

    if (error) {
      console.error('Chyba při načítání hráčů:', error.message);
      return [];
    }

    return data || [];
  }

  async getPlayerById(playerId: string) {
    const { data, error } = await supabase.from('players').select('*').eq('id', playerId).single();
    if (error) {
      console.error(`Chyba při načítání hráče s ID ${playerId}:`, error.message);
      return null;
    }
    return data || null;
  }

  async getPlayersByTeamId(teamId: string) {
    const { data, error } = await supabase.from('players').select('*').eq('team_id', teamId);
    if (error) {
      console.error(`Chyba při načítání hráčů:`, error.message);
      return [];
    }
    return data || [];
  }

  async getPlayersByGameId(gameId: string) {
    const { data, error } = await supabase
      .from('game_players')
      .select('*')
      .eq('game_id', gameId);

    if (error) {
      console.error('Chyba při načítání hráčů:', error.message);
      return [];
    }

    return data;
  }
}