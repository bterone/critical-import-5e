const IS_DEV_MODE = true;
// const IS_DEV_MODE = false;

export function logConsole(...args) {
  if (!IS_DEV_MODE) {
    return;
  }
  console.log(...args);
}

export function logWarn(...args) {
  console.warn(...args);
}

export function logError(...args) {
  console.error(...args);
}
