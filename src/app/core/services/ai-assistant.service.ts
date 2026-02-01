import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay } from 'rxjs';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  context?: AIContext;
}

export interface AIContext {
  type: 'log' | 'trace' | 'span' | 'metric' | 'general';
  data: any;
  title: string;
}

export interface AIState {
  isOpen: boolean;
  messages: AIMessage[];
  currentContext: AIContext | null;
}

@Injectable({
  providedIn: 'root'
})
export class AIAssistantService {
  private state: AIState = {
    isOpen: false,
    messages: [],
    currentContext: null
  };

  private stateSubject = new BehaviorSubject<AIState>(this.state);
  state$: Observable<AIState> = this.stateSubject.asObservable();

  open(context?: AIContext): void {
    this.state = {
      ...this.state,
      isOpen: true,
      currentContext: context || null
    };
    
    if (context) {
      // Clear previous messages when new context is provided
      this.state.messages = [];
      this.stateSubject.next(this.state);
      
      // Auto-generate initial analysis
      this.analyzeContext(context);
    } else {
      this.stateSubject.next(this.state);
    }
  }

  close(): void {
    this.state = { ...this.state, isOpen: false };
    this.stateSubject.next(this.state);
  }

  toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  clearMessages(): void {
    this.state = { ...this.state, messages: [], currentContext: null };
    this.stateSubject.next(this.state);
  }

  sendMessage(content: string): void {
    // Add user message
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    this.state.messages = [...this.state.messages, userMessage];
    this.stateSubject.next(this.state);
    
    // Add loading message
    const loadingMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    
    this.state.messages = [...this.state.messages, loadingMessage];
    this.stateSubject.next(this.state);
    
    // Simulate AI response (replace with real API call later)
    setTimeout(() => {
      const response = this.generateMockResponse(content, this.state.currentContext);
      
      // Remove loading message and add actual response
      this.state.messages = this.state.messages.filter(m => !m.isLoading);
      
      const assistantMessage: AIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      this.state.messages = [...this.state.messages, assistantMessage];
      this.stateSubject.next(this.state);
    }, 1500);
  }

  explainLog(log: any): void {
    const context: AIContext = {
      type: 'log',
      data: log,
      title: `Explain ${log.level} Log`
    };
    this.open(context);
  }

  explainTrace(trace: any): void {
    const context: AIContext = {
      type: 'trace',
      data: trace,
      title: 'Analyze Trace'
    };
    this.open(context);
  }

  explainSpan(span: any, trace?: any): void {
    const context: AIContext = {
      type: 'span',
      data: { span, trace },
      title: span.status === 2 ? 'Explain Error' : 'Analyze Span'
    };
    this.open(context);
  }

  private analyzeContext(context: AIContext): void {
    // Add loading message
    const loadingMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
      context
    };
    
    this.state.messages = [loadingMessage];
    this.stateSubject.next(this.state);
    
    // Simulate AI analysis
    setTimeout(() => {
      const analysis = this.generateContextAnalysis(context);
      
      this.state.messages = [{
        id: crypto.randomUUID(),
        role: 'assistant',
        content: analysis,
        timestamp: new Date(),
        context
      }];
      this.stateSubject.next(this.state);
    }, 2000);
  }

  private generateContextAnalysis(context: AIContext): string {
    switch (context.type) {
      case 'log':
        return this.generateLogAnalysis(context.data);
      case 'trace':
        return this.generateTraceAnalysis(context.data);
      case 'span':
        return this.generateSpanAnalysis(context.data);
      default:
        return 'I can help you understand your telemetry data. What would you like to know?';
    }
  }

  private generateLogAnalysis(log: any): string {
    const level = log.level || log.severityText || 'Unknown';
    const message = log.message || log.body || '';
    const service = log.serviceName || 'Unknown service';
    
    if (level === 'Error' || level === 'Fatal') {
      return `## Error Analysis

**Service:** ${service}
**Severity:** ${level}

### What happened
${message}

### Likely Causes
1. **Configuration Issue** - Check if all required environment variables are set
2. **Network Connectivity** - Verify the service can reach its dependencies
3. **Resource Exhaustion** - Check memory and CPU usage on the host

### Recommended Actions
1. Check the service logs for stack traces
2. Verify database/external service connectivity
3. Review recent deployments for breaking changes
4. Check resource utilization metrics

### Related Documentation
- [Troubleshooting Guide](#)
- [Service Dependencies](#)

*Would you like me to search for related errors or check correlated traces?*`;
    }
    
    return `## Log Entry Analysis

**Service:** ${service}
**Level:** ${level}

### Summary
This log entry indicates: ${message}

### Context
This appears to be a ${level.toLowerCase()} level message from the ${service} service. 

### What to look for
- Check if this pattern repeats frequently
- Look for correlated trace IDs to understand the request context
- Review surrounding log entries for additional context

*Is there anything specific about this log you'd like me to explain?*`;
  }

  private generateTraceAnalysis(trace: any): string {
    const hasError = trace.hasError || trace.status === 2;
    const duration = trace.durationMs || 0;
    const spanCount = trace.spanCount || 0;
    const endpoint = trace.endpoint || trace.operationName || 'Unknown endpoint';
    
    if (hasError) {
      return `## Trace Failure Analysis

**Endpoint:** ${endpoint}
**Duration:** ${duration}ms
**Total Spans:** ${spanCount}

### Root Cause Analysis
This trace failed due to an error in one of the downstream operations. 

### Error Timeline
1. Request received at the entry point
2. Processing began normally
3. ❌ Error occurred during execution
4. Request terminated with error response

### Recommendations
1. **Expand the trace** to identify which specific span failed
2. **Check the error span** for exception details and stack trace
3. **Review dependencies** - the failure may be caused by a downstream service
4. **Check recent changes** - was there a recent deployment?

### Questions to Consider
- Is this a recurring error or a one-time failure?
- Are other requests to this endpoint also failing?
- What changed recently in the affected service?

*Click on individual spans to get detailed analysis of each operation.*`;
    }
    
    const isSlowRequest = duration > 1000;
    
    if (isSlowRequest) {
      return `## Slow Trace Analysis

**Endpoint:** ${endpoint}
**Duration:** ${duration}ms ⚠️ (above threshold)
**Total Spans:** ${spanCount}

### Performance Analysis
This request took longer than expected. Here's the breakdown:

### Potential Bottlenecks
1. **Database Queries** - Check for N+1 queries or missing indexes
2. **External API Calls** - Network latency to third-party services
3. **Serialization** - Large payloads being processed
4. **Resource Contention** - Locks or connection pool exhaustion

### Recommendations
1. **Review the waterfall** - Identify which spans took the most time
2. **Check database spans** - Look for slow queries
3. **Analyze parallel vs sequential** - Could some operations run in parallel?
4. **Review caching** - Is cacheable data being fetched repeatedly?

*Expand the trace to see timing breakdown of each operation.*`;
    }
    
    return `## Trace Analysis

**Endpoint:** ${endpoint}
**Duration:** ${duration}ms ✓
**Total Spans:** ${spanCount}

### Summary
This trace completed successfully within normal parameters.

### Trace Flow
The request flowed through ${spanCount} operations across your services.

### Observations
- Response time is within acceptable range
- No errors detected in the trace
- All spans completed successfully

*Would you like me to analyze any specific span in detail?*`;
  }

  private generateSpanAnalysis(data: any): string {
    const span = data.span;
    const hasError = span.status === 2 || span.status === 'Error';
    const duration = span.durationMs || 0;
    const operation = span.operationName || span.name || 'Unknown operation';
    const service = span.serviceName || 'Unknown service';
    
    if (hasError) {
      return `## Span Error Analysis

**Operation:** ${operation}
**Service:** ${service}
**Duration:** ${duration}ms

### Error Details
This span encountered an error during execution.

### Possible Causes
1. **Exception Thrown** - An unhandled exception occurred
2. **Timeout** - The operation exceeded its time limit
3. **Invalid Input** - Bad data was passed to this operation
4. **Dependency Failure** - A required resource was unavailable

### Debugging Steps
1. Check the span attributes for error messages
2. Look at the parent span for request context
3. Check child spans for cascading failures
4. Review service logs around this timestamp

### Code Review Suggestions
- Add more detailed error handling
- Implement retry logic for transient failures
- Add circuit breakers for external dependencies

*Would you like me to find related logs for this timeframe?*`;
    }
    
    return `## Span Analysis

**Operation:** ${operation}
**Service:** ${service}
**Duration:** ${duration}ms

### What This Span Represents
This span tracks the "${operation}" operation in the ${service} service.

### Timing Analysis
- Duration: ${duration}ms
- ${duration < 100 ? '✓ Fast execution' : duration < 500 ? '⚡ Normal execution time' : '⚠️ Consider optimization'}

### Attributes
Review the span attributes panel for detailed metadata about this operation.

*What would you like to know about this span?*`;
  }

  private generateMockResponse(question: string, context: AIContext | null): string {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('why') && lowerQuestion.includes('slow')) {
      return `Based on my analysis, the slowness is likely caused by:

1. **Database queries** - I see several spans with high latency
2. **Sequential processing** - Operations that could run in parallel are running sequentially
3. **External API calls** - Network latency to downstream services

**Recommendation:** Start by optimizing the database queries and consider adding caching for frequently accessed data.`;
    }
    
    if (lowerQuestion.includes('fix') || lowerQuestion.includes('solve') || lowerQuestion.includes('resolve')) {
      return `Here are the recommended steps to fix this issue:

1. **Immediate:** Check if the issue is still occurring
2. **Short-term:** Add more detailed logging around the failure point
3. **Long-term:** Implement proper error handling and retry logic

Would you like me to provide code examples for any of these fixes?`;
    }
    
    if (lowerQuestion.includes('related') || lowerQuestion.includes('similar')) {
      return `I found several related patterns in your telemetry:

- **3 similar errors** in the last hour from the same service
- **Correlated trace** showing the same failure pattern
- **Metric anomaly** detected around the same time

Would you like me to analyze any of these in detail?`;
    }
    
    return `I understand you're asking about "${question}".

Based on the current context, here's what I can tell you:

${context ? `This relates to a ${context.type} from your telemetry data.` : 'I can help you analyze logs, traces, and metrics.'}

Could you provide more specific details about what you'd like to know? For example:
- What caused this error?
- Why is this request slow?
- Are there related issues?`;
  }
}
