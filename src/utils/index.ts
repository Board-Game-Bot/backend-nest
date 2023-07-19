export function makeFailure(data?: Record<string, any>) {
  return {
    status: 'failed',
    data,
  };
}

export function makeSuccess(data?: Record<string, any>) {
  return {
    status: 'succeed',
    data,
  };
}
