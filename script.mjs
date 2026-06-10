// This is a placeholder file which shows how you can access functions defined in other files.
// It can be loaded into index.html.
// You can delete the contents of the file once you have understood how it works.
// Note that when running locally, in order to open a web page which uses modules, you must serve the directory over HTTP e.g. with https://www.npmjs.com/package/http-server
// You can't open the index.html file using a file:// URL.

import {getUserIDs, getListenEvents, getSong} from "./data.mjs"; 
import { longestSongStreak } from "./analytic.mjs";
const users = getUserIDs();
const selectUser = document.getElementById("user-select");
const results = document.getElementById("results");



function addUsersToDropDown() {
  for (const user of users) {
    const option = document.createElement("option");
    option.value = user;
    option.textContent = `User ${user}`;
    selectUser.append(option);
  }
}

window.onload = function () {
  addUsersToDropDown();
  selectUser.addEventListener("change", handleUserChange);
};

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const key = keyFn(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function mostListenedSong(events, getSong) {
  if (events.length === 0) return null;
  const counts = countBy(events, e => e.song_id);
  const [songId] =
    [...counts.entries()]
      .sort((a, b) => b[1] - a[1])[0];
  return {
    song: getSong(songId),
    listens: counts.get(songId)
  };
}

function mostListenedArtist(events, getSong) {
  if (events.length === 0) return null;
  const counts = countBy(
    events,
    e => getSong(e.song_id).artist
  );
  const [artist] =
    [...counts.entries()]
      .sort((a, b) => b[1] - a[1])[0];
  return artist;
}

function mostListenedSongByTime(events, getSong) {
  if (events.length === 0) return null;

  const totals = new Map();
  for (const event of events) {
    const song = getSong(event.song_id);
    totals.set(
      song.id,
      (totals.get(song.id) || 0) +
        song.duration_seconds
    );
  }
  const [songId, seconds] =
    [...totals.entries()]
      .sort((a, b) => b[1] - a[1])[0];
  return {
    song: getSong(songId),
    seconds
  };
}

function mostListenedArtistByTime(events, getSong) {
  if (events.length === 0) return null;

  const totals = new Map();

  for (const event of events) {
    const song = getSong(event.song_id);

    totals.set(
      song.artist,
      (totals.get(song.artist) || 0) +
      song.duration_seconds
    );
  }

  const [artist] =
    [...totals.entries()]
      .sort((a, b) => b[1] - a[1])[0];

  return artist;
}

function isFridayNight(event) {
  const date = new Date(event.timestamp);

  const day = date.getDay();
  const hour = date.getHours();

  return (
    (day === 5 && hour >= 17) ||
    (day === 6 && hour < 4)
  );
}

function fridayNightSong(events, getSong) {
  const fridayEvents =
    events.filter(isFridayNight);

  if (fridayEvents.length === 0) {
    return null;
  }

  return mostListenedSong(
    fridayEvents,
    getSong
  );
}

function fridayNightSongByTime(
  events,
  getSong
) {
  const fridayEvents =
    events.filter(isFridayNight);

  if (fridayEvents.length === 0) {
    return null;
  }

  return mostListenedSongByTime(
    fridayEvents,
    getSong
  );
}


function songsListenedEveryDay(events) {
  const allDays = new Set();

  const songDays = new Map();

  for (const event of events) {
    const day =
      event.timestamp.slice(0, 10);

    allDays.add(day);

    if (!songDays.has(event.song_id)) {
      songDays.set(event.song_id, new Set());
    }

    songDays.get(event.song_id).add(day);
  }

  return [...songDays.entries()]
    .filter(
      ([, days]) =>
        days.size === allDays.size
    )
    .map(([songId]) => songId);
}

function topGenres(events, getSong) {
   const counts = countBy(
    events,
    e => getSong(e.song_id).genre
  );

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genre]) => genre);
}

function handleUserChange(e) {
  const userId = e.target.value;

  if (!userId) {
    results.textContent = "";
    return;
  }

  const events = getListenEvents(userId);

  results.querySelectorAll("p").forEach(
    p => p.hidden = false
  );

  if (events.length === 0) {
    document.getElementById("title").textContent =
      "This user didn't listen to any songs.";

    results.querySelectorAll("p").forEach(
      p => p.hidden = true
   );
    return;
  }

  const topSong = mostListenedSong(events, getSong);

  const topArtist = mostListenedArtist(events, getSong);

  const topSongTime = mostListenedSongByTime(events, getSong);

  const topGenresList =topGenres(events, getSong);

  const streak =longestSongStreak(events);

  const topArtistTime = mostListenedArtistByTime(events, getSong);

  const fridaySong = fridayNightSong(events, getSong);

  const fridaySongTime = fridayNightSongByTime(events,getSong);

  const everyDaySongs = songsListenedEveryDay(events);

  document.getElementById("title").textContent =`User ${userId} Analysis`;

  document.getElementById("top-song").textContent =`${topSong.song.artist} - ${topSong.song.title} (${topSong.listens} listens)`;

  document.getElementById("top-song-time").textContent =`${topSongTime.song.artist} - ${topSongTime.song.title} (${topSongTime.seconds} seconds)`;

  document.getElementById("top-artist").textContent =topArtist;
  
  document.getElementById("top-genres").textContent =  topGenresList.join(", ");

  const genresLabel =document.getElementById("genres-label");
  if (topGenresList.length === 1) {
    genresLabel.textContent = "Top genre:";
   } else if (topGenresList.length === 2) {
       genresLabel.textContent = "Top 2 genres:";
   } else { genresLabel.textContent = "Top 3 genres:";
   }


  const streakSong = getSong(streak.songId);
  document.getElementById("streak").textContent =`${streakSong.artist} - ${streakSong.title} (${streak.length} times in a row)`

  document.getElementById("top-artist-time").textContent =topArtistTime; 

  const fridayCountRow =document.getElementById("friday-count-row");
  if (fridaySong) {fridayCountRow.hidden = false;
    document.getElementById("friday-song").textContent =`${fridaySong.song.artist} - ${fridaySong.song.title}`;
    } else {fridayCountRow.hidden = true;}

  const fridayTimeRow = document.getElementById("friday-time-row");
  if (fridaySongTime) {
    fridayTimeRow.hidden = false;
    document.getElementById("friday-song-time").textContent =`${fridaySongTime.song.artist} - ${fridaySongTime.song.title}`;
    } else {fridayTimeRow.hidden = true;
    }

  const everyDayRow =document.getElementById("every-day-row");
  if (everyDaySongs.length > 0) {
    everyDayRow.hidden = false;
    document.getElementById("every-day-songs").textContent =  everyDaySongs.map(id => {
        const song = getSong(id);
        return `${song.artist} - ${song.title}`;
      }).join(", ");
   } else {
    everyDayRow.hidden = true;
   }
}