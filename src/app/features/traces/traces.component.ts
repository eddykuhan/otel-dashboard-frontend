import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { TraceSpan, SpanKind } from '../../core/models/otel.models';

@Component({
  selector: 'app-traces',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0b1016]">
      <!-- Header Section -->
      <header class="flex flex-col border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101922]/50">
        <div class="px-8 pt-6 pb-2">
          <div class="flex items-center gap-2">
            <a class="text-slate-500 dark:text-[#9393c8] text-sm font-medium hover:text-primary transition-colors" href="#">Home</a>
            <span class="text-slate-400 dark:text-[#9393c8] text-sm font-medium">/</span>
            <span class="text-slate-900 dark:text-white text-sm font-medium">Traces</span>
          </div>
        </div>
        <div class="px-8 pb-6 flex flex-wrap justify-between items-end gap-3">
          <div class="flex flex-col gap-1">
            <h1 class="text-slate-900 dark:text-white text-3xl font-black leading-tight tracking-tight">Traces</h1>
            <p class="text-slate-500 dark:text-[#9393c8] text-sm font-normal">Monitor and diagnose distributed traces across services.</p>
          </div>
          <div class="flex gap-2">
            <button (click)="refreshTraces()" class="flex items-center gap-2 rounded-lg h-10 px-4 bg-slate-200 dark:bg-[#242447] text-slate-700 dark:text-white text-sm font-bold hover:opacity-90 transition-opacity">
              <span class="material-symbols-outlined text-xl">refresh</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Content Area -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Trace List -->
        <div class="flex-1 overflow-auto custom-scrollbar bg-white dark:bg-[#101922]">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead class="sticky top-0 bg-slate-50 dark:bg-[#1a1a2e] border-b border-slate-200 dark:border-slate-800 z-10">
              <tr>
                <th class="px-8 py-3 text-xs font-bold text-slate-500 dark:text-[#9393c8] uppercase tracking-wider w-1/3">Name / Service</th>
                <th class="px-4 py-3 text-xs font-bold text-slate-500 dark:text-[#9393c8] uppercase tracking-wider">Start Time</th>
                <th class="px-4 py-3 text-xs font-bold text-slate-500 dark:text-[#9393c8] uppercase tracking-wider">Duration</th>
                <th class="px-8 py-3 text-xs font-bold text-slate-500 dark:text-[#9393c8] uppercase tracking-wider w-1/4">Timeline</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              @for (trace of traces; track trace.traceId) {
                <tr class="hover:bg-slate-50 dark:hover:bg-[#1a1a35] cursor-pointer group transition-colors"
                  [class.bg-primary-50]="selectedTrace?.traceId === trace.traceId"
                  [class.dark:bg-slate-800]="selectedTrace?.traceId === trace.traceId"
                  (click)="selectTrace(trace)">
                  <td class="px-8 py-4">
                    <div class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-primary text-xl">expand_more</span>
                      <div class="flex flex-col">
                        <span class="text-sm font-bold text-slate-900 dark:text-white">{{ trace.operationName }}</span>
                        <div class="flex gap-2">
                           <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary dark:text-blue-400 uppercase w-fit mt-1">{{ trace.serviceName }}</span>
                           <span class="text-[10px] font-mono text-slate-400 mt-1">{{ trace.traceId.substring(0, 8) }}...</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-xs font-medium text-slate-500 dark:text-[#9393c8]">{{ trace.startTime | date:'HH:mm:ss.SSS' }}</td>
                  <td class="px-4 py-4 text-sm font-bold text-slate-900 dark:text-white">{{ trace.durationMs }}ms</td>
                  <td class="px-8 py-4">
                    <div class="relative w-full h-2 bg-slate-200 dark:bg-[#242447] rounded-full overflow-hidden">
                      <div class="absolute top-0 left-0 h-full bg-primary rounded-full" [style.width.%]="getDurationPercentage(trace.durationMs)"></div>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Trace Details Panel (Waterfall) -->
        <aside *ngIf="selectedTrace" class="w-[600px] border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b1016] flex flex-col shadow-xl z-20">
          <div class="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#16162a]">
             <div>
               <h3 class="font-bold text-slate-900 dark:text-white">Trace Details</h3>
               <p class="text-xs text-slate-500 font-mono">{{ selectedTrace.traceId }}</p>
             </div>
             <button (click)="selectedTrace = null" class="text-slate-400 hover:text-primary transition-colors">
               <span class="material-symbols-outlined">close</span>
             </button>
          </div>

          <div class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
             <div *ngIf="loadingDetails" class="flex justify-center py-8">
               <span class="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
             </div>

             <div *ngIf="!loadingDetails && traceSpans.length > 0" class="space-y-6">
                <!-- Timeline Header -->
                <div class="flex justify-between text-xs text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2">
                   <span>Span / Service</span>
                   <span>Duration</span>
                </div>

                <!-- Timeline with Markers -->
                <div class="relative mb-4 h-8">
                  <div class="flex relative h-8">
                    @for (marker of getTimelineMarkers(); track $index) {
                      <div class="absolute text-[10px] text-slate-400 -translate-x-1/2 top-0" [style.left.%]="(marker / selectedTrace!.durationMs) * 100">
                        {{ marker | number:'1.0-0' }}ms
                      </div>
                      <div class="absolute top-4 bottom-0 w-px bg-slate-300 dark:bg-slate-600" [style.left.%]="(marker / selectedTrace!.durationMs) * 100"></div>
                    }
                  </div>
                </div>

                <!-- Spans List (Waterfall) -->
                <div class="space-y-1 relative">
                  <!-- Vertical Guide Line -->
                  <div class="absolute left-[200px] top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800 z-0"></div>

                  @for (span of spanTree; track span.spanId) {
                    <div class="relative z-10 group">
                      <div class="flex items-center justify-between py-2 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                           (click)="selectedSpanId = (selectedSpanId === span.spanId ? null : span.spanId)">
                        
                        <!-- Span Info -->
                        <div class="w-[200px] shrink-0 pr-4 flex items-center" [style.padding-left.px]="getDepth(span) * 20">
                          @if (getDepth(span) > 0) {
                            <div class="w-px h-6 bg-slate-300 dark:bg-slate-700 mr-2 -ml-2"></div>
                          }
                          <button *ngIf="hasChildren(span.spanId)" (click)="toggleExpand(span.spanId); $event.stopPropagation()" class="mr-1">
                            <span class="material-symbols-outlined text-sm text-slate-400" [class.rotate-90]="expandedSpans.has(span.spanId)">expand_more</span>
                          </button>
                          <div class="w-1.5 h-1.5 rounded-full mr-2"
                               [class.bg-emerald-500]="span.kind === SpanKind.Client" 
                               [class.bg-blue-500]="span.kind === SpanKind.Server || span.kind === SpanKind.Internal" 
                               [class.bg-amber-500]="span.kind === SpanKind.Producer || span.kind === SpanKind.Consumer"></div>
                          <div class="flex flex-col truncate">
                            <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block" [title]="span.operationName">
                              {{ span.operationName }}
                            </span>
                            <span class="text-[10px] text-slate-500">{{ span.serviceName }}</span>
                          </div>
                        </div>

                        <!-- Gantt Bar -->
                        <div class="flex-1 relative h-6 bg-slate-100 dark:bg-[#1a1a2e] rounded overflow-hidden mx-2">
                           <div class="absolute h-4 top-1 rounded-full min-w-[2px] shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                [ngClass]="getSpanColor(span)"
                                [title]="span.operationName + ' (' + span.durationMs + 'ms)'"
                                [style.left.%]="getSpanOffset(span)"
                                [style.width.%]="getSpanWidth(span)">
                           </div>
                        </div>

                        <!-- Duration Label -->
                        <div class="w-16 text-right text-xs font-mono text-slate-600 dark:text-slate-400">
                           {{ span.durationMs }}ms
                        </div>
                      </div>

                      <!-- Attributes (Expandable) -->
                      <div *ngIf="selectedSpanId === span.spanId" class="pl-[200px] pr-2 pb-2" [style.padding-left.px]="200 + getDepth(span) * 20">
                        <div class="bg-slate-50 dark:bg-[#1a1a2e] p-3 rounded text-xs border border-slate-200 dark:border-slate-700">
                           <p class="font-bold mb-2 text-slate-500 uppercase tracking-wider">Attributes</p>
                           <div class="grid grid-cols-1 gap-1">
                             <div *ngFor="let key of getKeys(span.attributes)" class="flex gap-2">
                               <span class="text-slate-400 font-medium">{{ key }}:</span>
                               <span class="text-slate-700 dark:text-slate-300 font-mono break-all">{{ span.attributes[key] }}</span>
                             </div>
                           </div>
                           <div class="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex gap-4">
                              <span>Start: <span class="font-mono text-slate-500">{{ span.startTime | date:'HH:mm:ss.SSS' }}</span></span>
                              <span>End: <span class="font-mono text-slate-500">{{ span.endTime | date:'HH:mm:ss.SSS' }}</span></span>
                              <span>Duration: <span class="font-mono text-slate-500">{{ span.durationMs }}ms</span></span>
                           </div>
                           <div class="flex gap-4">
                              <span>Trace ID: <span class="font-mono text-slate-500">{{ span.traceId }}</span></span>
                              <span>Span ID: <span class="font-mono text-slate-500">{{ span.spanId }}</span></span>
                           </div>
                        </div>
                      </div>
                    </div>
                  }
                </div>
                
                <div class="mt-6 flex gap-4 justify-center text-[10px] text-slate-500">
                   <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-500"></span> Server</div>
                   <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Client (HTTP/DB)</div>
                   <div class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Producer</div>
                </div>
             </div>
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #2e2e4d; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .rotate-90 { transform: rotate(90deg); }
  `]
})
export class TracesComponent implements OnInit {
  traces: TraceSpan[] = [];
  selectedTrace: TraceSpan | null = null;
  traceSpans: TraceSpan[] = [];
  loadingDetails = false;
  selectedSpanId: string | null = null;
  maxDuration = 1000;
  expandedSpans: Set<string> = new Set();
  spanTree: TraceSpan[] = [];
  protected readonly SpanKind = SpanKind;

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.refreshTraces();
  }

  refreshTraces(): void {
    this.apiService.getTraces({ limit: 50 }).subscribe({
      next: (traces) => {
        // Map trace wrapper to rootSpan
        this.traces = traces.map(t => t.rootSpan);
        this.maxDuration = Math.max(...this.traces.map(t => t.durationMs), 100);
      },
      error: (err) => console.error('Failed to load traces:', err)
    });
  }

  selectTrace(trace: TraceSpan): void {
    if (this.selectedTrace?.traceId === trace.traceId) return;

    this.selectedTrace = trace;
    this.loadingDetails = true;
    this.traceSpans = [];
    this.expandedSpans.clear();

    this.apiService.getTrace(trace.traceId).subscribe({
      next: (details) => {
        // Sort spans by start time for waterfall
        this.traceSpans = details.spans.sort((a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
        this.buildSpanTree();
        this.loadingDetails = false;
      },
      error: (err) => {
        console.error('Failed to load trace details:', err);
        this.loadingDetails = false;
      }
    });
  }

  private buildSpanTree(): void {
    const spanMap = new Map<string, TraceSpan>();
    const childrenMap = new Map<string, TraceSpan[]>();

    this.traceSpans.forEach(span => {
      spanMap.set(span.spanId, span);
      if (!childrenMap.has(span.parentSpanId || '')) {
        childrenMap.set(span.parentSpanId || '', []);
      }
      childrenMap.get(span.parentSpanId || '')!.push(span);
    });

    const buildTree = (parentId: string, depth: number = 0): TraceSpan[] => {
      const children = childrenMap.get(parentId) || [];
      const result: TraceSpan[] = [];
      children.forEach(child => {
        (child as any).depth = depth;
        result.push(child);
        if (this.expandedSpans.has(child.spanId)) {
          result.push(...buildTree(child.spanId, depth + 1));
        }
      });
      return result;
    };

    this.spanTree = buildTree('');
  }

  toggleExpand(spanId: string): void {
    if (this.expandedSpans.has(spanId)) {
      this.expandedSpans.delete(spanId);
    } else {
      this.expandedSpans.add(spanId);
    }
    this.buildSpanTree();
  }

  getTimelineMarkers(): number[] {
    const markers: number[] = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      markers.push((this.selectedTrace!.durationMs / steps) * i);
    }
    return markers;
  }

  getDurationPercentage(duration: number): number {
    return Math.min((duration / this.maxDuration) * 100, 100);
  }

  getSpanOffset(span: TraceSpan): number {
    if (!this.selectedTrace) return 0;
    const rootStart = new Date(this.selectedTrace.startTime).getTime();
    const spanStart = new Date(span.startTime).getTime();
    const offsetMs = spanStart - rootStart;
    return Math.max(0, Math.min((offsetMs / this.selectedTrace.durationMs) * 100, 99));
  }

  getSpanWidth(span: TraceSpan): number {
    if (!this.selectedTrace) return 0;
    const width = (span.durationMs / this.selectedTrace.durationMs) * 100;
    return Math.max(0.5, Math.min(width, 100)); // Min 0.5% width to be visible
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  hasChildren(spanId: string): boolean {
    return this.traceSpans.some(span => span.parentSpanId === spanId);
  }

  getSpanColor(span: TraceSpan): string {
    switch (span.kind) {
      case SpanKind.Client:
        return 'bg-emerald-500';
      case SpanKind.Server:
      case SpanKind.Internal:
        return 'bg-blue-500';
      case SpanKind.Producer:
      case SpanKind.Consumer:
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  }

  getDepth(span: TraceSpan): number {
    return (span as any).depth || 0;
  }
}
