export interface JwtType {
  Id: string;
}

export type MaybePromise<T> = T | Promise<T>;

export enum BotStatus {
  Hibernating = 'Hibernating',
  Deploying = 'Deploying',
  Working = 'Working',
  Terminating = 'Terminating',
  Failed = 'Failed',
}

export interface OnlyIdRequest {
  Id: string;
}

export interface OnlyIdResponse {
  Id: string;
}

export type EmptyObject = Record<string, never>