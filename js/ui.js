const ui = (() => {
  if (html_id["overlay"]) var main = document.getElementById("overlay");
  var now_map = null;
  var pre_map = null;
  var pre_songHash = null;
  var now_energy = 50;
  var mod_instaFail = false;
  var mod_batteryEnergy = false;
  var obstacle_time = 0;
  var now_pp_enable = false;
  var camera_script_author_name = "";
  if (html_id["camera_mapper_header"]) var dom_camera_mapper_header = document.getElementById("camera_mapper_header");
  if (html_id["camera_mapper"])       var dom_camera_mapper       = document.getElementById("camera_mapper");

  function camera_script_update(data) {
    if (typeof data.other === "undefined") return;
    if (typeof data.other.CameraSongScript === "undefined") return;
    if (typeof data.other.CameraSongScript.status === "undefined") {
      camera_script_author_name = "";
      return;
    }
    if (data.other.CameraSongScript.status === "songScript" || data.other.CameraSongScript.status === "commonScript") {
      if (typeof data.other.CameraSongScript.metadata !== "undefined"
          && typeof data.other.CameraSongScript.metadata.cameraScriptAuthorName !== "undefined") {
        camera_script_author_name = data.other.CameraSongScript.metadata.cameraScriptAuthorName;
      } else {
        camera_script_author_name = "";
      }
    } else {
      camera_script_author_name = "";
    }
  }

  function camera_script_clear() {
    camera_script_author_name = "";
    if (html_id["camera_mapper"]) dom_camera_mapper.innerText = "";
    if (html_id["camera_mapper_header"]) dom_camera_mapper_header.innerText = "";
  }

  function camera_script_show() {
    if (camera_script_author_name) {
      if (html_id["camera_mapper_header"]) dom_camera_mapper_header.innerText = " Cam: ";
      if (html_id["camera_mapper"]) dom_camera_mapper.innerText = camera_script_author_name;
    } else {
      if (html_id["camera_mapper_header"]) dom_camera_mapper_header.innerText = "";
      if (html_id["camera_mapper"]) dom_camera_mapper.innerText = "";
    }
  }
  
  const performance = (() => {
    const cut_energy = 1;
    const misscut_energy = -10;
    const miss_energy = -15;
    const drain_energy = -0.13;  //per msec
    const battery_unit = 25;
    const element_cut_energy = 0.2;
    const element_misscut_energy = -2.5;
    const element_miss_energy = -3;
    if (html_id["rank"])         var rank         = document.getElementById("rank");
    if (html_id["percentage"])   var percentage   = document.getElementById("percentage");
    if (html_id["score"])        var score        = document.getElementById("score");
    if (html_id["combo"])        var combo        = document.getElementById("combo");
    if (html_id["miss"])         var miss         = document.getElementById("miss");
    if (html_id["energy"])       var energy       = document.getElementById("energy");
    if (html_id["energy_bar"])   var energy_bar   = document.getElementById("energy_bar");
    if (html_id["energy_group"]) var energy_group = document.getElementById("energy_group");
    if (html_id["now_pp"])       var now_pp       = document.getElementById("now_pp");
    if (html_id["now_pp_text"])  var now_pp_text  = document.getElementById("now_pp_text");
    
    function format(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    return (data) => {
      var performance = data.status.performance;
      if (html_id["score"]) score.innerText = format(performance.score);
      if (html_id["combo"]) combo.innerText = performance.combo;
      if (html_id["rank"])  rank.innerText = performance.rank;
      if (html_id["miss"])  miss.innerText = performance.missedNotes;
      if (html_id["percentage"]) {
        if (typeof performance.relativeScore !== "undefined") {
          percentage.innerText = ((performance.relativeScore * 100).toFixed(2)) + "%";
        } else {
          percentage.innerText = (performance.currentMaxScore > 0 ? (performance.score / performance.currentMaxScore * 100).toFixed(2) : "100.00") + "%";
        }
      }
      if (typeof performance.softFailed !== "undefined") {
        if (performance.softFailed === true) {
          now_energy = null;
          if (html_id["energy"]) energy.innerText = "NF";
          if (html_id["energy_group"] && energy_display) energy_group.setAttribute("style", "visibility: hidden");
        }
      }
      if (now_energy !== null) {
        if (typeof performance.energy !== "undefined") {
          if (data.event === "energyChanged") {
            now_energy = performance.energy * 100;
          }
        } else {
          if (data.event === "obstacleEnter") {
            obstacle_time = data.time;
          }
          if (mod_instaFail === false && mod_batteryEnergy === false) {
            switch(data.event) {
              case "noteCut":
                now_energy += cut_energy;
                break;
              case "noteMissed":
                if (data.noteCut.saberType == null) {
                  now_energy += miss_energy;
                } else {
                  now_energy += misscut_energy;
                }
                break;
              case "bombCut":
                now_energy += miss_energy;
                break;
              case "obstacleExit":
                var delta_t = data.time - obstacle_time;
                now_energy += delta_t * drain_energy;
                break;
            }
          } else {
            switch(data.event) {
              case "noteMissed":
              case "bombCut":
                if (mod_instaFail === true) {
                  now_energy = 0;
                } else {
                  now_energy -= battery_unit;
                }
                break;
              case "obstacleExit":
                if (mod_instaFail === true) {
                  now_energy = 0;
                } else {
                  var delta_t = data.time - obstacle_time;
                  now_energy += parseInt(delta_t * drain_energy) * battery_unit;
                }
                break;
            }
          }
        }
        if (now_energy > 100) now_energy = 100;
        if (data.event === "failed") now_energy = 0;
        if (now_energy < 0) now_energy = 0;
        if (html_id["energy"]) energy.innerText = Math.round(now_energy) + "%";
        if (html_id["energy_bar"]) energy_bar.setAttribute("style", `width: ${Math.round(now_energy)}%`);
      }
      if (typeof performance.current_pp !== "undefined" && performance.current_pp > 0) now_pp_enable = true;
      if (now_pp_enable) {
        if (html_id["now_pp"])     now_pp.innerText = performance.current_pp.toFixed(2);
        if (html_id["now_pp_text"]) now_pp_text.innerText = now_pp_text_org;
      }
      
      ex_performance.forEach(ex => ex(data,now_energy));
    }
  })();
  
  const timer = (() => {
    const radius = 30;
    const circumference = radius * Math.PI * 2;
    
    if (html_id["progress"])      var bar = document.getElementById("progress");
    if (html_id["song_time"])     var song_time = document.getElementById("song_time");
    
    var active = false;
    
    var began;
    var duration;
    var length_min;
    var length_sec;
    var song_speed;
    
    var display;
    
    function format(time) {
      var minutes = Math.floor(time / 60);
      var seconds = time % 60;
      
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      
      return `${minutes}:${seconds}`;
    }
    
    function update(time) {
      time = time || Date.now();
      
      var delta = (time - began) * song_speed;
      
      var progress = Math.floor(delta / 1000);
      var percentage = Math.min(delta / duration, 1);
      
      if (html_id["progress"]) bar.setAttribute("style", `stroke-dashoffset: ${(1 - percentage) * circumference}px`);
      ex_timer_update.forEach(ex => ex(time, delta, progress, percentage));
      
      // Minor optimization
      if (progress != display) {
        display = progress;
        if (html_id["song_time"]) song_time.innerText = format(progress);
        ex_timer_update_sec.forEach(ex => ex(time, delta, progress, percentage));
      }
    }
    
    function loop() {
      if (active) {
        update();
        requestAnimationFrame(loop);
      }
    }
    
    return {
      start(time, length, speed) {
        active = true;
        if (speed != false) song_speed = speed;
        began = time;
        duration = length * song_speed;
        
        length_min = Math.floor(duration / 1000 / 60);
        length_sec = Math.floor(duration / 1000) % 60;
        if (length_sec < 10) {
          length_sec = "0" + length_sec;
        }
        if (html_id["song_length"]) song_length.innerText = `${length_min}:${length_sec}`;
        
        loop();
      },
      
      pause(time) {
        active = false;
        
        update(time);
      },
      
      stop() {
        active = false;
        began = undefined;
        duration = undefined;
      },
      
      song_time_update(song_time) {
        began = Date.now() - Math.floor(song_time * 1000 / song_speed);
        update();
      }
    }
  })();
  
  const beatmap = (() => {
    const beatsaver_url = 'https://api.beatsaver.com/maps/hash/';
    const request_timeout = 5000; //msec
    const min_subtitle_width_ratio = 0.3;
    if (html_id["overlay"])               var dom_overlay              = document.getElementById("overlay");
    if (html_id["image"])                 var dom_cover                = document.getElementById("image");
    if (html_id["titles"])                var dom_titles               = document.getElementById("titles");
    if (html_id["title_group"])           var dom_title_group          = document.getElementById("title_group");
    if (html_id["title"])                 var dom_title                = document.getElementById("title");
    if (html_id["subtitle_group"])        var dom_subtitle_group       = document.getElementById("subtitle_group");
    if (html_id["subtitle"])              var dom_subtitle             = document.getElementById("subtitle");
    if (html_id["artist"])                var dom_artist               = document.getElementById("artist");
    if (html_id["artist_group"])          var dom_artist_group         = document.getElementById("artist_group");
    if (html_id["artist_mapper"])         var dom_artist_mapper        = document.getElementById("artist_mapper");
    if (html_id["artist_mapper_group"])   var dom_artist_mapper_group  = document.getElementById("artist_mapper_group");
    if (html_id["mapper_header"])         var dom_mapper_header        = document.getElementById("mapper_header");
    if (html_id["mapper"])                var dom_mapper               = document.getElementById("mapper");
    if (html_id["mapper_footer"])         var dom_mapper_footer        = document.getElementById("mapper_footer");
    if (html_id["difficulty"])            var dom_difficulty           = document.getElementById("difficulty");
    if (html_id["bpm"])                   var dom_bpm                  = document.getElementById("bpm");
    if (html_id["njs"])                   var dom_njs                  = document.getElementById("njs");
    if (html_id["njs_text"])              var dom_njs_text             = document.getElementById("njs_text");
    if (html_id["bsr"])                   var dom_bsr                  = document.getElementById("bsr");
    if (html_id["bsr_text"])              var dom_bsr_text             = document.getElementById("bsr_text");
    if (html_id["mod"])                   var dom_mod                  = document.getElementById("mod");
    if (html_id["pre_bsr"])               var dom_pre_bsr              = document.getElementById("pre_bsr");
    if (html_id["pre_bsr_text"])          var dom_pre_bsr_text         = document.getElementById("pre_bsr_text");
    if (html_id["energy"])                var dom_energy               = document.getElementById("energy");
    if (html_id["energy_group"])          var dom_energy_group         = document.getElementById("energy_group");
    if (html_id["star"])                  var dom_star                 = document.getElementById("star");
    if (html_id["star_text"])             var dom_star_text            = document.getElementById("star_text");
    if (html_id["pp"])                    var dom_pp                   = document.getElementById("pp");
    if (html_id["pp_text"])               var dom_pp_text              = document.getElementById("pp_text");
    if (html_id["now_pp"])                var dom_now_pp               = document.getElementById("now_pp");
    if (html_id["now_pp_text"])           var dom_now_pp_text          = document.getElementById("now_pp_text");
    if (html_id["label"])                 var dom_label                = document.getElementById("label");
    if (html_id["label_header"])          var dom_label_header         = document.getElementById("label_header");
    if (html_id["label_footer"])          var dom_label_footer         = document.getElementById("label_footer");
    if (html_id["meta"])                  var dom_meta                 = document.getElementById("meta");
    if (html_id["beatmap"])               var dom_beatmap              = document.getElementById("beatmap");
    if (html_id["cover_group"])           var dom_cover_group          = document.getElementById("cover_group");
    if (html_id["text"])                  var dom_text                 = document.getElementById("text");
    if (html_id["title_subtitle"])        var dom_title_subtitle       = document.getElementById("title_subtitle");
    if (html_id["map_info"])              var dom_map_info             = document.getElementById("map_info");
    if (html_id["map_info_group"])        var dom_map_info_group       = document.getElementById("map_info_group");
    if (html_id["difficulty_group"])      var dom_difficulty_group     = document.getElementById("difficulty_group");
    if (html_id["difficulty_label"])      var dom_difficulty_label     = document.getElementById("difficulty_label");
    
    var httpRequest = new XMLHttpRequest();
    
    function format(number) {
      if (Number.isNaN(number)) {
        return "NaN";
      }
      
      if (Math.floor(number) !== number) {
        return number.toFixed(2);
      }
      
      return number.toString();
    }
    
    return (data) => {
      var beatmap = data.status.beatmap;
      var performance = data.status.performance;
      var time = data.time;
      var mod_data = data.status.mod;
      var visibility = "visible";
      var ip = query.get("ip");
      var diff_time = 0;
      if (ip && ip != "localhost" && ip != "127.0.0.1") {
        diff_time = Date.now() - data.time;
        console.log(diff_time);
      }
      camera_script_update(data);
      now_pp_enable = false;
      timer.start(beatmap.start + diff_time, beatmap.length, mod_data.songSpeedMultiplier);
      mod_instaFail = mod_data.instaFail;
      mod_batteryEnergy = mod_data.batteryEnergy;
      if (mod_data.noFail === true && (typeof performance.softFailed === "undefined")) {
        now_energy = null;
        visibility = "hidden";
        if (html_id["energy"]) dom_energy.innerText = "NF";
      } else {
        if (mod_instaFail === false && mod_batteryEnergy === false) {
          now_energy = 50;
        } else {
          now_energy = 100;
        }
      }
      if (html_id["energy_group"] && energy_display) dom_energy_group.setAttribute("style", `visibility: ${visibility}`);
      if (beatmap.difficulty === "ExpertPlus") {
        beatmap.difficulty = "Expert+";
      }
      if (typeof beatmap.customLabel === "undefined" || beatmap.customLabel.trim() === "") {
        if (html_id["label"])        dom_label.innerText = "";
        if (html_id["label_header"]) dom_label_header.innerText = "";
        if (html_id["label_footer"]) dom_label_footer.innerText = "";
      } else {
        if (html_id["label"])        dom_label.innerText = beatmap.customLabel;
        if (html_id["label_header"]) dom_label_header.innerText = label_header_org;
        if (html_id["label_footer"]) dom_label_footer.innerText = label_footer_org;
      }
      
      if (html_id["image"])    dom_cover.setAttribute("src", `data:image/png;base64,${beatmap.songCover}`);
      
      if (html_id["title"])    dom_title.innerText = beatmap.songName;
      if (html_id["subtitle"]) dom_subtitle.innerText = beatmap.songSubName;
      if (html_id["bsr"])      dom_bsr.innerText = '';
      if (html_id["bsr_text"]) dom_bsr_text.innerText = '';
      
      httpRequest.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
          now_map = this.response;
          if (now_map !== null) {
            if (html_id["bsr"])      dom_bsr.innerText = now_map.id;
            if (html_id["bsr_text"]) dom_bsr_text.innerText = bsr_text_org;
          }
          ex_beatsaver_res.forEach(ex => ex(now_map));
        }
      }
      
      if (pre_songHash === beatmap.songHash) {
        if (bsr_display && now_map !== null) {
          if (html_id["bsr"])      dom_bsr.innerText = now_map.id;
          if (html_id["bsr_text"]) dom_bsr_text.innerText = bsr_text_org;
        }
      } else {
        pre_songHash = beatmap.songHash;
        pre_map = now_map;
        now_map = null;
        if (bsr_display && beatmap.songHash !== null && beatmap.songHash.match(/^[0-9A-F]{40}/i)) {
          httpRequest.open('GET', beatsaver_url + beatmap.songHash.substr(0, 40), true);
          httpRequest.timeout = request_timeout;
          httpRequest.responseType = 'json';
          httpRequest.send(null);
        }
      }
      
      if (html_id["artist"]) dom_artist.innerText = beatmap.songAuthorName;
      if (beatmap.levelAuthorName) {
        if (html_id["mapper_header"]) dom_mapper_header.innerText = mapper_header_org;
        if (html_id["mapper"])        dom_mapper.innerText = beatmap.levelAuthorName;
        if (html_id["mapper_footer"]) dom_mapper_footer.innerText = mapper_footer_org;
      } else {
        if (html_id["mapper_header"]) dom_mapper_header.innerText = "";
        if (html_id["mapper"])        dom_mapper.innerText = "";
        if (html_id["mapper_footer"]) dom_mapper_footer.innerText = "";
      }
      camera_script_show();
      
      if (html_id["difficulty"]) dom_difficulty.innerText = beatmap.difficulty;
      if (html_id["bpm"]) dom_bpm.innerText = format(beatmap.songBPM);
      
      if (beatmap.noteJumpSpeed) {
        if (html_id["njs"]) dom_njs.innerText = format(beatmap.noteJumpSpeed);
        if (html_id["njs_text"]) dom_njs_text.innerText = njs_text_org;
      } else {
        if (html_id["njs"]) dom_njs.innerText = "";
        if (html_id["njs_text"]) dom_njs_text.innerText = "";
      }
      
      if (html_id["mod"]) {
        var mod_text = "";
        if (mod_data.instaFail === true)          mod_text += "IF,";
        if (mod_data.batteryEnergy === true)      mod_text += "BE,";
        if (mod_data.disappearingArrows === true) mod_text += "DA,";
        if (mod_data.ghostNotes === true)         mod_text += "GN,";
        if (mod_data.songSpeed === "Faster")      mod_text += "FS,";
        if (mod_data.songSpeed === "Slower")      mod_text += "SS,";
        if (mod_data.noFail === true)             mod_text += "NF,";
        if (mod_data.obstacles === false)         mod_text += "NO,";
        if (mod_data.noBombs === true)            mod_text += "NB,";
        if (mod_data.noArrows === true)           mod_text += "NA,";
        mod_text = mod_text.slice(0,-1);
        dom_mod.innerText = mod_text;
      }
      
      if (pre_bsr_data === null) {
        if (html_id["pre_bsr"])      dom_pre_bsr.innerText = "";
        if (html_id["pre_bsr_text"]) dom_pre_bsr_text.innerText = "";
      } else {
        if (html_id["pre_bsr"])      dom_pre_bsr.innerText = pre_map.key;
        if (html_id["pre_bsr_text"]) dom_pre_bsr_text.innerText = pre_bsr_text_org;
      }
      
      if (typeof beatmap.pp === "undefined" || beatmap.pp === 0) {
        if (html_id["pp"])      dom_pp.innerText = "";
        if (html_id["pp_text"]) dom_pp_text.innerText = "";
      } else {
        if (html_id["pp"])      dom_pp.innerText = beatmap.pp.toFixed(2);
        if (html_id["pp_text"]) dom_pp_text.innerText = pp_text_org;
      }
      
      if (typeof beatmap.star === "undefined" || beatmap.star === 0) {
        if (html_id["star"])      dom_star.innerText = "";
        if (html_id["star_text"]) dom_star_text.innerText = "";
      } else {
        if (html_id["star"])      dom_star.innerText = beatmap.star.toFixed(2);
        if (html_id["star_text"]) dom_star_text.innerText = star_text_org;
      }
      
      if (html_id["now_pp"])      dom_now_pp.innerText = "";
      if (html_id["now_pp_text"]) dom_now_pp_text.innerText = "";
      
      // ■lrt時のスクロール判定
      // (1) ブラウザの表示幅 < #overlayのleft座標+幅 の時に文字スクロール処理をする
      // (2) #textの幅 - (1)で超えた分 < #title_subtitleの幅 or #artist_groupの幅
      //     #bsr_pp_groupの幅 - (1)で超えた分 < #bsr_ppの幅
      //     #map_info_groupの幅 - (1)で超えた分 < #map_infoの幅
      //     を満たした物が幅を縮めてスクロール対象
      // ■rtl時のスクロール判定
      // (1) #beatmapの幅 < #cover_groupの幅 + #metaの幅 の時に文字スクロール処理をする
      // (2) スクロール対象判定はltrと同じ処理
      // ■スクロール方針
      // ・#title_subtitleは#subtitle_groupを優先でスクロール、min_subtitle_width_ratioの割合以下の場合は#title_groupもスクロール
      // ・#map_infoは#difficulty_groupをスクロール対象とする。
      if (html_id["overlay"] && html_id["subtitle"] && html_id["subtitle_group"] && html_id["title"]
          && html_id["title_group"] && html_id["artist_group"] && html_id["artist_mapper_group"]
          && html_id["difficulty_group"] && html_id["difficulty_label"] && html_id["beatmap"]
          && html_id["cover_group"] && html_id["artist_mapper"] && html_id["title_subtitle"]
          && html_id["map_info"] && html_id["titles"]) {
        dom_subtitle_group.style.width = "";
        dom_subtitle.classList.remove("scroll")
        dom_title_group.style.width = "";
        dom_title.classList.remove("scroll")
        dom_artist_mapper_group.style.width = "";
        dom_artist_group.classList.remove("scroll")
        dom_difficulty_group.style.width = "";
        dom_difficulty_label.classList.remove("scroll")
        if (rtl_display) {
          var base_width = dom_beatmap.offsetWidth;
          var check_width = dom_cover_group.offsetWidth + dom_meta.offsetWidth;
          dom_artist_mapper.style.display = "inline-block";
        } else {
          var base_width = document.documentElement.offsetWidth;
          var check_width = dom_overlay.getBoundingClientRect().left + dom_overlay.offsetWidth;
        }
        if (base_width < check_width) {
          var over_width = check_width - base_width;
          var title_subtitle_over_width = dom_title_subtitle.offsetWidth - dom_text.offsetWidth + over_width;
          var artist_group_over_width   = dom_artist_group.offsetWidth - dom_artist_mapper_group.offsetWidth + over_width;
          var map_info_over_width       = dom_map_info.offsetWidth - dom_map_info_group.offsetWidth + over_width;
          if (title_subtitle_over_width > 0) {
            if (typeof beatmap.songSubName === "undefined" || beatmap.songSubName === null || beatmap.songSubName.trim() === "") {
              var subtitle_width_down = 0;
            } else {
              var subtitle_width_down = title_subtitle_over_width;
              var change_subtitle_width = dom_subtitle.offsetWidth - subtitle_width_down;
              if (change_subtitle_width / (dom_titles.offsetWidth - title_subtitle_over_width) < min_subtitle_width_ratio) {
                var before_change_subtitle_width = change_subtitle_width;
                change_subtitle_width = (dom_titles.offsetWidth - title_subtitle_over_width) * min_subtitle_width_ratio;
                subtitle_width_down -= change_subtitle_width - before_change_subtitle_width;
              }
              dom_subtitle_group.style.width = `${change_subtitle_width}px`;
              dom_subtitle.classList.add("scroll")
            }
            if (title_subtitle_over_width - subtitle_width_down > 0) {
              dom_title_group.style.width = `${dom_title_group.offsetWidth - title_subtitle_over_width + subtitle_width_down}px`;
              dom_title.classList.add("scroll")
            }
          }
          if (artist_group_over_width > 0) {
            dom_artist_mapper_group.style.width = `${dom_artist_group.offsetWidth - artist_group_over_width}px`;
            dom_artist_group.classList.add("scroll")
            if (rtl_display) {
              dom_artist_mapper.style.display = "block";
            }
          }
          if (map_info_over_width > 0) {
            dom_difficulty_group.style.width = `${dom_difficulty_group.offsetWidth - map_info_over_width}px`;
            dom_difficulty_label.classList.add("scroll")
          }
        }
      }
      ex_beatmap.forEach(ex => ex(data,now_map,pre_map));
    }
  })();
  
  return {
    hide() {
      if (html_id["overlay"]) main.classList.add("hidden");
      ex_hide.forEach(ex => ex());
    },
    
    show() {
      if (html_id["overlay"]) main.classList.remove("hidden");
      ex_show.forEach(ex => ex());
    },
    
    camera_script_update,
    camera_script_clear,
    performance,
    timer,
    beatmap
  }
})();
