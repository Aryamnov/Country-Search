import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '../src/debounce.js';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('функция ожидает указанный таймаут перед вызовом', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100);

    debounced();
    vi.advanceTimersByTime(99);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('повторный вызов перезапускает таймаут', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 100);

    debounced();
    vi.advanceTimersByTime(50);
    debounced();

    vi.advanceTimersByTime(99);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('вызов функции осуществляется один раз с последними входными данными', () => {
    const callback = vi.fn<(query: string, limit: number) => void>();
    const debounced = debounce(callback, 100);

    debounced('s', 5);
    vi.advanceTimersByTime(30);
    debounced('sp', 10);
    vi.advanceTimersByTime(30);
    debounced('spain', 20);
    vi.runAllTimers();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('spain', 20);
  });
});
