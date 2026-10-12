/* ============================================================
   PAGE BUILDER

   Reads the SITE object from data.js and writes the page.
   No frameworks, no classes — just small named functions.

   Order of business:
     1. Small helpers
     2. Simple text fields
     3. Hero
     4. Work: featured build + record log
     5. Skills
     6. Note
     7. Education, now, contact
     8. Nav highlighting
     9. Start
   ============================================================ */


/* ---------- 1. Small helpers ------------------------------ */

/* Make an element. el("p", "prose", "Hello") */
function el(tag, className, text) {
  var node = document.createElement(tag);
  if (className) { node.className = className; }
  if (text) { node.textContent = text; }
  return node;
}

/* Turn a project name into an id we can link to. */
function slug(text) {
  return "build-" + String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* An external link to a live build. */
function liveLink(url, label) {
  var a = el("a", null, label);
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener";
  return a;
}

/* Build the "What I built / Stack / ..." blocks. */
function detailBlocks(list) {
  var wrap = el("div", "blocks");
  (list || []).forEach(function (item) {
    var group = el("div", "block");
    group.appendChild(el("h4", "block__label", item.label));
    group.appendChild(el("p", "block__body", item.body));
    wrap.appendChild(group);
  });
  return wrap;
}


/* ---------- 2. Simple text fields ------------------------- */
/* Anything in the HTML with data-fill="key" gets filled here. */

function fillTextFields() {
  var values = {
    name: SITE.identity.name,
    roleLine: SITE.identity.roleLine,
    intro: SITE.identity.intro,
    location: SITE.identity.location,
    now: SITE.now
  };

  var nodes = document.querySelectorAll("[data-fill]");
  var i;
  for (i = 0; i < nodes.length; i++) {
    var key = nodes[i].getAttribute("data-fill");
    if (values[key]) { nodes[i].textContent = values[key]; }
  }

  document.title = SITE.identity.name + " — " + SITE.identity.roleLine;
}


/* ---------- 3. Hero --------------------------------------- */

function buildHeadline() {
  var target = document.getElementById("headline");
  SITE.identity.headline.forEach(function (line) {
    target.appendChild(el("span", "line", line));
  });
}

function buildTracks() {
  var target = document.getElementById("tracks");
  SITE.tracks.forEach(function (track) {
    var box = el("div", "track");
    box.appendChild(el("h2", null, track.title));
    box.appendChild(el("p", null, track.body));
    target.appendChild(box);
  });
}

function wireHeroEmail() {
  var button = document.getElementById("heroEmail");
  var address = SITE.contact.email;
  if (address && address.indexOf("@") > -1 && address !== "you@example.com") {
    button.href = "mailto:" + address;
  }
}


/* ---------- 4. Work --------------------------------------- */

function buildFeatured(project) {
  var panel = el("article", "feature");
  panel.id = slug(project.name);

  var top = el("div", "feature__top");
  top.appendChild(el("h3", "feature__name", project.name));
  top.appendChild(el("span", "chip", project.status));
  panel.appendChild(top);

  panel.appendChild(el("p", "feature__kind", project.kind));
  panel.appendChild(el("p", "feature__summary", project.summary));

  /* the ticket lifecycle, drawn as the sequence it actually is */
  if (project.stages && project.stages.length) {
    var flow = el("div", "flow");
    project.stages.forEach(function (stage) {
      var step = el("div", "flow__step");
      step.appendChild(el("span", "flow__dot"));
      step.appendChild(document.createTextNode(stage));
      flow.appendChild(step);
    });
    panel.appendChild(flow);
  }

  panel.appendChild(detailBlocks(project.detail));

  var foot = el("div", "feature__foot");
  if (project.url) {
    var open = liveLink(project.url, "Open " + project.name);
    open.className = "button button--solid";
    foot.appendChild(open);
  }
  panel.appendChild(foot);

  document.getElementById("featured").appendChild(panel);
}

function buildRecord(project) {
  var record = el("article", "record");
  record.id = slug(project.name);

  /* the row you click */
  var head = el("button", "record__head");
  head.type = "button";
  head.setAttribute("aria-expanded", "false");
  head.appendChild(el("span", "record__name", project.name));
  head.appendChild(el("span", "record__kind", project.kind));
  head.appendChild(el("span", "record__sign"));

  /* the part that opens */
  var panel = el("div", "record__panel");
  var scroll = el("div", null, null);
  var inner = el("div", "record__inner");

  inner.appendChild(el("p", "record__summary", project.summary));
  inner.appendChild(detailBlocks(project.detail));

  var links = el("p", "record__links");
  if (project.url) {
    var open = liveLink(project.url, "Open the live build");
    open.className = "button";
    links.appendChild(open);
  } else {
    links.className = "record__links record__nolink";
    links.textContent = "No live link for this one — happy to walk through the code.";
  }
  inner.appendChild(links);

  scroll.appendChild(inner);
  panel.appendChild(scroll);

  var panelId = record.id + "-panel";
  panel.id = panelId;
  head.setAttribute("aria-controls", panelId);

  head.addEventListener("click", function () {
    toggleRecord(record);
  });

  record.appendChild(head);
  record.appendChild(panel);
  document.getElementById("log").appendChild(record);
}

function toggleRecord(record, forceOpen) {
  var head = record.querySelector(".record__head");
  var open = forceOpen === true ? true : !record.classList.contains("is-open");
  record.classList.toggle("is-open", open);
  head.setAttribute("aria-expanded", open ? "true" : "false");
}

function buildWork() {
  var featured = null;
  var rest = [];

  SITE.projects.forEach(function (project) {
    if (project.featured && !featured) { featured = project; }
    else { rest.push(project); }
  });

  if (featured) { buildFeatured(featured); }
  rest.forEach(buildRecord);

  var live = SITE.projects.filter(function (p) { return p.url; }).length;
  document.getElementById("workMeta").textContent =
    SITE.projects.length + " builds, " + live + " of them live. Open a row to see what I actually did on it.";
}


/* ---------- 5. Skills ------------------------------------- */

function levelClass(level) {
  if (level === "Using daily") { return "skill__level is-daily"; }
  if (level === "Comfortable") { return "skill__level is-comfortable"; }
  return "skill__level";
}

function buildSkills() {
  var target = document.getElementById("skills-list");

  SITE.skills.forEach(function (group) {
    var box = el("section", "skill-group");
    box.appendChild(el("h3", "skill-group__name", group.group));

    group.items.forEach(function (item) {
      var row = el("div", "skill");
      row.appendChild(el("h4", "skill__name", item.name));
      row.appendChild(el("p", "skill__note", item.note));

      var level = el("span", levelClass(item.level));
      level.appendChild(el("span", "dot"));
      level.appendChild(document.createTextNode(item.level));
      row.appendChild(level);

      if (item.shown) {
        var shown = el("p", "skill__shown");
        var link = el("a", null, "Shown in " + item.shown);
        link.href = "#" + slug(item.shown);
        link.addEventListener("click", function () { openBuild(item.shown); });
        shown.appendChild(link);
        row.appendChild(shown);
      }

      box.appendChild(row);
    });

    target.appendChild(box);
  });
}

/* Jumping to a build from the skills list should open it too. */
function openBuild(name) {
  var record = document.getElementById(slug(name));
  if (record && record.classList.contains("record")) {
    toggleRecord(record, true);
  }
}


/* ---------- 6. Note --------------------------------------- */

function buildNote() {
  var target = document.getElementById("note-block");
  target.appendChild(el("p", "note__title", SITE.note.title));
  target.appendChild(el("p", "note__lead", SITE.note.lead));

  var body = el("div", "note__body");
  SITE.note.body.forEach(function (paragraph) {
    body.appendChild(el("p", null, paragraph));
  });
  target.appendChild(body);
}


/* ---------- 7. Contact ------------------------------------- */

function buildContact() {
  var target = document.getElementById("contact-block");
  target.appendChild(el("p", "contact__avail", SITE.contact.availability));

  var address = SITE.contact.email;
  var mail = el("a", "contact__email", address);
  mail.href = "mailto:" + address;
  target.appendChild(mail);

  /* GitHub and LinkedIn only appear if you put a URL in data.js */
  var extras = el("p", "contact__links");
  if (SITE.contact.github) { extras.appendChild(liveLink(SITE.contact.github, "GitHub")); }
  if (SITE.contact.linkedin) { extras.appendChild(liveLink(SITE.contact.linkedin, "LinkedIn")); }
  if (extras.childNodes.length) { target.appendChild(extras); }
}


/* ---------- 8. Nav highlighting ---------------------------- */
/* Marks the nav link for whichever section you are looking at. */

function watchSections() {
  if (!("IntersectionObserver" in window)) { return; }

  var links = document.querySelectorAll(".bar__nav a");
  var watcher = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) { return; }
      var id = entry.target.id;
      var i;
      for (i = 0; i < links.length; i++) {
        links[i].classList.toggle("is-current", links[i].getAttribute("href") === "#" + id);
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  ["work", "skills", "note", "contact"].forEach(function (id) {
    var section = document.getElementById(id);
    if (section) { watcher.observe(section); }
  });
}


/* ---------- 9. Start --------------------------------------- */

function buildPage() {
  fillTextFields();
  buildHeadline();
  buildTracks();
  wireHeroEmail();
  buildWork();
  buildSkills();
  buildNote();
  buildContact();
  watchSections();
}

document.addEventListener("DOMContentLoaded", buildPage);
