import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  isReady = false;

  constructor(private router: Router) { }

  async ngOnInit() {
    const wasRedirected = sessionStorage.getItem('wasRedirected');
    const preferredTab = localStorage.getItem('preferredTab') || 'team';

    if (!wasRedirected) {
    sessionStorage.setItem('wasRedirected', 'true');
    await this.router.navigate([`/tabs/${preferredTab}`]);
    }

    this.isReady = true;
  }

}
