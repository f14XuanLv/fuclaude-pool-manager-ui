export const generateRandomId = (prefix: string = 'rand_'): string => {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
};
