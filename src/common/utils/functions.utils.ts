export function isBoolean(value: any): boolean {
  return [false, true, 'false', 'true'].includes(value);
}

export function toBoolean(value: any): boolean {
  return isBoolean(value) ? value === 'true' : false;
}

export function notNan(value: number): boolean {
  return !isNaN(parseInt(value.toString()));
}

export function isNan(value: number): boolean {
  return isNaN(parseInt(value.toString()));
}
