export const excludeProp = (
  input: Record<string, unknown>,
  keyToExclude: string
) => {
  const { [keyToExclude]: removedProperty, ...restObject } = input;
  return restObject;
};
