
import EventEmitter from "eventemitter3";

function now() {
	return (typeof performance === 'undefined' ? Date : performance).now();
}

export default class Clock {
  private isRunning: boolean;
  private ee: EventEmitter;

  private msLastFrame: number;
  private msLimit: number;
  private elapsedTime: number;

  constructor(targetFPS = 60, disableOnBlur = true, autostart = true) {
    this.ee = new EventEmitter();
    this.msLastFrame = null;
    this.msLimit = 1000 / Math.min(targetFPS, 60);
    this.elapsedTime = 0.0;
    
    if(autostart) {
      console.info("Clock autostarted");
      this.start();
    }


    if (disableOnBlur) {
      window.onblur = (): void => {
        this.stop();
        console.info("Clock paused");
      };

      window.onfocus = (): void => {
        if(!this.isRunning) { 
          this.start();
          console.info("Clock resumed");
        }
      };
    }

    window.onbeforeunload = () => {
      console.info("Clock disposed");
      this.ee.removeAllListeners();
    }
  }

  run = (): void => {
    const current = now();
    let delta = current - this.msLastFrame;

    if (delta >= this.msLimit) {
      const d = delta * 0.001;
      this.elapsedTime += d;
      this.tick(this.elapsedTime, d);
      this.msLastFrame = current;
    }

    if (this.isRunning) {
      window.requestAnimationFrame(this.run);
    }
  };


  public getElapsedTime() {
    return this.elapsedTime;
  }

  public setSpeed(targetFPS) {
    this.msLimit = 1000 / Math.min(targetFPS, 60);
  }

  private tick = (dt: number, time: number): void => {
    this.ee.emit("tick", dt, time);
  };

  public on = (e: string, c): void => {
    this.ee.addListener(e, c);
  };

  public off = (e: string, c): void => {
    this.ee.removeListener(e, c);
  };

  public start = (): void => {
    this.isRunning = true;
    
    requestAnimationFrame(this.run);
    this.ee.emit("start");
  };

  public stop = (): void => {
    this.isRunning = false;
    this.ee.emit("stop");
  };
}
