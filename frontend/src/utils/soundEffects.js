// Simple Web Audio API sound effects generator
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const playTone = (frequency, duration = 0.1, type = 'sine', volume = 0.3) => {
  try {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    console.log('Audio not supported:', e);
  }
};

export const playSoundClick = () => {
  // Quick pop sound
  playTone(800, 0.1, 'sine', 0.2);
};

export const playSoundLineCleared = () => {
  // Ascending notes for success
  playTone(600, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(800, 0.1, 'sine', 0.25), 100);
  setTimeout(() => playTone(1000, 0.15, 'sine', 0.25), 200);
};

export const playSoundGameOver = () => {
  // Descending notes for failure
  playTone(400, 0.15, 'sine', 0.3);
  setTimeout(() => playTone(300, 0.2, 'sine', 0.3), 150);
  setTimeout(() => playTone(200, 0.25, 'sine', 0.3), 350);
};

export const playSoundBlockPlace = () => {
  // Quick double tap
  playTone(700, 0.08, 'triangle', 0.2);
  setTimeout(() => playTone(900, 0.08, 'triangle', 0.2), 80);
};
