export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms || 1000));
}

export * from './downloadGame';
export * from './event-manager';
export * from './json';
export * from './request-ok';
export * from './request-fail';
export * from './make-id-generator';