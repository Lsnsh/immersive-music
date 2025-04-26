export interface Song {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
  duration?: number;
}

const songs: Song[] = [
  {
    id: '1',
    title: '生活倒影',
    artist: '苏运莹',
    src: '/music/苏运莹-生活倒影.wav',
  },
  {
    id: '2',
    title: 'Night Owl',
    artist: 'Broke For Free',
    src: '/music/background-music.mp3',
  }
];

export default songs; 