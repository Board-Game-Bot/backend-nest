export const safeJsonStringify = (object: unknown) => {
  try {
    return JSON.stringify(object);
  }
  catch {
    return undefined;
  }
};