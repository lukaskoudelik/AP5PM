import { DistrictRepository } from "../repositories/district.repository";
import { OrganizationRepository } from "../repositories/organization.repository";
import { RegionRepository } from "../repositories/region.repository";
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class OrganizationService {
    constructor(private organizationRepo: OrganizationRepository, private districtRepo: DistrictRepository, private regionRepo: RegionRepository) { }

    async loadOrganizationForLeague(orgId: number) {
        try {
            const orgData = await this.organizationRepo.getOrganizationById(`${orgId}`);
            return orgData;
        } catch (error) {
            console.error('Chyba při načítání organizací.', error);
        }
    }

    async loadOrganizations(){
        return this.organizationRepo.getOrganizations()
    }

    async loadDistricts(){
        return this.districtRepo.getDistricts()
    }

    async loadRegions(){
        return this.regionRepo.getRegions()
    }
}