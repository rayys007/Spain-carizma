(function(){
  document.documentElement.classList.add("js");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- i18n ---------- */
  var EN = {}, nodes = document.querySelectorAll("[data-i18n]"), phNodes = document.querySelectorAll("[data-i18n-ph]");
  Array.prototype.forEach.call(nodes, function(el){ var k = el.getAttribute("data-i18n"); if(!(k in EN)) EN[k] = el.innerHTML; });
  Array.prototype.forEach.call(phNodes, function(el){ EN[el.getAttribute("data-i18n-ph")] = el.getAttribute("placeholder"); });
  for(var k in T.en){ EN[k] = T.en[k]; }
  var LANG = "en";
  function t(key){ var d = T[LANG]; return (d && d[key] != null) ? d[key] : EN[key]; }
  function buildServiceOptions(){
    var sel = document.getElementById("f-svc"), cur = sel.selectedIndex;
    sel.innerHTML = "";
    var o0 = document.createElement("option"); o0.textContent = t("form.svc.0"); sel.appendChild(o0);
    for(var i = 1; i <= 11; i++){ var o = document.createElement("option"); o.textContent = (i < 10 ? "0" + i : "" + i) + " " + t("svc." + i + ".t"); sel.appendChild(o); }
    sel.selectedIndex = cur > 0 ? cur : 0;
  }
  function setLang(lang){
    if(!T[lang] && lang !== "en") lang = "en";
    LANG = lang;
    Array.prototype.forEach.call(nodes, function(el){ var v = t(el.getAttribute("data-i18n")); if(v != null) el.innerHTML = v; });
    Array.prototype.forEach.call(phNodes, function(el){ var v = t(el.getAttribute("data-i18n-ph")); if(v != null) el.setAttribute("placeholder", v); });
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    buildServiceOptions();
    document.getElementById("langcur").textContent = lang.toUpperCase();
    Array.prototype.forEach.call(document.querySelectorAll("#langmenu li"), function(li){ li.setAttribute("aria-selected", String(li.getAttribute("data-lang") === lang)); });
    try{ localStorage.setItem("sc-lang", lang); }catch(e){}
    if(!document.getElementById("verdict").hidden) renderVerdict();
  }
  (function dropdown(){
    var btn = document.getElementById("langbtn"), menu = document.getElementById("langmenu"), items = menu.querySelectorAll("li");
    function open(){ menu.hidden = false; btn.setAttribute("aria-expanded","true"); var cur = menu.querySelector('[aria-selected="true"]'); (cur || items[0]).focus(); }
    function close(focusBtn){ menu.hidden = true; btn.setAttribute("aria-expanded","false"); if(focusBtn) btn.focus(); }
    btn.addEventListener("click", function(){ menu.hidden ? open() : close(false); });
    Array.prototype.forEach.call(items, function(li){
      li.addEventListener("click", function(){ setLang(li.getAttribute("data-lang")); close(true); });
    });
    menu.addEventListener("keydown", function(e){
      var list = Array.prototype.slice.call(items), i = list.indexOf(document.activeElement);
      if(e.key === "ArrowDown"){ e.preventDefault(); list[(i+1) % list.length].focus(); }
      else if(e.key === "ArrowUp"){ e.preventDefault(); list[(i-1+list.length) % list.length].focus(); }
      else if(e.key === "Enter" || e.key === " "){ e.preventDefault(); if(i >= 0){ setLang(list[i].getAttribute("data-lang")); close(true); } }
      else if(e.key === "Escape"){ close(true); }
    });
    document.addEventListener("click", function(e){ if(!menu.hidden && !document.getElementById("langdd").contains(e.target)) close(false); });
    document.addEventListener("keydown", function(e){ if(e.key === "Escape" && !menu.hidden) close(true); });
  })();
  var saved = null; try{ saved = localStorage.getItem("sc-lang"); }catch(e){}
  if(!saved){ var nav = (navigator.language || "en").slice(0,2).toLowerCase(); if(T[nav]) saved = nav; }
  setLang(saved || "en");

  /* ---------- flag video ---------- */
  (function flagVideo(){
    var a = document.getElementById("v1"), b = document.getElementById("v2"); if(!a || !b) return;
    var FADE = 1.4, cur = a, nxt = b, armed = false;
    function play(v){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
    function onTime(){
      if(this !== cur || !cur.duration || armed) return;
      if(cur.currentTime >= cur.duration - FADE){
        armed = true;
        nxt.currentTime = 0; play(nxt); nxt.classList.add("on"); cur.classList.remove("on");
        setTimeout(function(){ cur.pause(); var x = cur; cur = nxt; nxt = x; armed = false; }, FADE*1000);
      }
    }
    a.addEventListener("timeupdate", onTime); b.addEventListener("timeupdate", onTime);
    a.classList.add("on");
    if(reduce){ a.currentTime = 0.5; } else { play(a); }
    document.addEventListener("visibilitychange", function(){ if(reduce) return; if(document.hidden) cur.pause(); else play(cur); });
  })();

  /* ---------- reveal, counters, steps ---------- */
  var rv = Array.prototype.slice.call(document.querySelectorAll(".rv"));
  function showAll(){ rv.forEach(function(el){ el.classList.add("in"); }); }
  if(!("IntersectionObserver" in window) || reduce){ showAll(); }
  else{
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ e.target.classList.toggle("in", e.isIntersecting); });
    }, {rootMargin:"0px 0px -6% 0px", threshold:0.08});
    rv.forEach(function(el){ io.observe(el); });
  }
  function count(){
    Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function(el){
      var end = +el.getAttribute("data-count"), t0 = null;
      if(reduce){ el.textContent = end; return; }
      function tick(ts){ if(!t0) t0 = ts; var p = Math.min(1,(ts-t0)/900); p = 1-Math.pow(1-p,3);
        el.textContent = Math.round(end*p); if(p<1) requestAnimationFrame(tick); }
      requestAnimationFrame(tick);
    });
  }
  var stats = document.querySelector(".stats");
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(en){ if(en[0].isIntersecting){ count(); }
      else { Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function(el){ el.textContent = "0"; }); } }, {threshold:.3}).observe(stats);
  } else count();
  var tl = document.getElementById("tl");
  if("IntersectionObserver" in window){
    new IntersectionObserver(function(en){ tl.classList.toggle("go", en[0].isIntersecting); }, {threshold:.3}).observe(tl);
  } else tl.classList.add("go");

  /* ---------- tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  Array.prototype.forEach.call(tabs, function(tb){
    tb.addEventListener("click", function(){
      Array.prototype.forEach.call(tabs, function(x){ x.setAttribute("aria-selected","false");
        document.getElementById(x.getAttribute("aria-controls")).hidden = true; });
      tb.setAttribute("aria-selected","true");
      var p = document.getElementById(tb.getAttribute("aria-controls")); p.hidden = false;
      Array.prototype.forEach.call(p.querySelectorAll(".scard"), function(c){ c.style.animation="none"; void c.offsetWidth; c.style.animation=""; });
    });
  });
  document.addEventListener("click", function(e){
    var a = e.target.closest('a[href^="#s-"]'); if(!a) return;
    var target = document.querySelector(a.getAttribute("href")); if(!target) return;
    var panel = target.closest(".panel"); if(panel && panel.hidden){ document.getElementById(panel.getAttribute("aria-labelledby")).click(); }
  });

  /* ---------- eligibility quiz ---------- */
  var cards = {nomad:"s-nomad", nonlucrative:"s-nonlucrative", hqp:"s-hqp", ict:"s-ict", selfemployed:"s-selfemployed", student:"s-student", family:"s-family"};
  var answers = {}, step = 1;
  var quiz = document.getElementById("quiz"), prog = document.getElementById("prog"),
      verdict = document.getElementById("verdict"), back = document.getElementById("qback");
  function show(n){
    step = n;
    Array.prototype.forEach.call(quiz.querySelectorAll(".qstep"), function(s){ s.hidden = (+s.getAttribute("data-step") !== n); });
    verdict.hidden = n !== 4;
    back.hidden = n === 1;
    prog.style.width = (n === 4 ? 100 : n*33) + "%";
  }
  quiz.addEventListener("click", function(e){
    var b = e.target.closest(".opt"); if(!b) return;
    var group = b.parentNode;
    Array.prototype.forEach.call(group.querySelectorAll(".opt"), function(o){ o.setAttribute("aria-pressed","false"); });
    b.setAttribute("aria-pressed","true");
    answers[group.getAttribute("data-key")] = b.getAttribute("data-v");
    setTimeout(function(){ if(step < 3) show(step+1); else result(); }, 240);
  });
  back.addEventListener("click", function(){ show(Math.max(1, step === 4 ? 3 : step-1)); });
  function renderVerdict(){
    var g = answers.goal;
    verdict.innerHTML =
      '<span class="badge">' + t("quiz.badge") + '</span>' +
      '<h3>' + t("r." + g + ".t") + '</h3><p>' + t("r." + g + ".w") + '</p>' +
      '<div class="next"><div><b>1</b><span>' + t("w." + answers.where) + '</span></div>' +
      '<div><b>2</b><span>' + t("f." + answers.family) + '</span></div>' +
      '<div><b>3</b><span>' + t("quiz.step3") + '</span></div></div>' +
      '<div class="cta"><a class="btn" href="#contact">' + t("quiz.cta1") + '</a><a class="btn outline-navy" href="#' + cards[g] + '">' + t("quiz.cta2") + '</a></div>';
  }
  function result(){
    renderVerdict();
    show(4);
    quiz.scrollIntoView({block:"nearest", behavior: reduce ? "auto" : "smooth"});
  }

  /* ---------- copy + form ---------- */
  function copy(text, btn){
    var old = btn.textContent;
    function ok(){ btn.textContent = t("copy.done"); setTimeout(function(){ btn.textContent = old; }, 1800); }
    function fail(){ btn.textContent = t("copy.fail"); setTimeout(function(){ btn.textContent = old; }, 2600); }
    try{ navigator.clipboard.writeText(text).then(ok, fail); }catch(err){ fail(); }
  }
  document.getElementById("copybtn").addEventListener("click", function(){ copy(document.getElementById("addr").textContent.trim(), this); });
  var form = document.getElementById("form"), sent = document.getElementById("sent"), summary = document.getElementById("summary");
  form.addEventListener("submit", function(e){
    e.preventDefault();
    var v = function(id){ return (document.getElementById(id).value || "—").trim(); };
    var lbl = function(k){ return t(k).replace(/\s*\*$/, ""); };
    summary.value = t("summary.title") + "\n\n" + lbl("form.name") + ": " + v("f-name") + "\n" + lbl("form.email") + ": " + v("f-email") +
      "\n" + lbl("form.phone") + ": " + v("f-phone") + "\n" + lbl("form.country") + ": " + v("f-country") + "\n" + lbl("form.svc") + ": " + document.getElementById("f-svc").value +
      "\n\n" + lbl("form.msg") + ":\n" + v("f-msg") + "\n";
    form.hidden = true; sent.hidden = false;
  });
  document.getElementById("copysum").addEventListener("click", function(){ copy(summary.value, this); });
  document.getElementById("backbtn").addEventListener("click", function(){ sent.hidden = true; form.hidden = false; });
})();
