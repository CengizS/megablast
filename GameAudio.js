class GameAudio {
  constructor({
    backgroundMusicEl,
    explosionEl,
    trackTitleEl,
    trackDivEl,
  } = {}) {
    this.audioPlaying = false;
    this.backgroundMusic =
      backgroundMusicEl || document.querySelector("#backgroundMusic");
    this.trackPlaying = -1;
    this.trackTitleEl = trackTitleEl || document.querySelector("#trackTitle");
    this.trackDivEl = trackDivEl || document.querySelector("#titleDiv");
    this.tracks = [
      {
        title: "When the Siren sounds",
        track: "track_0.mp3",
      },
      {
        title: "Flying",
        track: "track_2.mp3",
      },
      {
        title: "Pulse",
        track: "track_3.mp3",
      },
      {
        title: "XEN 3 Gigablast",
        track: "track_4.mp3",
      },
      {
        title: "XENON 2 Megablast",
        track: "track_5.mp3",
      },
    ];
    this.explosionSound = explosionEl || document.getElementById("explosion");
    this.shootSound = new Audio("shoot.wav");
    this.shootSound.volume = 0.2;
    this.backgroundMusic.onended = () => {
      this.nextTrack();
    };
  }

  playExplosionSound() {
    this.explosionSound.currentTime = 0;
    this.explosionSound.play();
  }

  playShootSound() {
    this.shootSound.currentTime = 0;
    this.shootSound.play();
  }

  toggleAudioPlaying() {
    if (this.audioPlaying) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    } else {
      this.trackPlaying = -1;
      this.backgroundMusic.volume = 0.1;
      this.nextTrack();
    }
    this.audioPlaying = !this.audioPlaying;
  }

  nextTrack() {
    this.backgroundMusic.volume = 0.1;
    this.trackPlaying++;
    if (this.trackPlaying >= this.tracks.length) this.trackPlaying = 0;
    this.backgroundMusic.src = this.tracks[this.trackPlaying].track;
    if (this.trackTitleEl) {
      this.trackTitleEl.innerHTML = this.tracks[this.trackPlaying].title;
    }
    this.backgroundMusic.play();
    if (this.trackDivEl) {
      gsap.fromTo(
        this.trackDivEl,
        {
          opacity: 1,
        },
        {
          duration: 8,
          opacity: 0,
          delay: 3,
        }
      );
    }
  }
}
