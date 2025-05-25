import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class TabsService {
    private activeTabSubject = new BehaviorSubject<'league' | 'team' | 'player'>('team');

    activeTab$ = this.activeTabSubject.asObservable();
    constructor() { }
    setActiveTab(tab: 'league' | 'team' | 'player') {
        this.activeTabSubject.next(tab);
    }

    getActiveTab(): 'league' | 'team' | 'player' {
        return this.activeTabSubject.value;
    }

    async setUnactiveTab(activeTab: 'league' | 'team' | 'player' = 'team') {
        let otherTabs: { firstTab: 'league' | 'team' | 'player', secondTab: 'league' | 'team' | 'player' } = { firstTab: 'league', secondTab: 'player' };
        if (activeTab === 'league') {
            otherTabs = { firstTab: 'team', secondTab: 'player' };
        }
        else if (activeTab === 'team') {
            otherTabs = { firstTab: 'league', secondTab: 'player' };
        }
        else {
            otherTabs = { firstTab: 'team', secondTab: 'league' };
        }
        return otherTabs;
    }

}