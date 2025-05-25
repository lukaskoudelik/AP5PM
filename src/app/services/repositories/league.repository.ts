import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class LeagueRepository {
    async getLeagues() {
        const { data, error } = await supabase.from('leagues').select('*');
        if (error) {
            console.error('Chyba při načítání lig:', error.message);
            return [];
        }
        return data || [];
    }

    async getLeaguesWithOffset(searchQuery: string, page: number, itemsPerPage: number) {
        const offset = page * itemsPerPage;
        const { data, error } = await supabase
            .from('leagues')
            .select('*')
            .ilike('name', `%${searchQuery}%`)
            .range(offset, offset + itemsPerPage - 1);

        if (error) {
            console.error('Chyba při načítání lig:', error.message);
            return [];
        }
        return data || [];
    }

    async getLeagueById(leagueId: string) {
        const { data, error } = await supabase.from('leagues').select('*').eq('id', leagueId).single();
        if (error) {
            console.error(`Chyba při načítání ligy s ID ${leagueId}:`, error.message);
            return null;
        }
        return data || null;
    }

    async getLeaguesByOrganization(organizationId: string) {
        const { data, error } = await supabase.from('leagues').select('*').eq('organization_id', organizationId);
        if (error) {
            console.error(`Chyba při načítání lig:`, error.message);
            return [];
        }
        return data || [];
    }

    async getLeaguesByRegion(regionId: string) {
        const { data, error } = await supabase.from('leagues').select('*').eq('region_id', regionId);
        if (error) {
            console.error(`Chyba při načítání lig:`, error.message);
            return [];
        }
        return data || [];
    }

    async getLeaguesByDistrict(districtId: string) {
        const { data, error } = await supabase.from('leagues').select('*').eq('district_id', districtId);
        if (error) {
            console.error(`Chyba při načítání lig:`, error.message);
            return [];
        }
        return data || [];
    }
}