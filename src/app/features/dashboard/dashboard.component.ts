import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { HealthStats } from '../../core/models/otel.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top Navigation Bar -->
    <header class="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101922] flex items-center justify-between px-8 sticky top-0 z-10">
      <div class="flex items-center gap-4">
        <h2 class="text-lg font-semibold tracking-tight">Resources</h2>
      </div>
      <div class="flex items-center gap-4 flex-1 max-w-2xl justify-end">
        <div class="relative w-full max-w-md">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            class="w-full bg-slate-100 dark:bg-[#233648] border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary placeholder:text-slate-500 dark:placeholder-[#92adc9] text-slate-900 dark:text-slate-100"
            placeholder="Search resources..." type="text" />
        </div>
        <button class="p-2 text-slate-500 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#233648] rounded-lg transition-colors">
          <span class="material-symbols-outlined">help</span>
        </button>
        <button class="p-2 text-slate-500 dark:text-[#92adc9] hover:bg-slate-100 dark:hover:bg-[#233648] rounded-lg transition-colors">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>

    <!-- Content Container -->
    <div class="p-8 max-w-[1400px] w-full mx-auto space-y-6">
      <!-- Filters & Search Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="relative w-full sm:w-80">
          <div class="flex w-full items-stretch rounded-lg h-10 border border-slate-200 dark:border-[#324d67] bg-white dark:bg-[#111a22]">
            <div class="text-[#92adc9] flex items-center justify-center pl-3">
              <span class="material-symbols-outlined text-xl">filter_list</span>
            </div>
            <input
              class="w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-400 dark:placeholder-[#92adc9] px-3 text-slate-900 dark:text-slate-100"
              placeholder="Filter resources..." value="" />
          </div>
        </div>
        <p class="text-slate-500 dark:text-[#92adc9] text-sm font-normal">Showing components</p>
      </div>

      <!-- Table Section -->
      <div class="bg-white dark:bg-[#111a22] rounded-xl border border-slate-200 dark:border-[#324d67] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-[#192633] border-b border-slate-200 dark:border-[#324d67]">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Type</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Name</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">State</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Source</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">Endpoints</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300 text-right">Logs</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-[#324d67]">
              <!-- Mock Row 1 -->
              <tr class="hover:bg-slate-50 dark:hover:bg-[#16232f] transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-xl">layers</span>
                    <span class="text-sm">Project</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm font-medium">otel-dashboard-api</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Running
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-slate-500 dark:text-[#92adc9] font-mono">dotnet run</td>
                <td class="px-6 py-4 text-sm">
                  <a class="text-primary hover:underline font-medium" href="#">localhost:5003</a>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="text-slate-400 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">segment</span>
                  </button>
                </td>
              </tr>
              
              <!-- Mock Row 2 -->
              <tr class="hover:bg-slate-50 dark:hover:bg-[#16232f] transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-xl">layers</span>
                    <span class="text-sm">Project</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm font-medium">otel-dashboard-frontend</td>
                <td class="px-6 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Running
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-slate-500 dark:text-[#92adc9] font-mono">npm start</td>
                <td class="px-6 py-4 text-sm">
                  <a class="text-primary hover:underline font-medium" href="#">localhost:4200</a>
                </td>
                <td class="px-6 py-4 text-right">
                  <button class="text-slate-400 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">segment</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Cards (mapped to stats) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-[#111a22] border border-slate-200 dark:border-[#324d67] p-5 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-slate-500 dark:text-[#92adc9] font-medium uppercase">Total Logs</span>
            <span class="material-symbols-outlined text-primary">segment</span>
          </div>
          <div class="text-2xl font-bold">{{ stats?.stats?.logs || 0 }}</div>
           <div class="mt-2 text-xs text-emerald-500 flex items-center gap-1">
             <span class="material-symbols-outlined text-sm">trending_up</span>
             <span>Live Updates</span>
           </div>
        </div>
        <div class="bg-white dark:bg-[#111a22] border border-slate-200 dark:border-[#324d67] p-5 rounded-xl">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-slate-500 dark:text-[#92adc9] font-medium uppercase">Active Traces</span>
            <span class="material-symbols-outlined text-orange-400">account_tree</span>
          </div>
          <div class="text-2xl font-bold">{{ stats?.stats?.traces || 0 }}</div>
          <div class="mt-2 text-xs text-emerald-500 flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">check_circle</span>
            <span>Monitoring</span>
          </div>
        </div>
        <div class="bg-white dark:bg-[#111a22] border border-slate-200 dark:border-[#324d67] p-5 rounded-xl">
          <div class="flex items-center justify-between mb-2">
             <span class="text-xs text-slate-500 dark:text-[#92adc9] font-medium uppercase">Metrics Count</span>
             <span class="material-symbols-outlined text-indigo-400">monitoring</span>
          </div>
          <div class="text-2xl font-bold">{{ stats?.stats?.metrics || 0 }}</div>
          <div class="mt-2 w-full bg-slate-100 dark:bg-[#233648] h-1.5 rounded-full overflow-hidden">
            <div class="bg-primary h-full w-[100%]"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: HealthStats | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadStats();
    setInterval(() => this.loadStats(), 5000);
  }

  private loadStats(): void {
    this.apiService.getHealth().subscribe({
      next: (stats) => this.stats = stats,
      error: (err) => console.error('Failed to load health stats:', err)
    });
  }
}
