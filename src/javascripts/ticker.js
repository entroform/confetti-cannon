const TICKER_DEFAULT_CONFIG = {
  loopForever: false,
  durationInSeconds: 1,
  timingFunction: t => t,
  onStart: () => {},
  onTick: () => {},
  onComplete: () => {},
};

export default class Ticker {
  constructor(config) {
    this.config = { ...TICKER_DEFAULT_CONFIG };
    this.setConfig(config);
  
    this.isActive = false;
    this.timeStart = 0;
    this.timeEnd = 0;
  
    this._progressTimeStart = 0;
    this.progress = 0;
  
    this.progressIterationCount = 0;
    this.tickCount = 0;
  
    this.callback = null;
    this._requestAnimationFrameId = null;
  }

  setConfig(config) {
    if (typeof config === 'object') {
      Object.assign(this.config, config);
    }
    return this;
  }

  start() {
    if (this.isActive) {
      return;
    }

    this.isActive = true;
    this.timeStart = Date.now();
    this._progressTimeStart = this.timeStart;
    this.config.onStart(this);
    this.continueLoop();    
  }

  stop() {
    if (!this.isActive) {
      return;
    }

    if (typeof this._requestAnimationFrameId === 'number') {
      window.cancelAnimationFrame(this._requestAnimationFrameId);
      this._requestAnimationFrameId = null;
    }

    this.timeEnd = Date.now();

    this.progress = 0;
    this.progressIterationCount = 0;

    this.tickCount = 0;
    this.isActive = false;

    this.config.onComplete(this);
  }

  loop() {
    if (!this.isActive) {
      return;
    }

    this.updateProgress();

    const t = this.config.timingFunction(this.progress);
    const data = [t, this.progressIterationCount, this.tickCount];

    this.config.onTick(data, this);

    this.tickCount++;

    if (this.progress < 1) {
      this.continueLoop();
    } else {
      if (this.config.loopForever) {
        this.progress = 0;
        this.progressIterationCount++;
        this._progressTimeStart = Date.now();
        this.continueLoop();
      } else {
        this.stop();
      }
    }    
  }

  continueLoop() {
    if (!this.isActive) {
      return;
    }

    if (typeof this._requestAnimationFrameId === 'number') {
      window.cancelAnimationFrame(this._requestAnimationFrameId);
    }

    this._requestAnimationFrameId = window.requestAnimationFrame(this.loop.bind(this));
  }

  updateProgress() {
    let progress = 1;

    const durationInMilliseconds = this.config.durationInSeconds * 1000;
    if (durationInMilliseconds) {
      const value = (Date.now() - this._progressTimeStart) / durationInMilliseconds;
      if (value < 1) {
        progress = value;
      }
    }

    this.progress = progress;
  }
}