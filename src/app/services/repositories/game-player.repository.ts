import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class GamePlayerRepository {
    async getGamePlayersByPlayerId(playerId: string) {
    const { data, error } = await supabase.from('game_players').select('*').eq('player_id', playerId);
    if (error) {
      console.error(`Chyba při načítání zápasu:`, error.message);
      return [];
    }
    return data || [];
  }
}