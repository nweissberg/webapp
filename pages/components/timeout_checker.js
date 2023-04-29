export default class TimeoutChecker {
    constructor(timeoutDuration, onTimeout, onProgress = (percentage) => {
        console.log(`Remaining time: ${percentage}%`);
    }) {
        // onProgress(100);
        this.timeoutId = null;
        this.duration = timeoutDuration;
        this.remainingTime = timeoutDuration;
        this.onTimeout = onTimeout;
        this.onProgress = onProgress;
    }

    start() {
        this.onProgress(100);
        this.timeoutId = setTimeout(() => {
            this.onTimeout?.();
        }, this.remainingTime);

        const intervalId = setInterval(() => {
            this.remainingTime -= 300;
            const percentage = Math.floor((this.remainingTime / this.duration) * 100);
            this.onProgress(percentage);
            if (this.remainingTime <= 0) {
                clearInterval(intervalId);
            }
        }, 300);
    }

    cancel() {
        clearTimeout(this.timeoutId);
    }
}
