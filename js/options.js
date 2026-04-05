const query = new URLSearchParams(location.search);
var bsr_display = false;
var disp_hidden = true;
var energy_display = false;
var rtl_display = false;
var pre_bsr_data = null;
const check_id = ["overlay","rank","percentage","combo","score","progress","energy_area",
                  "image","title","subtitle","artist","difficulty","bpm","njs","bsr","bsr_text",
                  "mapper","mapper_header","mapper_footer","song_time","song_length","mod","miss",
                  "pre_bsr","pre_bsr_text","njs_text","energy","energy_bar","energy_group",
                  "now_pp","now_pp_text","star","star_text","pp","pp_text","label_header",
                  "label_footer","label","subtitle_group","title_group","titles","bsr-group","meta",
                  "beatmap","cover_group","artist_group","artist_group","text","title_subtitle",
                  "artist_mapper_group","map_info","map_info_group","difficulty_group",
                  "difficulty_label","artist_mapper","camera_mapper_header","camera_mapper"]
var html_id = {};
for (var i = 0, len = check_id.length; i < len; ++i) {
  if (document.getElementById(check_id[i]) === null) {
    html_id[check_id[i]] = false;
  } else {
    html_id[check_id[i]] = true;
  }
}
if (html_id["mapper_header"]) var mapper_header_org = document.getElementById("mapper_header").textContent;
if (html_id["mapper_footer"]) var mapper_footer_org = document.getElementById("mapper_footer").textContent;
if (html_id["bsr_text"])      var bsr_text_org      = document.getElementById("bsr_text").textContent;
if (html_id["pre_bsr_text"])  var pre_bsr_text_org  = document.getElementById("pre_bsr_text").textContent;
if (html_id["njs_text"])      var njs_text_org      = document.getElementById("njs_text").textContent;
if (html_id["now_pp_text"])   var now_pp_text_org   = document.getElementById("now_pp_text").textContent;
if (html_id["star_text"])     var star_text_org     = document.getElementById("star_text").textContent;
if (html_id["pp_text"])       var pp_text_org       = document.getElementById("pp_text").textContent;
if (html_id["label_header"])  var label_header_org  = document.getElementById("label_header").textContent;
if (html_id["label_footer"])  var label_footer_org  = document.getElementById("label_footer").textContent;

if (typeof op_performance !== "undefined") ex_performance.push((data,now_energy) => {
  op_performance(data,now_energy);
});
if (typeof op_timer_update !== "undefined") ex_timer_update.push((time, delta, progress, percentage) => {
  op_timer_update(time, delta, progress, percentage);
});
if (typeof op_timer_update_sec !== "undefined") ex_timer_update_sec.push((time, delta, progress, percentage) => {
  op_timer_update_sec(time, delta, progress, percentage);
});
if (typeof op_beatmap !== "undefined") ex_beatmap.push((data,now_map,pre_map) => {
  op_beatmap(data,now_map,pre_map);
});
if (typeof op_beatsaver_res !== "undefined") ex_beatsaver_res.push((now_map) => {
  op_beatsaver_res(now_map);
});
if (typeof op_hide !== "undefined") ex_hide.push(() => {
  op_hide();
});
if (typeof op_show !== "undefined") ex_show.push(() => {
  op_show();
});
if (typeof op_hello !== "undefined") ex_hello.push((data) => {
  op_hello(data);
});
if (typeof op_songStart !== "undefined") ex_songStart.push((data) => {
  op_songStart(data);
});
if (typeof op_noteCut !== "undefined") ex_noteCut.push((data) => {
  op_noteCut(data);
});
if (typeof op_noteFullyCut !== "undefined") ex_noteFullyCut.push((data) => {
  op_noteFullyCut(data);
});
if (typeof op_obstacleEnter !== "undefined") ex_obstacleEnter.push((data) => {
  op_obstacleEnter(data);
});
if (typeof op_obstacleExit !== "undefined") ex_obstacleExit.push((data) => {
  op_obstacleExit(data);
});
if (typeof op_noteMissed !== "undefined") ex_noteMissed.push((data) => {
  op_noteMissed(data);
});
if (typeof op_bombCut !== "undefined") ex_bombCut.push((data) => {
  op_bombCut(data);
});
if (typeof op_finished !== "undefined") ex_finished.push((data) => {
  op_finished(data);
});
if (typeof op_failed !== "undefined") ex_failed.push((data) => {
  op_failed(data);
});
if (typeof op_softFailed !== "undefined") ex_softFailed.push((data) => {
  op_softFailed(data);
});
if (typeof op_scoreChanged !== "undefined") ex_scoreChanged.push((data) => {
  op_scoreChanged(data);
});
if (typeof op_energyChanged !== "undefined") ex_energyChanged.push((data) => {
  op_energyChanged(data);
});
if (typeof op_pause !== "undefined") ex_pause.push((data) => {
  op_pause(data);
});
if (typeof op_resume !== "undefined") ex_resume.push((data) => {
  op_resume(data);
});
if (typeof op_menu !== "undefined") ex_menu.push((data) => {
  op_menu(data);
});

(() => {
  const handlers = {
    modifiers(string) {
      string.split(",").forEach((modifier) => {
        if (modifier === "no-hidden") {
          disp_hidden = false;
          if (html_id["overlay"]) document.getElementById("overlay").classList.remove("hidden");
          return;
        }
        if (modifier === "bsr" || modifier === "all") {
          bsr_display = true;
        }
        if (modifier === "energy" || modifier === "all") {
          energy_display = true;
        }
        if (modifier === "rtl") {
          rtl_display = true;
        }
        var link = document.createElement("link");
        
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", `./modifiers/${modifier}.css`);
        
        document.head.appendChild(link);
      });
    }
  };
  
  Object.keys(handlers).forEach((key) => {
    var value = query.get(key);
    
    if (value) {
      handlers[key](value);
    }
  });
  
  if (location.hash) {
    // Legacy URL hash support
    handlers.modifiers(location.hash.slice(1));
  }
  
})();
