class Counter {
    constructor(maxNumber, time) {
        this.number = 0;
        this.maxNumber = maxNumber;
        this.time = time;
        this.speed = time;
    }

    start() {
        const self = this;
        let interval = setInterval(() => {
            if (number !== this.maxNumber) self.maxNumber += 1;
            else clearInterval(interval);
            this.updateDOM();
        }, 50);
    }
    updateDOM() {
        console.log(this.number);
    }
}

let counter1 = new Counter(50);
counter1.start();
