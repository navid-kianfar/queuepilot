export interface CleanQueueDto {
  state: 'completed' | 'failed' | 'delayed' | 'waiting' | 'active';
  gracePeriodMs?: number;
  limit?: number;
}

export interface AddJobDto {
  name: string;
  data: unknown;
  opts?: {
    attempts?: number;
    delay?: number;
    priority?: number;
    lifo?: boolean;
    removeOnComplete?: boolean | number;
    removeOnFail?: boolean | number;
    backoff?: number | { type: string; delay: number };
    repeat?: {
      pattern?: string;
      every?: number;
      limit?: number;
    };
  };
}

export interface RetryJobsDto {
  state: 'failed';
  count?: number;
}

export interface BrowseJobsDto {
  state?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'timestamp' | 'processedOn' | 'finishedOn';
  sortOrder?: 'asc' | 'desc';
}
