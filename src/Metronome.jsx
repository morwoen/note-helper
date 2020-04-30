// Taken from https://metronomes.glitch.me/
// https://github.com/scottwhudson/metronome/blob/master/assets/js/metronome.js
/* 
 * Base metronome, with no timing. 
 * More like a "click on command" class. 
 */
class BaseMetronome {
  constructor() {
    this.tempo = 60;
    this.playing = false;
    
    this.audioCtx = null;
    this.tick = null;
    this.tickVolume = null;
    this.soundHz = 1000;
  }
  
  initAudio() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.tick = this.audioCtx.createOscillator();
    this.tickVolume = this.audioCtx.createGain();

    this.tick.type = 'sine'; 
    this.tick.frequency.value = this.soundHz;
    this.tickVolume.gain.value = 0;
    
    this.tick.connect(this.tickVolume);
    this.tickVolume.connect(this.audioCtx.destination);
    this.tick.start(0);  // No offset, start immediately.
  }
  
  click(callbackFn) {
    const time = this.audioCtx.currentTime;
    this.clickAtTime(time);
    
    if (callbackFn) {
      callbackFn(time);
    }
  }
  
  clickAtTime(time) {
    // Silence the click.
    this.tickVolume.gain.cancelScheduledValues(time);
    this.tickVolume.gain.setValueAtTime(0, time);

    // Audible click sound.
    this.tickVolume.gain.linearRampToValueAtTime(1, time + .001);
    this.tickVolume.gain.linearRampToValueAtTime(0, time + .001 + .01);
  }
  
  start() {
    this.playing = true;
    this.initAudio();
  }
  
  stop() {
    this.playing = false;
    this.tickVolume.gain.value = 0;
  }
}

/* 
 * Scheduling is done by prescheduling all the audio events, and
 * letting the WebAudio scheduler actually do the scheduling.
 */
export default class ScheduledMetronome extends BaseMetronome {
  queueClick() {
    const timeoutDuration = (60 / this.tempo);

    this.clickAtTime(this.nextClick);
    const x = this.nextClick;
    setTimeout(() => {
      if (this.finishedInitialQueue && this.playing) {
        this.queueClick();
      }
      this.onClick(x)
    }, this.nextClick * 1000);
    console.log(this.nextClick)

    this.nextClick += timeoutDuration;
  }

  setTempo(newTempo) {
    const wasPlaying = this.playing;
    if (this.playing) {
      this.stop();
    }
    this.tempo = newTempo;
    if (wasPlaying) {
      this.start();
    }
  }

  start(callbackFn) {
    if (callbackFn) {
      this.onClick = callbackFn;
    }

    if (this.playing) this.stop();

    super.start();
    const timeoutDuration = (60 / this.tempo);
    
    this.finishedInitialQueue = false;
    this.nextClick = this.audioCtx.currentTime;
    for (let i = 0; i < 5; i++) {
      this.queueClick();
    }
    this.finishedInitialQueue = true;


    // let now = this.audioCtx.currentTime;
      
    // // Schedule all the clicks ahead.
    // for (let i = 0; i < 5; i++) {
    //   this.clickAtTime(now);
    //   const x = now;
    //   setTimeout(() => this.onClick(x), now * 1000);
    //   now += timeoutDuration;
    // }
  }
}
