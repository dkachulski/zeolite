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

let counter1 = new Counter(375000, 1500, '#counter-1');
counter1.start();
console.log(counter1.increment);

let counter2 = new Counter(1200, 1000, '#counter-2');
counter2.start();
