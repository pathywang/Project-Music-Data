export function longestSongStreak(events) {
  if (events.length === 0) return null;
  let currentSong = events[0].song_id;
  let currentLength = 1;
  let bestSong = currentSong;
  let bestLength = 1;
  for (let i = 1; i < events.length; i++) {
    const song = events[i].song_id;

    if (song === currentSong) {
      currentLength++;
    } else {
      currentSong = song;
      currentLength = 1;
    }

    if (currentLength > bestLength) {
      bestLength = currentLength;
      bestSong = currentSong;
    }
  }

  return {
    songId: bestSong,
    length: bestLength
  };
}