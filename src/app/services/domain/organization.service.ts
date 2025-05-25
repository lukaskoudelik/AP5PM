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
            console.error('Error loading organization:', error);
        }
    }

    async getOrganizations(){
        return this.organizationRepo.getOrganizations()
    }

    async getDistricts(){
        return this.districtRepo.getDistricts()
    }

    async getRegions(){
        return this.regionRepo.getRegions()
    }
}