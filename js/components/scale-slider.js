/**
 * AURALIS ScaleSlider — 1-5 scale selector (ВЪЛНА 3.1 Task А)
 * ==============================================================
 * 5 large circular buttons with labels. Champagne active state.
 *
 * API:
 *   var s = ScaleSlider.create({ labels, value, onChange });
 *   s.mount(parent);  s.getValue();  s.setValue(3);
 */

window.ScaleSlider = (function () {
  'use strict';

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function create(opts) {
    opts = opts || {};
    var labels = opts.labels || ['1', '2', '3', '4', '5'];
    var value = opts.value || null;

    var wrap = document.createElement('div');
    wrap.className = 'ss-wrap';
    wrap.setAttribute('role', 'radiogroup');

    var btns = [];

    for (var i = 0; i < 5; i++) {
      (function (idx) {
        var num = idx + 1;
        var btn = document.createElement('div');
        btn.className = 'ss-item';

        var circle = document.createElement('button');
        circle.className = 'ss-circle' + (value === num ? ' is-active' : '');
        circle.type = 'button';
        circle.setAttribute('role', 'radio');
        circle.setAttribute('aria-checked', value === num ? 'true' : 'false');
        circle.setAttribute('aria-label', 'Степен ' + num + ' от 5');
        circle.textContent = String(num);
        circle.addEventListener('click', function () {
          value = num;
          updateAll();
          if (opts.onChange) opts.onChange(value);
        });
        btn.appendChild(circle);

        var label = document.createElement('span');
        label.className = 'ss-label';
        label.textContent = labels[idx] || '';
        btn.appendChild(label);

        wrap.appendChild(btn);
        btns.push(circle);
      })(i);
    }

    function updateAll() {
      btns.forEach(function (b, i) {
        var isActive = value === i + 1;
        b.classList.toggle('is-active', isActive);
        b.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });
    }

    var api = {
      el: wrap,
      mount: function (parent) { parent.appendChild(wrap); },
      getValue: function () { return value; },
      setValue: function (v) { value = v; updateAll(); }
    };

    return api;
  }

  return { create: create };
})();
