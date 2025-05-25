import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class NavigationService {
    constructor(private router: Router) { }

    goToGameDetail(gameId: string) {
        this.router.navigate(['/game', gameId]);
    }

    goToItem(event: Event, item: any, type: 'league' | 'team' | 'player') {
    const clickedElement = event.target as HTMLElement;

    if (clickedElement.tagName === 'ION-BUTTON') {
      event.preventDefault();
    } else {
      this.router.navigate([`../../${type}`, item.id]);
    }
  }

}