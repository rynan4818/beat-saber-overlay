const events = {
  hello(data) {
    console.log("Connected to Beat Saber");
    
    if (data.status.beatmap && data.status.performance) {
      ui.beatmap(data);
      ui.performance(data);
      ui.show();
    }
    ex_hello.forEach(ex => ex(data));
  },
  
  songStart(data) {
    ui.beatmap(data);
    ui.performance(data);
    ui.show();
    ex_songStart.forEach(ex => ex(data));
  },
  
  noteCut(data) {
    ui.performance(data);
    ex_noteCut.forEach(ex => ex(data));
  },
  
  noteFullyCut(data) {
    ui.performance(data);
    ex_noteFullyCut.forEach(ex => ex(data));
  },
  
  obstacleEnter(data) {
    ui.performance(data);
    ex_obstacleEnter.forEach(ex => ex(data));
  },
  
  obstacleExit(data) {
    ui.performance(data);
    ex_obstacleExit.forEach(ex => ex(data));
  },
  
  noteMissed(data) {
    ui.performance(data);
    ex_noteMissed.forEach(ex => ex(data));
  },
  
  bombCut(data) {
    ui.performance(data);
    ex_bombCut.forEach(ex => ex(data));
  },
  
  bombMissed(data) {
    ui.performance(data);
    ex_bombMissed.forEach(ex => ex(data));
  },
  
  finished(data) {
    ui.performance(data);
    ex_finished.forEach(ex => ex(data));
  },
  
  failed(data) {
    ui.performance(data);
    ex_failed.forEach(ex => ex(data));
  },
  
  softFailed(data) {
    ui.performance(data);
    ex_softFailed.forEach(ex => ex(data));
  },
  
  scoreChanged(data) {
    ui.performance(data);
    ex_scoreChanged.forEach(ex => ex(data));
  },
  
  energyChanged(data) {
    ui.performance(data);
    ex_energyChanged.forEach(ex => ex(data));
  },
  
  noteSpawned(data) {
    ex_noteSpawned.forEach(ex => ex(data));
  },
  
  other(data) {
    ex_other.forEach(ex => ex(data));
  },
  
  beatmapEvent(data) {
    if (typeof data.status !== "undefined") {
      if (typeof data.status.performance !== "undefined") {
        var song_time = data.status.performance.currentSongTime;
        if (typeof song_time !== "undefined") {
          ui.timer.song_time_update(song_time);
        }
      }
    }
    ex_beatmapEvent.forEach(ex => ex(data));
  },
  
  pause(data) {
    var ip = query.get("ip");
    var diff_time = 0;
    if (ip && ip != "localhost" && ip != "127.0.0.1") {
      diff_time = Date.now() - data.time;
      console.log(diff_time);
    }
    ui.timer.pause(data.status.beatmap.paused + diff_time);
    ex_pause.forEach(ex => ex(data));
  },
  
  resume(data) {
    var ip = query.get("ip");
    var diff_time = 0;
    if (ip && ip != "localhost" && ip != "127.0.0.1") {
      diff_time = Date.now() - data.time;
      console.log(diff_time);
    }
    ui.timer.start(data.status.beatmap.start + diff_time, data.status.beatmap.length, false);
    ex_resume.forEach(ex => ex(data));
  },
  
  menu(data) {
    ui.timer.stop();
    if (disp_hidden) {
      ui.hide();
    }
    ex_menu.forEach(ex => ex(data));
  }
}
