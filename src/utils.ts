export function debounce<T extends Function>(cb: T, wait = 50) {
  let h = 0;
  let callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return <T>(<any>callable);
}