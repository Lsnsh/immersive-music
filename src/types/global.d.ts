declare module '*.mp3' {
  const src: string;
  export default src;
}

interface Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
} 