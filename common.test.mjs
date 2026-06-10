import assert from "node:assert";
import test from "node:test";
import { countUsers } from "./common.mjs";
import { longestSongStreak } from "./analytic.mjs";

test("User count is correct", () => {
  assert.equal(countUsers(), 4);
});

test("Longest song streak is correct", () => {
  const events = [
    { user_id: 1, song_id: 1, timestamp: "2023-01-01T12:00:00Z" },
    { user_id: 1, song_id: 1, timestamp: "2023-01-01T12:01:00Z" },
    { user_id: 1, song_id: 2, timestamp: "2023-01-01T12:02:00Z" },
    { user_id: 1, song_id: 2, timestamp: "2023-01-01T12:03:00Z" },
    { user_id: 1, song_id: 2, timestamp: "2023-01-01T12:04:00Z" },
  ];
  assert.deepEqual(longestSongStreak(events), {
    songId: 2,
    length: 3
  });
});