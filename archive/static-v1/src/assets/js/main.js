/* CIASO site behaviour. Vanilla JS, progressive enhancement: every page works without it. */
(function () {
  'use strict';

  var config = window.CIASO_CONFIG || { email: 'admin@ciaso.ca', formEndpoints: {} };

  /* ---------- Analytics hook (no-op unless an analytics tool is configured) ---------- */
  function track(name, data) {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: name }, data || {}));
    }
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-track]');
    if (el) track(el.getAttribute('data-track'), { href: el.getAttribute('href') || '' });
  });

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-nav-panel]');
  if (toggle && panel) {
    var label = toggle.querySelector('.nav-toggle__label');
    var setOpen = function (open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close' : 'Menu';
      panel.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      if (open) {
        var rect = header.getBoundingClientRect();
        panel.style.setProperty('--nav-top', Math.max(rect.bottom, 0) + 'px');
        var first = panel.querySelector('a');
        if (first) first.focus();
      } else if (returnFocus) {
        toggle.focus();
      }
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false, true);
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    // Keep focus inside the open menu (menu + toggle)
    document.addEventListener('focusin', function (e) {
      if (!panel.classList.contains('is-open')) return;
      if (!panel.contains(e.target) && e.target !== toggle && !e.target.closest('.site-header')) {
        var first = panel.querySelector('a');
        if (first) first.focus();
      }
    });
    window.matchMedia('(min-width: 1200px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reveal-ready');
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }
  }

  /* ---------- Programs page: highlight current pillar in sub-nav ---------- */
  var pillarLinks = document.querySelectorAll('.pillar-nav a');
  if (pillarLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    pillarLinks.forEach(function (a) { map[a.hash.slice(1)] = a; });
    var po = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          pillarLinks.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
          map[entry.target.id].classList.add('is-active');
          map[entry.target.id].setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) po.observe(s); });
  }

  /* ---------- Events ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function todayInEdmonton() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function formatDate(iso) {
    var p = iso.split('-');
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
    return d.toLocaleDateString('en-CA', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }
  function eventCard(ev, past) {
    var meta = [];
    if (ev.time) meta.push(['i-clock', ev.time]);
    if (ev.format) meta.push(['i-video', ev.format]);
    if (ev.location) meta.push(['i-pin', ev.location]);
    if (ev.eligibility) meta.push(['i-belong', 'Who can attend: ' + ev.eligibility]);
    if (!past && ev.deadline) meta.push(['i-calendar', 'Register by ' + formatDate(ev.deadline)]);
    var when = ev.dateText || formatDate(ev.date);
    var actions = '';
    if (!past && ev.registerUrl) {
      actions += '<a class="btn btn--primary btn--sm" href="' + escapeHtml(ev.registerUrl) + '" rel="noopener" target="_blank" data-track="event_register">Register<span class="visually-hidden"> for ' + escapeHtml(ev.title) + ' (opens in a new tab)</span></a>';
    }
    if (ev.detailsUrl) {
      actions += '<a class="text-link" href="' + escapeHtml(ev.detailsUrl) + '">' + (past ? 'Read about this session' : 'Event details') +
        '<span class="visually-hidden">: ' + escapeHtml(ev.title) + '</span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>';
    }
    return '<article class="event' + (past ? ' event--past' : '') + '">' +
      '<p class="event__date"><svg class="icon" aria-hidden="true"><use href="#i-calendar"/></svg>' +
      (past ? '<span class="visually-hidden">Past event: </span>' : '') +
      '<time datetime="' + escapeHtml(ev.date) + '">' + escapeHtml(when) + '</time></p>' +
      '<h3>' + escapeHtml(ev.title) + '</h3>' +
      (meta.length ? '<ul class="event__meta">' + meta.map(function (m) {
        return '<li><svg class="icon" aria-hidden="true"><use href="#' + m[0] + '"/></svg><span>' + escapeHtml(m[1]) + '</span></li>';
      }).join('') + '</ul>' : '') +
      '<p>' + escapeHtml(ev.description) + '</p>' +
      (actions ? '<div class="event__actions">' + actions + '</div>' : '') +
      '</article>';
  }
  var events = (window.CIASO_EVENTS || []).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
  var today = todayInEdmonton();
  document.querySelectorAll('[data-events]').forEach(function (el) {
    var mode = el.getAttribute('data-events');
    var limit = +el.getAttribute('data-limit') || Infinity;
    var list = mode === 'upcoming'
      ? events.filter(function (e) { return e.date >= today; }).reverse()
      : events.filter(function (e) { return e.date < today; });
    list = list.slice(0, limit);
    if (!list.length) {
      var empty = document.getElementById(el.getAttribute('data-empty'));
      if (empty) { empty.hidden = false; el.hidden = true; }
      return;
    }
    el.innerHTML = list.map(function (e) { return eventCard(e, mode !== 'upcoming'); }).join('');
  });

  /* ---------- Story filters ---------- */
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var items = document.querySelectorAll('[data-categories]');
    var status = document.querySelector('[data-filter-status]');
    filterBar.hidden = false;
    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var cat = btn.getAttribute('data-filter');
      filterBar.querySelectorAll('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      var shown = 0;
      items.forEach(function (it) {
        var match = cat === 'all' || it.getAttribute('data-categories').split(' ').indexOf(cat) > -1;
        it.hidden = !match;
        if (match) shown++;
      });
      if (status) status.textContent = shown + (shown === 1 ? ' story' : ' stories') + ' shown';
    });
  }

  /* ---------- Share links ---------- */
  document.querySelectorAll('[data-share]').forEach(function (box) {
    var url = encodeURIComponent(box.getAttribute('data-share-url') || window.location.href);
    var li = box.querySelector('[data-share-linkedin]');
    var fb = box.querySelector('[data-share-facebook]');
    if (li) li.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + url;
    if (fb) fb.href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;
    var copy = box.querySelector('[data-share-copy]');
    if (copy) {
      copy.hidden = !navigator.clipboard;
      copy.addEventListener('click', function () {
        navigator.clipboard.writeText(decodeURIComponent(url)).then(function () {
          var lbl = copy.querySelector('span');
          var prev = lbl.textContent;
          lbl.textContent = 'Link copied';
          setTimeout(function () { lbl.textContent = prev; }, 2500);
        });
      });
    }
  });

  /* ---------- Get Support: need picker ---------- */
  var picker = document.querySelector('[data-need-picker]');
  if (picker) {
    var panels = document.querySelectorAll('[data-need-panel]');
    var topicSelect = document.getElementById('support-topic');
    panels.forEach(function (p) { p.hidden = true; });
    var showNeed = function (value, scroll) {
      panels.forEach(function (p) { p.hidden = p.getAttribute('data-need-panel') !== value; });
      if (topicSelect) topicSelect.value = value;
      var active = document.querySelector('[data-need-panel="' + value + '"]');
      if (active && scroll) active.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
      track('support_need_selected', { need: value });
    };
    picker.addEventListener('change', function (e) {
      if (e.target.name === 'need') showNeed(e.target.value, true);
    });
    var preset = new URLSearchParams(window.location.search).get('need');
    var presetInput = preset && picker.querySelector('input[value="' + preset.replace(/[^a-z-]/g, '') + '"]');
    if (presetInput) { presetInput.checked = true; showNeed(presetInput.value, false); }
  }

  /* Preselect a topic on any form via ?topic= */
  var topicParam = new URLSearchParams(window.location.search).get('topic');
  if (topicParam) {
    document.querySelectorAll('select[data-topic-select]').forEach(function (sel) {
      var opt = Array.prototype.find.call(sel.options, function (o) { return o.value === topicParam; });
      if (opt) sel.value = topicParam;
    });
  }

  /* ---------- Forms: validation + submission ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[+()\-.\s\d]{7,20}$/;

  function fieldLabel(field) {
    var l = field.closest('.field, fieldset');
    var lab = l && (l.querySelector('label[for="' + field.id + '"]') || l.querySelector('legend'));
    return lab ? lab.textContent.replace(/\*|\(optional\)|required/gi, '').trim() : field.name;
  }
  function setError(field, msg) {
    var errId = field.getAttribute('data-error-id') || (field.id + '-error');
    var err = document.getElementById(errId);
    var targets = field.type === 'checkbox' && field.closest('fieldset[data-group]')
      ? field.closest('fieldset[data-group]').querySelectorAll('input') : [field];
    Array.prototype.forEach.call(targets, function (t) {
      if (msg) t.setAttribute('aria-invalid', 'true'); else t.removeAttribute('aria-invalid');
    });
    if (err) {
      err.hidden = !msg;
      err.innerHTML = msg ? '<svg class="icon" aria-hidden="true"><use href="#i-alert"/></svg><span>' + escapeHtml(msg) + '</span>' : '';
    }
  }
  function validateField(field) {
    var v = (field.value || '').trim();
    var msg = '';
    var name = fieldLabel(field);
    if (field.type === 'checkbox') {
      if (field.required && !field.checked) msg = field.getAttribute('data-msg') || 'Please check this box to continue.';
    } else if (field.required && !v) {
      msg = field.getAttribute('data-msg') || ('Please enter your ' + name.toLowerCase() + '.');
    } else if (v && field.type === 'email' && !EMAIL_RE.test(v)) {
      msg = 'Enter an email address in the format name@example.com.';
    } else if (v && field.type === 'tel' && !PHONE_RE.test(v)) {
      msg = 'Enter a phone number using digits, for example 587-555-0123.';
    } else if (v && field.maxLength > 0 && v.length > field.maxLength) {
      msg = name + ' must be ' + field.maxLength + ' characters or fewer.';
    }
    setError(field, msg);
    return msg;
  }
  function validateGroup(fs) {
    var min = +fs.getAttribute('data-min') || 1;
    var checked = fs.querySelectorAll('input:checked').length;
    var msg = checked >= min ? '' : (fs.getAttribute('data-msg') || 'Please choose at least one option.');
    var first = fs.querySelector('input');
    setError(first, msg);
    return msg;
  }

  function buildMailto(form) {
    var subject = form.getAttribute('data-subject') || 'Website enquiry';
    var lines = [];
    var data = new FormData(form);
    var seen = {};
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (!f.name || f.name === 'website' || f.name === 'consent' || f.type === 'hidden' || seen[f.name]) return;
      seen[f.name] = true;
      var vals = data.getAll(f.name).filter(Boolean);
      if (!vals.length) return;
      if (f.tagName === 'SELECT') vals = [f.options[f.selectedIndex].text];
      lines.push(fieldLabel(f) + ': ' + vals.join(', '));
    });
    var topic = form.querySelector('[data-topic-select]');
    if (topic && topic.value) subject += ' – ' + topic.options[topic.selectedIndex].text;
    return 'mailto:' + config.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n\n'));
  }

  function showStatus(form, viaEmail) {
    var tpl = document.getElementById(form.getAttribute('data-success'));
    var box = document.createElement('div');
    box.className = 'form-status';
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.innerHTML = '<div class="form-status__icon"><svg class="icon" aria-hidden="true"><use href="#i-' + (viaEmail ? 'mail' : 'check') + '"/></svg></div>' +
      (viaEmail
        ? '<h3>Almost done – please send the email</h3><p>Your email app should have opened with your message to CIASO already written. Press <strong>Send</strong> in your email app to deliver it.</p><p>If nothing opened, email us directly at <a href="mailto:' + config.email + '">' + config.email + '</a> or call <a href="tel:+15878135155">587-813-5155</a>.</p>'
        : (tpl ? tpl.innerHTML : '<h3>Thank you</h3><p>Your message has been sent.</p>'));
    form.replaceWith(box);
    box.focus();
  }

  document.querySelectorAll('form[data-ciaso-form]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    var started = Date.now();
    var summary = form.querySelector('[data-error-summary]');
    var alertBox = form.querySelector('[data-form-alert]');

    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (f.name === 'website') return;
      f.addEventListener('blur', function () {
        if (f.getAttribute('aria-invalid') === 'true' || (f.value && f.type !== 'checkbox')) {
          if (f.closest('fieldset[data-group]')) validateGroup(f.closest('fieldset[data-group]')); else validateField(f);
        }
      });
      f.addEventListener('change', function () {
        if (f.getAttribute('aria-invalid') === 'true') {
          if (f.closest('fieldset[data-group]')) validateGroup(f.closest('fieldset[data-group]')); else validateField(f);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (alertBox) alertBox.hidden = true;
      var errors = [];
      form.querySelectorAll('input, select, textarea').forEach(function (f) {
        if (!f.name || f.name === 'website' || f.closest('fieldset[data-group]')) return;
        var msg = validateField(f);
        if (msg) errors.push([f, msg]);
      });
      form.querySelectorAll('fieldset[data-group]').forEach(function (fs) {
        var msg = validateGroup(fs);
        if (msg) errors.push([fs.querySelector('input'), msg]);
      });

      if (errors.length) {
        if (summary) {
          summary.hidden = false;
          summary.querySelector('ul').innerHTML = errors.map(function (er) {
            return '<li><a href="#' + er[0].id + '">' + escapeHtml(er[1]) + '</a></li>';
          }).join('');
          summary.querySelector('h3').textContent = errors.length === 1 ? 'There is 1 problem with your form' : 'There are ' + errors.length + ' problems with your form';
          summary.focus();
          summary.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function (ev) {
              ev.preventDefault();
              var t = document.getElementById(a.hash.slice(1));
              if (t) t.focus();
            });
          });
        } else {
          errors[0][0].focus();
        }
        return;
      }
      if (summary) summary.hidden = true;

      // Spam protection: hidden honeypot field and minimum fill time. Bots get a silent "success".
      var hp = form.querySelector('input[name="website"]');
      if ((hp && hp.value) || Date.now() - started < 2500) {
        showStatus(form, false);
        return;
      }

      var formName = form.getAttribute('data-ciaso-form');
      var endpoint = (config.formEndpoints || {})[formName];
      track('form_submit', { form: formName });

      if (!endpoint) {
        window.location.href = buildMailto(form);
        showStatus(form, true);
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      var btnText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          track('form_success', { form: formName });
          showStatus(form, false);
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = btnText;
          if (alertBox) {
            alertBox.hidden = false;
            alertBox.innerHTML = 'Sorry, your message could not be sent. Please check your connection and try again, or email <a href="mailto:' + config.email + '">' + config.email + '</a>.';
            alertBox.focus();
          }
        });
    });
  });
})();
