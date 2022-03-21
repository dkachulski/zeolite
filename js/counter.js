document.addEventListener('DOMContentLoaded', () => {
    // Create Counter
    class Counter {
        constructor(number, time, selector) {
            this.count = 0;
            this.interval = 20;
            this.number = number;
            this.time = time;
            this.selector = selector;
            this.rounds = this.time / this.interval;
            this.increment = number / this.rounds;
        }

        start() {
            const self = this;
            self.interval = setInterval(() => {
                if (self.count < self.number) {
                    self.count += this.increment;
                    self.updateDOM();
                } else clearInterval(self.interval);
            }, self.interval);
        }
        updateDOM() {
            document.querySelector(this.selector).textContent = Math.round(this.count);
        }
    }
    // Instantiate counters
    let counter1 = new Counter(375000, 2000, '#counter-1');
    let counter2 = new Counter(1200, 1000, '#counter-2');

    // Create Observer
    let options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05,
    };

    let observer = new IntersectionObserver(ev => {
        if (ev[0].isIntersecting) {
            counter1.start();
            counter2.start();
        }
    }, options);

    // Start Observer

    observer.observe(document.getElementById('counter-1'));
});
