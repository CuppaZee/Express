export default function omit<T extends object, K extends string>(obj: T, key: K): Omit<T, K> {
  const { [key]: omitted, ...rest } = obj;
  return rest;
}
