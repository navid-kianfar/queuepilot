export enum JobState {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PRIORITIZED = 'prioritized',
  WAITING_CHILDREN = 'waiting-children',
}
