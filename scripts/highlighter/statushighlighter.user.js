// ==UserScript==
// @name         Campus Connect Status Highlighter
// @namespace    https://github.com/supernovia/Scripts
// @version      1.4.3
// @description  Status & Coming Soon Highlights + Filters
// @author       Vibe-Codin' Velda
// @match        https://central.wordcamp.org/wp-admin/index.php?page=wordcamp-reports&report=campus-connect-details*
// @match        https://central.wordcamp.org/wp-admin/edit.php?post_type=wordcamp*
// @updateURL    https://raw.githubusercontent.com/supernovia/Scripts/master/org/statushighlighter.user.js
// @downloadURL  https://raw.githubusercontent.com/supernovia/Scripts/master/org/statushighlighter.user.js
// @homepageURL  https://github.com/supernovia/Scripts/tree/master/org // fork away!
// @supportURL   https://github.com/supernovia/Scripts/issues
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wordcamp.org
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // 🎨 STATUS COLOR GROUPS
  const STATUS_STYLES = {
    Setup: {
      color: '#f1c232',
      statuses: [
        'Needs Vetting',
        'Needs Orientation/Interview',
        'On Hold',
        'Approved for Pre-Planning Pending Agreement',
        'Needs E-mail Address',
        'Needs Site',
        'Needs Crowdsignal Account',
        'Needs to be Added to Pre-Planning Schedule',
      ],
    },
    Planning: {
      color: '#3d85c6',
      statuses: [
        'In Pre-Planning',
        'Needs to Fill Out WordCamp Listing',
        'Needs to Fill Out Event Listing',
      ],
    },
    Finalizing: {
      color: '#674ea7',
      statuses: [
        'Needs Budget Review',
        'Budget Review Scheduled',
        'Needs Contract to be Signed',
        'Needs to be Added to Official Schedule',
      ],
    },
    Scheduled: {
      color: '#6aa84f',
      statuses: ['WordCamp Scheduled', 'Scheduled'],
    },
    Completed: {
      color: '#5b5b5b',
      statuses: ['WordCamp Closed', 'Closed'],
    },
    Cancelled: {
      color: '#999999',
      statuses: ['Declined', 'Cancelled'],
    },
  };

  const soonOnly = { enabled: false };
  let activeFilters = new Set(Object.keys(STATUS_STYLES));

  function getStatusColumnIndex(table) {
    const headers = Array.from(table.querySelectorAll('thead th'));
    return headers.findIndex((th) => /status/i.test(th.textContent.trim()));
  }

  // 🎨 Apply color stripe + filter + “racing stripes”
  function updateRows(table) {
    const isListView = table.classList.contains('wp-list-table');
    const statusCol = !isListView ? getStatusColumnIndex(table) : -1;
    const now = new Date();
    const soonThreshold = 21 * 24 * 60 * 60 * 1000; // 3 weeks

    table.querySelectorAll('tbody tr').forEach((row) => {
      let statusText = '';
      let startDateText = '';
      let isSoon = false;

      // 🔍 Find status + start date
      if (isListView) {
        const statusSpan = row.querySelector('.column-title .post-state:last-of-type');
        if (statusSpan) statusText = statusSpan.textContent.trim();

        const dateCell = row.querySelector('.column-wcpt_date');
        if (dateCell) {
          const match = dateCell.textContent.match(/Start:\s*(\d{4}-\d{2}-\d{2})/);
          if (match) startDateText = match[1];
        }
      } else {
        if (statusCol >= 0 && row.children[statusCol]) {
          statusText = row.children[statusCol].textContent.trim();
        }
        const dateCell = row.querySelector('td:first-child');
        if (dateCell) startDateText = dateCell.textContent.trim();
      }

      const firstCell = row.querySelector('td:first-child, th.check-column');
      if (firstCell) firstCell.style.boxShadow = '';

      // 🎨 Determine base stripe color
      const lower = statusText.toLowerCase();
      let matchedGroup = null;
      let stripeColor = '';
      for (const [group, style] of Object.entries(STATUS_STYLES)) {
        if (style.statuses.some((s) => lower.includes(s.toLowerCase()))) {
          matchedGroup = group;
          stripeColor = style.color;
          break;
        }
      }

      // 🕒 Check if event is starting soon
      const parsed = Date.parse(startDateText);
      if (!Number.isNaN(parsed)) {
        const diff = parsed - now;
        if (diff >= 0 && diff <= soonThreshold) isSoon = true;
      }

      // 🏁 Apply "racing stripes" or normal stripe
      if (firstCell) {
        if (isSoon && stripeColor) {
          firstCell.style.boxShadow = `inset 2px 0 0 ${stripeColor}, inset 3px 0 0 #ffffff, inset 6px 0 0 ${stripeColor}`;
        } else if (stripeColor) {
          firstCell.style.boxShadow = `inset 6px 0 0 ${stripeColor}`;
        } else if (isSoon) {
          firstCell.style.boxShadow = `inset 6px 0 0 #cccccc`;
        } else {
          firstCell.style.boxShadow = '';
        }
      }

      // 🚫 Filter logic
      const showByStatus = !matchedGroup || activeFilters.has(matchedGroup);
      const showBySoon = !soonOnly.enabled || isSoon;
      row.style.display = showByStatus && showBySoon ? '' : 'none';
    });
  }

  // ☑️ Legend with plain-text “Starting Soon Only” toggle
  function addFilterLegend(table) {
    if (document.querySelector('#cc-filter-legend')) return;

    const legend = document.createElement('div');
    legend.id = 'cc-filter-legend';
    Object.assign(legend.style, {
      margin: '10px 0',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      fontSize: '13px',
      alignItems: 'center',
    });

    const addLegendItem = (label, color, key) => {
      const labelWrap = document.createElement('label');
      Object.assign(labelWrap.style, {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: '4px',
        backgroundColor: color,
        color: '#fff',
        textShadow: '0 1px 1px rgba(0,0,0,0.4)',
        cursor: 'pointer',
        userSelect: 'none',
        gap: '4px',
        transition: 'opacity 0.2s ease',
      });

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      checkbox.dataset.status = key;
      checkbox.style.cursor = 'pointer';
      checkbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          activeFilters.add(key);
          labelWrap.style.opacity = '1';
        } else {
          activeFilters.delete(key);
          labelWrap.style.opacity = '0.4';
        }
        updateRows(table);
      });

      labelWrap.append(checkbox, document.createTextNode(` ${label}`));
      legend.appendChild(labelWrap);
    };

    for (const [group, { color }] of Object.entries(STATUS_STYLES)) {
      addLegendItem(group, color, group);
    }

    // plain “Starting Soon Only” filter
    const soonLabel = document.createElement('label');
    Object.assign(soonLabel.style, {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
      fontWeight: '500',
    });

    const soonBox = document.createElement('input');
    soonBox.type = 'checkbox';
    soonBox.checked = false;
    soonBox.addEventListener('change', (e) => {
      soonOnly.enabled = e.target.checked;
      updateRows(table);
    });

    soonLabel.append(soonBox, document.createTextNode('Starting Soon Only'));
    legend.appendChild(soonLabel);

    table.parentElement.insertBefore(legend, table);
  }

  // 🚀 Initialize (with single-run guard)
  function enhance() {
    if (document.querySelector('#cc-filter-legend')) return; // don’t double up
    const table =
      document.querySelector('#report-data-table') ||
      document.querySelector('.wp-list-table');
    if (!table) return;

    addFilterLegend(table);
    updateRows(table);
  }

  // 👀 Observe until ready, then stop
  const observer = new MutationObserver(() => {
    const table = document.querySelector('#report-data-table, .wp-list-table');
    if (table && !document.querySelector('#cc-filter-legend')) {
      enhance();
      observer.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
