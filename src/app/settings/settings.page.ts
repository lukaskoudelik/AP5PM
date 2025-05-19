import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false,
})
export class SettingsPage implements OnInit {
  isDarkMode!: boolean;
  preferredTab: string = 'team';

  constructor() {}

  ngOnInit() {
    const storedDarkMode = localStorage.getItem('darkMode');
    this.isDarkMode = storedDarkMode === 'true';

    document.documentElement.classList.toggle('ion-palette-dark', this.isDarkMode);

    document.documentElement.addEventListener('classChange', () => {
      this.isDarkMode = document.documentElement.classList.contains('ion-palette-dark');
    });

    const storedTab = localStorage.getItem('preferredTab');
    if (storedTab) {
      this.preferredTab = storedTab;
    }
  }

  toggleDarkMode(event: any) {
    const isChecked = event.detail.checked;
    this.updateDarkMode(isChecked);
  }

  private updateDarkMode(isDark: boolean) {
    document.documentElement.classList.toggle('ion-palette-dark', isDark);

    localStorage.setItem('darkMode', String(isDark));

    const event = new Event('classChange');
    document.documentElement.dispatchEvent(event);
  }

  savePreferredTab(tab: string) {
    localStorage.setItem('preferredTab', tab);
  }
}
