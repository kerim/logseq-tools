/* app.js — Logseq Tools showcase page
   Vanilla JS, no framework, no dependencies.
   node --check clean. */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     Constants
  ---------------------------------------------------------- */
  var GITHUB_API = 'https://api.github.com/users/kerim/repos?per_page=100&sort=pushed';
  var PROJECTS_URL = 'projects.json';

  /* ----------------------------------------------------------
     Badge class map
  ---------------------------------------------------------- */
  var BADGE_CLASS = {
    'Logseq CLI':       'badge--cli',
    'Logseq HTTP API':  'badge--http',
    'Logseq Plugin':    'badge--plugin',
    'Standalone utility': 'badge--standalone'
  };

  /* ----------------------------------------------------------
     Date formatting helper — used for both fallback and live paths
  ---------------------------------------------------------- */
  function formatDate(isoString) {
    if (!isoString) return '';
    try {
      var d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  /* ----------------------------------------------------------
     Create a single panel <article> element
  ---------------------------------------------------------- */
  function createPanel(project) {
    var article = document.createElement('article');
    article.className = 'panel';
    article.dataset.repo = project.name;

    // Title
    var h2 = document.createElement('h2');
    h2.className = 'panel-title';
    h2.textContent = project.title;

    // Description
    var desc = document.createElement('p');
    desc.className = 'panel-description';
    desc.textContent = project.description;

    // Badge row
    var badgeRow = document.createElement('div');
    badgeRow.className = 'badge-row';

    var srPrefix = document.createElement('span');
    srPrefix.className = 'badge-prefix';
    srPrefix.textContent = 'Integration: ';

    var badge = document.createElement('span');
    var badgeClass = BADGE_CLASS[project.integration] || '';
    badge.className = 'badge ' + badgeClass;
    badge.textContent = project.integration;

    badgeRow.appendChild(srPrefix);
    badgeRow.appendChild(badge);

    // Runtime line
    var runtime = document.createElement('p');
    runtime.className = 'panel-runtime';
    runtime.textContent = project.runtime;

    // Last-updated line
    var updatedLine = document.createElement('p');
    updatedLine.className = 'panel-updated';

    var timeEl = document.createElement('time');
    var fallbackFormatted = formatDate(project.fallbackUpdated);
    timeEl.setAttribute('datetime', project.fallbackUpdated || '');
    timeEl.textContent = fallbackFormatted || project.fallbackUpdated || '';
    timeEl.dataset.repoName = project.name;

    var updatedLabel = document.createTextNode('Updated ');
    updatedLine.appendChild(updatedLabel);
    updatedLine.appendChild(timeEl);

    // Repo link button
    var link = document.createElement('a');
    link.className = 'btn';
    link.href = project.repo;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', 'Open ' + project.title + ' on GitHub');

    var btnIcon = document.createElement('span');
    btnIcon.className = 'btn-icon';
    btnIcon.setAttribute('aria-hidden', 'true');
    btnIcon.textContent = '↗';

    var btnText = document.createTextNode('View on GitHub');
    link.appendChild(btnIcon);
    link.appendChild(btnText);

    // Assemble
    article.appendChild(h2);
    article.appendChild(desc);
    article.appendChild(badgeRow);
    article.appendChild(runtime);
    article.appendChild(updatedLine);
    article.appendChild(link);

    return article;
  }

  /* ----------------------------------------------------------
     Render all panels into #grid
  ---------------------------------------------------------- */
  function renderPanels(projects) {
    var grid = document.getElementById('grid');
    if (!grid) return;
    while (grid.firstChild) { grid.removeChild(grid.firstChild); }
    projects.forEach(function (project) {
      grid.appendChild(createPanel(project));
    });
  }

  /* ----------------------------------------------------------
     Update dates from GitHub API response
  ---------------------------------------------------------- */
  function applyLiveDates(repos, projects) {
    // Build name → pushed_at map
    var pushMap = {};
    repos.forEach(function (repo) {
      if (repo.name && repo.pushed_at) {
        pushMap[repo.name] = repo.pushed_at;
      }
    });

    // Update each panel's <time> element
    projects.forEach(function (project) {
      var pushedAt = pushMap[project.name];
      if (!pushedAt) return;

      var formatted = formatDate(pushedAt);
      if (!formatted) return;

      // Find the <time> element for this repo.
      // CSS.escape guards against any special chars in the repo name so the
      // selector can never throw a SyntaxError (preserves the "never throws"
      // guarantee even if project data changes later).
      var safeName = (window.CSS && CSS.escape) ? CSS.escape(project.name) : project.name;
      var timeEls = document.querySelectorAll('time[data-repo-name="' + safeName + '"]');
      timeEls.forEach(function (el) {
        el.setAttribute('datetime', pushedAt);
        el.textContent = formatted;
      });
    });

    // Update footer note
    var note = document.getElementById('footer-date-note');
    if (note) {
      note.textContent = 'Last-updated dates fetched live from GitHub';
      note.style.fontStyle = 'normal';
    }
  }

  /* ----------------------------------------------------------
     Fetch live dates from GitHub — one call, try/catch wrapped
  ---------------------------------------------------------- */
  function fetchLiveDates(projects) {
    try {
      fetch(GITHUB_API)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('HTTP ' + response.status);
          }
          return response.json();
        })
        .then(function (repos) {
          if (!Array.isArray(repos)) return;
          applyLiveDates(repos, projects);
        })
        .catch(function () {
          // Silently keep fallback dates — don't surface errors to the user
        });
    } catch (e) {
      // Synchronous errors (e.g. fetch not available) — silently keep fallback dates
    }
  }

  /* ----------------------------------------------------------
     Theme toggle logic
  ---------------------------------------------------------- */
  function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;

    function updateToggleUI(theme) {
      var isDark = theme === 'dark';
      var icon = btn.querySelector('.toggle-icon');
      var label = btn.querySelector('.toggle-label');
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      if (icon) icon.textContent = isDark ? '☀' : '☾';
      if (label) label.textContent = isDark ? 'Light mode' : 'Dark mode';
    }

    // Sync UI with the current theme (set by the inline head script)
    var current = document.documentElement.getAttribute('data-theme') || 'light';
    updateToggleUI(current);

    btn.addEventListener('click', function () {
      var now = document.documentElement.getAttribute('data-theme') || 'light';
      var next = now === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateToggleUI(next);
    });
  }

  /* ----------------------------------------------------------
     Boot
  ---------------------------------------------------------- */
  function init() {
    initThemeToggle();

    fetch(PROJECTS_URL)
      .then(function (response) {
        if (!response.ok) throw new Error('Could not load projects.json');
        return response.json();
      })
      .then(function (projects) {
        if (!Array.isArray(projects)) throw new Error('projects.json is not an array');

        // 1. Render panels immediately with fallback dates
        renderPanels(projects);

        // 2. Fire live date fetch (non-blocking)
        fetchLiveDates(projects);
      })
      .catch(function (err) {
        var grid = document.getElementById('grid');
        if (grid) {
          var msg = document.createElement('p');
          msg.style.cssText = 'padding:2rem; color:var(--text-muted); text-align:center;';
          msg.textContent = 'Could not load projects. Please try refreshing the page.';
          grid.appendChild(msg);
        }
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
