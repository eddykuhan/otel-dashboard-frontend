import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex font-display">
      <!-- Sidebar Navigation -->
      <aside class="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0 bg-white dark:bg-[#0b1219]">
        <div class="p-6 flex items-center gap-3">
          <div class="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <span class="material-symbols-outlined">hub</span>
          </div>
          <div>
            <h1 class="text-base font-bold leading-none">Aspire</h1>
            <p class="text-xs text-slate-500 dark:text-[#92adc9] mt-1">Distributed Dashboard</p>
          </div>
        </div>
        <nav class="flex-1 px-3 space-y-1 mt-4">
          <!-- Resources link removed -->
          <a routerLink="/logs" routerLinkActive="bg-primary text-white"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors group">
             <span class="material-symbols-outlined" routerLinkActive="fill-icon">list_alt</span>
            <span class="text-sm font-medium">Logs</span>
          </a>
          <a routerLink="/traces" routerLinkActive="bg-primary text-white"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors group">
             <span class="material-symbols-outlined" routerLinkActive="fill-icon">account_tree</span>
            <span class="text-sm font-medium">Traces</span>
          </a>
          <a routerLink="/metrics" routerLinkActive="bg-primary text-white"
             class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#233648] transition-colors group">
             <span class="material-symbols-outlined" routerLinkActive="fill-icon">monitoring</span>
            <span class="text-sm font-medium">Metrics</span>
          </a>
        </nav>
        <div class="p-4 border-t border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-3 p-2">
            <div class="size-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
               <!-- Placeholder avatar since external images might break or be slow -->
               <div class="w-full h-full bg-slate-500 flex items-center justify-center text-white text-xs">DE</div>
            </div>
            <div class="flex-1 overflow-hidden">
              <p class="text-xs font-medium truncate">Dev Environment</p>
              <p class="text-[10px] text-slate-500 dark:text-[#92adc9]">v8.0.2</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AppComponent {
  title = 'OTEL Dashboard';
}
