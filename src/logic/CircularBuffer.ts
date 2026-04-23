/**
 * CircularBuffer: A high-performance fixed-size buffer that overwrites 
 * the oldest data once full.
 * $O(1)$ write complexity.
 * Essential for live data streaming in IoT systems.
 */
export class CircularBuffer<T> {
  private buffer: (T | null)[];
  private size: number;
  private head: number = 0; // Pointer to the next write position

  constructor(size: number) {
    this.size = size;
    this.buffer = new Array(size).fill(null);
  }

  /**
   * Adds a new item to the buffer.
   * If the buffer is full, it overwrites the oldest item.
   * Time Complexity: O(1)
   */
  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.size;
  }

  /**
   * Returns the buffer contents as an ordered array (oldest to newest).
   * Time Complexity: O(N) where N is buffer size.
   */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % this.size;
      const item = this.buffer[index];
      if (item !== null) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * Returns the most recent item added.
   * Time Complexity: O(1)
   */
  last(): T | null {
    return this.at(0);
  }

  /**
   * Returns the item at a specific relative index (0 = newest, size-1 = oldest).
   * Time Complexity: O(1)
   */
  at(index: number): T | null {
    if (index < 0 || index >= this.size) return null;
    const pos = (this.head - 1 - index + this.size) % this.size;
    return this.buffer[pos];
  }

  getSize(): number {
    return this.size;
  }
}

