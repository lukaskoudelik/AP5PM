import { Injectable } from '@angular/core';
import { supabase } from '../supabase-client';

@Injectable({ providedIn: 'root' })
export class OrganizationRepository {
      async getOrganizations() {
    const { data, error } = await supabase.from('organization').select('*');
    if (error) {
      console.error('Chyba při načítání organizací:', error.message);
      return [];
    }
    return data || [];
  }

  async getOrganizationById(organizationId: string) {
    const { data, error } = await supabase.from('organization').select('*').eq('id', organizationId).single();
    if (error) {
      console.error(`Chyba při načítání organizace s ID ${organizationId}:`, error.message);
      return null;
    }
    return data || null;
  }
}