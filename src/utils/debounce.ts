function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T, delay: number = 200) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    timeout = setTimeout(() => fn(...args), delay)
  }
}

export { debounce }
