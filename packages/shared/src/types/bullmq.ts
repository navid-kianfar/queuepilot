import { JobState } from '../enums';

export interface BullQueue {
  name: string;
  prefix: string;
  isPaused: boolean;
  jobCounts: Record<JobState, number>;
  totalJobs: number;
  workerCount: number;
  completedRate: number;
  failedRate: number;
}

export interface BullJob {
  id: string;
  name: string;
  data: unknown;
  opts: BullJobOptions;
  progress: number | object;
  returnvalue: unknown;
  stacktrace: string[];
  attemptsMade: number;
  delay: number;
  timestamp: number;
  finishedOn?: number;
  processedOn?: number;
  failedReason?: string;
  state: JobState;
  parentKey?: string;
}

export interface BullJobOptions {
  attempts?: number;
  backoff?: number | { type: string; delay: number };
  delay?: number;
  lifo?: boolean;
  priority?: number;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
  repeat?: {
    pattern?: string;
    every?: number;
    limit?: number;
    count?: number;
  };
  jobId?: string;
}

export interface BullFlow {
  job: BullJob;
  children: BullFlow[];
}

export interface BullRepeatableJob {
  key: string;
  name: string;
  id?: string;
  endDate?: number;
  tz?: string;
  pattern?: string;
  every?: number;
  next: number;
}

export interface BullWorker {
  id: string;
  name: string;
  addr: string;
  age: number;
  idle: number;
  currentJob?: string;
}

export interface BullQueueMetrics {
  queueName: string;
  timestamp: number;
  completedCount: number;
  failedCount: number;
  activeCount: number;
  waitingCount: number;
  delayedCount: number;
  processingTime: {
    avg: number;
    min: number;
    max: number;
  };
}
