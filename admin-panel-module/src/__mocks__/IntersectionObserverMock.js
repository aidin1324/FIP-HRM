class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.elements = new Set();
    this.entries = [];
  }

  observe(element) {
    this.elements.add(element);
    const entry = {
      isIntersecting: true,
      target: element,
      intersectionRatio: 1,
    };
    this.entries.push(entry);
  }

  unobserve(element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
    this.entries = [];
  }

  // Имитация пересечения для активации колбэка
  simulateIntersection() {
    if (this.entries.length > 0) {
      this.callback(this.entries);
    }
  }
}

export default MockIntersectionObserver;