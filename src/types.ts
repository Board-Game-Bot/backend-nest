export interface JwtType {
  id: string;
}

export type MaybePromise<T> = T | Promise<T>;

export enum BotStatus {
  Hibernating = 'Hibernating',
  Deploying = 'Deploying',
  Working = 'Working',
  Terminating = 'Terminating',
  Failed = 'Failed',
}