export const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const debounced = (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(args);
    }, delay);
  };
  debounced.flush = (...args: any[]) => {
    clearTimeout(timeoutId);
    fn(args);
  };
  return debounced;
};

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
