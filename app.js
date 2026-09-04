// RAKSHA — Application Logic
// ============================================================

(function() {
  'use strict';

  // === STATE ===
  let currentPage = 'dashboard';
  let currentScenario = 'rain';
  let selectedHabitat = 'Sail Gaon';
  let mainMap = null;
  let fullMap = null;
  let mapMarkers = { habitations: [], sites: [], routes: [] };
  let fullMarkers = { habitations: [], sites: [] };
  let layerPanelOpen = false;

  // === DOM REFS ===
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => [...(p || document).querySelectorAll(s)];
  const toast = $('#toast');
  const drawer = $('#drawer');
  const drawerOverlay = $('#drawerOverlay');
  const drawerBody = $('#drawerBody');

  // === INIT ===
  function init() {
    setupNavigation();
    setupScenarioSelect();
    setupDashboardButtons();
    setupLayerPanel();
    setupMapTabs();
    setupEvidenceBtn();
    setupRouteBtn();
    setupDrawerClose();
    setupSearch();
    setupFilterButtons();
    setupSettings();
    setupPrint();
    buildHabitationTable();
    buildSafeSites();
    buildRelocationPlan();
    buildAlertsFeed();
    buildDashboardAlerts();
    buildAnalyticsCharts();
    buildReport();
    updateKPIs();
    selectHabitat(selectedHabitat, false);
    
    // Initialize Leaflet maps
    setTimeout(() => {
      initMaps();
      // Initialize Lucide icons after all content is rendered
      lucide.createIcons();
    }, 100);
  }

  // === NAVIGATION ===
  function setupNavigation() {
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        navigateTo(item.dataset.page);
      });
    });

    $$('[data-page]').forEach(el => {
      if (!el.classList.contains('nav-item')) {
        el.addEventListener('click', e => {
          e.preventDefault();
          navigateTo(el.dataset.page);
        });
      }
    });

    $('#menuBtn').addEventListener('click', () => {
      $('#sidebar').classList.toggle('open');
    });
  }

  function navigateTo(pageId) {
    currentPage = pageId;
    $$('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + pageId));
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === pageId));
    $('#bcPage').textContent = getPageName(pageId);

    if (pageId === 'map' && fullMap) {
      setTimeout(() => fullMap.invalidateSize(), 100);
    }
    if (pageId === 'dashboard' && mainMap) {
      setTimeout(() => mainMap.invalidateSize(), 100);
    }

    window.scrollTo({ top: 0 });
    $('#pageContent').scrollTop = 0;
  }

  function getPageName(id) {
    const names = {
      dashboard: 'COMMAND DASHBOARD',
      map: 'RISK MAP',
      habitations: 'HABITATIONS',
      sites: 'SAFE SITES',
      plan: 'RELOCATION PLAN',
      alerts: 'ALERTS',
      analytics: 'ANALYTICS',
      reports: 'REPORTS',
      data: 'DATA LAYERS',
      settings: 'SETTINGS'
    };
    return names[id] || id.toUpperCase();
  }

  // === TOAST ===
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }

  // === SCENARIO SELECT ===
  function setupScenarioSelect() {
    $('#scenarioSelect').addEventListener('change', e => {
      currentScenario = e.target.value;
      updateKPIs();
      showToast('Scenario switched: ' + SCENARIOS[currentScenario].label);
    });
  }

  function updateKPIs() {
    const s = SCENARIOS[currentScenario];
    $('#kpiRisk').textContent = s.risk;
    $('#kpiP1').textContent = s.p1Count;
    $('#kpiP2').textContent = s.p2Count;
    $('#kpiP3').textContent = s.p3Count;
    $('#kpiPop').textContent = s.pop;
    $('#kpiCap').textContent = s.totalCap;
    $('#kpiCapSub').textContent = s.util + ' utilized · ' + s.usable + ' of ' + s.sites + ' sites';
    $('#bellCount').textContent = s.alert;
    $('#navAlertBadge').textContent = s.alert;
  }

  // === DASHBOARD BUTTONS ===
  function setupDashboardButtons() {
    $('#runScenarioBtn').addEventListener('click', () => {
      showToast('Scenario evaluated · priority and alert layers refreshed');
    });

    $('#scenarioInfoBtn').addEventListener('click', () => {
      const s = SCENARIOS[currentScenario];
      openDrawer('Scenario Details',
        '<div class="overline">CONTROLLED SCENARIO</div>' +
        '<h2>' + s.label + '</h2>' +
        '<p>This is a hardcoded demonstration scenario used to validate the RAKSHA decision workflow. It is not a live alert feed.</p>' +
        '<div class="drawer-callout"><b>Demo boundary</b><br>Production inputs would be replaced by validated hazard, population, infrastructure and safe-site data with documented validation pipelines.</div>'
      );
    });
  }

  // === LAYER PANEL ===
  function setupLayerPanel() {
    $('#layerToggleBtn').addEventListener('click', e => {
      e.stopPropagation();
      layerPanelOpen = !layerPanelOpen;
      $('#layerPanel').classList.toggle('show', layerPanelOpen);
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('#layerPanel') && !e.target.closest('#layerToggleBtn')) {
        layerPanelOpen = false;
        $('#layerPanel').classList.remove('show');
      }
    });

    $$('#layerPanel input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        toggleMapLayer(cb.dataset.layer, cb.checked);
      });
    });
  }

  function toggleMapLayer(layer, visible) {
    if (mainMap) {
      if (layer === 'hazard' && mainMap._hazardLayer) mainMap[visible ? 'addLayer' : 'removeLayer'](mainMap._hazardLayer);
      if (layer === 'rivers' && mainMap._riverLayer) mainMap[visible ? 'addLayer' : 'removeLayer'](mainMap._riverLayer);
      if (layer === 'roads' && mainMap._roadLayer) mainMap[visible ? 'addLayer' : 'removeLayer'](mainMap._roadLayer);
      if (layer === 'boundary' && mainMap._boundaryLayer) mainMap[visible ? 'addLayer' : 'removeLayer'](mainMap._boundaryLayer);
      if (layer === 'habitations') mapMarkers.habitations.forEach(m => m[visible ? 'addTo' : 'removeFrom'](mainMap));
      if (layer === 'sites') mapMarkers.sites.forEach(m => m[visible ? 'addTo' : 'removeFrom'](mainMap));
    }
  }

  // === MAP TABS ===
  function setupMapTabs() {
    $$('.map-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.map-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        showToast(tab.textContent + ' view selected');
      });
    });
  }

  // === EVIDENCE BUTTON ===
  function setupEvidenceBtn() {
    $('#evidenceBtn').addEventListener('click', openEvidence);
  }

  function openEvidence() {
    const d = HABITATIONS.find(h => h.name === selectedHabitat) || HABITATIONS[0];
    const timeLabel = d.p === 'P1' ? 'immediate relocation assessment within 0–72 hours' :
                      d.p === 'P2' ? 'short-term relocation planning' : 'medium-term review';

    const html =
      '<div class="overline">EXPLAINABLE OUTPUT</div>' +
      '<h2>Why RAKSHA prioritized ' + d.name + '</h2>' +
      '<p>The prototype exposes the evidence signals behind the priority instead of presenting the score as an unexplained prediction.</p>' +
      '<div class="evidence-detail">' +
        '<div class="ev-row"><span>Hazard / exposure</span><b>' + d.flood + '</b><em>Scenario signal</em></div>' +
        '<div class="ev-row"><span>Population vulnerability</span><b>' + d.vuln + '</b><em>Scenario attribute</em></div>' +
        '<div class="ev-row"><span>Medical access</span><b>' + d.medical + '</b><em>Service constraint</em></div>' +
        '<div class="ev-row"><span>Road accessibility</span><b>' + d.road + '</b><em>Route constraint</em></div>' +
        '<div class="ev-row"><span>Combined risk score</span><b>' + d.score + ' / 100</b><em>' + d.p + '</em></div>' +
      '</div>' +
      '<div class="drawer-callout"><b>Recommendation</b><br>Prioritize ' + d.name + ' for ' + timeLabel + ', subject to field verification and operational authority.</div>';

    openDrawer('Evidence Trail', html);
  }

  // === ROUTE BUTTON ===
  function setupRouteBtn() {
    $('#routeBtn').addEventListener('click', () => {
      navigateTo('dashboard');
      showToast('Prototype route highlighted: ' + selectedHabitat + ' → ' +
        (HABITATIONS.find(h => h.name === selectedHabitat) || HABITATIONS[0]).dest);
      highlightRoute();
    });
  }

  function highlightRoute() {
    const mapEl = document.getElementById('mainMap');
    if (!mapEl || !mainMap) return;
    mapEl.classList.add('route-active');
    setTimeout(() => mapEl.classList.remove('route-active'), 2000);
  }

  // === DRAWER ===
  function setupDrawerClose() {
    $('#drawerClose').addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);
  }

  function openDrawer(title, html) {
    $('#drawerTitle').textContent = title;
    drawerBody.innerHTML = html;
    lucide.createIcons({ nodes: [drawerBody] });
    drawer.classList.add('show');
    drawerOverlay.classList.add('show');
  }

  function closeDrawer() {
    drawer.classList.remove('show');
    drawerOverlay.classList.remove('show');
  }

  // === SELECT HABITAT ===
  function selectHabitat(name, showToastMsg) {
    selectedHabitat = name;
    const d = HABITATIONS.find(h => h.name === name) || HABITATIONS[0];

    // Update intel panel
    $('#selName').textContent = d.name;
    $('#selPop').textContent = d.pop;
    $('#selScore').textContent = d.score;

    const pLabel = d.p === 'P1' ? 'Immediate' : d.p === 'P2' ? 'Short-term' : 'Medium-term';
    $('#selPriority').textContent = d.p + ' · ' + pLabel;
    $('#selPriority').className = 'priority ' + d.p.toLowerCase();

    const scoreBadge = $('.risk-score-display .risk-badge');
    if (scoreBadge) {
      scoreBadge.textContent = d.score >= 75 ? 'HIGH' : d.score >= 60 ? 'MEDIUM' : 'MODERATE';
      scoreBadge.className = 'risk-badge ' + (d.score >= 75 ? 'risk-high' : d.score >= 60 ? 'risk-medium' : 'risk-low');
    }

    $('#selWhyP').textContent = d.p;
    $('#selFlood').textContent = d.flood;
    $('#selVuln').textContent = d.vuln;
    $('#selMedical').textContent = d.medical;
    $('#selRoad').textContent = d.road;

    // Update factor badges
    setFactorBadge('#selFlood', d.flood);
    setFactorBadge('#selVuln', d.vuln);
    setFactorBadge('#selMedical', d.medical);
    setFactorBadge('#selRoad', d.road);

    // Destination
    $('#destName').textContent = d.dest;
    $('#destDist').textContent = d.distance;
    $('#destTime').textContent = d.time;
    $('#destCap').textContent = d.destCap;
    $('#destUsed').textContent = d.destUsed;
    $('#destAvail').textContent = d.available;
    $('#destBarFill').style.width = d.utilPct + '%';
    $('#destUtil').textContent = d.utilPct + '% utilized';

    // Decision text
    const decisionEl = $('.intel-decision p');
    if (decisionEl) {
      decisionEl.textContent = 'Prioritize immediate relocation assessment within 0–72 hours, subject to field verification.';
    }

    // Update table selection
    $$('#habTableBody tr').forEach(tr => {
      tr.classList.toggle('selected', tr.dataset.name === name);
    });

    // Update map markers
    mapMarkers.habitations.forEach(m => {
      if (m._habName === name) {
        m.getElement()?.classList.add('marker-selected');
      } else {
        m.getElement()?.classList.remove('marker-selected');
      }
    });

    // Update dashboard intel panel
    const mapEl = document.getElementById('mainMap');
    if (mapEl) {
      $$('.marker.habitation', mapEl).forEach(m => {
        m.classList.toggle('selected', m.dataset.hab === name);
      });
    }

    if (showToastMsg !== false) {
      showToast(name + ' selected · P' + d.p.charAt(1));
    }
  }

  function setFactorBadge(selector, level) {
    const el = $(selector);
    if (!el) return;
    el.className = 'factor-badge';
    if (level === 'HIGH') el.classList.add('badge-high');
    else if (level === 'MEDIUM') el.classList.add('badge-medium');
    else if (level === 'POOR' || level === 'LIMITED') el.classList.add('badge-poor');
    else if (level === 'CONSTRAINED' || level === 'ONE-WAY') el.classList.add('badge-constrained');
    else if (level === 'MODERATE') el.classList.add('badge-medium');
    else if (level === 'GOOD') el.classList.add('badge-low');
    else el.classList.add('badge-medium');
  }

  // === MAP ===
  function initMaps() {
    initMainMap();
    initFullMap();
  }

  function initMainMap() {
    const el = document.getElementById('mainMap');
    if (!el || mainMap) return;

    mainMap = L.map(el, {
      center: [30.42, 79.33],
      zoom: 11,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(mainMap);

    addMapLayers(mainMap, mapMarkers);
    document.getElementById('mapFullscreenBtn').addEventListener('click', () => {
      el.requestFullscreen?.();
      setTimeout(() => mainMap.invalidateSize(), 200);
    });
  }

  function initFullMap() {
    const el = document.getElementById('fullMap');
    if (!el || fullMap) return;

    fullMap = L.map(el, {
      center: [30.42, 79.33],
      zoom: 11,
      zoomControl: true,
      attributionControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(fullMap);

    addMapLayers(fullMap, fullMarkers);
  }

  function addMapLayers(map, markers) {
    // District boundary (approximate polygon)
    const boundaryCoords = [
      [30.62, 79.15], [30.62, 79.50], [30.55, 79.55],
      [30.45, 79.52], [30.30, 79.50], [30.25, 79.45],
      [30.25, 79.20], [30.30, 79.15], [30.45, 79.12],
      [30.55, 79.12], [30.62, 79.15]
    ];
    const boundary = L.polygon(boundaryCoords, {
      color: '#2563c4',
      weight: 2,
      fillColor: '#2563c4',
      fillOpacity: 0.04,
      dashArray: '6,4'
    }).addTo(map);
    map._boundaryLayer = boundary;

    // River (approximate path)
    const riverCoords = [
      [30.58, 79.25], [30.52, 79.27], [30.46, 79.30],
      [30.40, 79.32], [30.35, 79.30], [30.30, 79.28],
      [30.25, 79.27]
    ];
    const river = L.polyline(riverCoords, {
      color: '#3b82f6',
      weight: 2.5,
      opacity: 0.6
    }).addTo(map);
    map._riverLayer = river;

    // Roads (approximate paths)
    const roadCoords = [
      [30.45, 79.20], [30.45, 79.28], [30.40, 79.33],
      [30.38, 79.33], [30.33, 79.31], [30.28, 79.28]
    ];
    const road2Coords = [
      [30.50, 79.30], [30.48, 79.32], [30.45, 79.35],
      [30.40, 79.35], [30.35, 79.33]
    ];
    const roads = L.layerGroup([
      L.polyline(roadCoords, { color: '#94a3b8', weight: 1.5, dashArray: '4,4', opacity: 0.5 }),
      L.polyline(road2Coords, { color: '#94a3b8', weight: 1.5, dashArray: '4,4', opacity: 0.5 })
    ]).addTo(map);
    map._roadLayer = roads;

    // Hazard zones (approximate circles)
    const hazardLayer = L.layerGroup([
      L.circle([30.45, 79.35], { radius: 3000, color: '#d94452', fillColor: '#d94452', fillOpacity: 0.08, weight: 1, dashArray: '3,3' }),
      L.circle([30.48, 79.28], { radius: 2500, color: '#d94452', fillColor: '#d94452', fillOpacity: 0.06, weight: 1, dashArray: '3,3' }),
      L.circle([30.38, 79.33], { radius: 2000, color: '#d97706', fillColor: '#d97706', fillOpacity: 0.06, weight: 1, dashArray: '3,3' }),
      L.circle([30.33, 79.31], { radius: 2000, color: '#d97706', fillColor: '#d97706', fillOpacity: 0.06, weight: 1, dashArray: '3,3' }),
      L.circle([30.56, 79.37], { radius: 1800, color: '#ca8a04', fillColor: '#ca8a04', fillOpacity: 0.05, weight: 1, dashArray: '3,3' })
    ]).addTo(map);
    map._hazardLayer = hazardLayer;

    // Habitation markers
    HABITATIONS.forEach(h => {
      const marker = L.marker([h.lat, h.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-hab"><div class="marker-dot ' + h.p.toLowerCase() + '"></div><div class="marker-label">' + h.name + '</div></div>',
          iconSize: [0, 0],
          iconAnchor: [7, 7]
        })
      }).addTo(map);

      marker._habName = h.name;
      marker.on('click', () => selectHabitat(h.name));
      markers.habitations.push(marker);
    });

    // Safe site markers
    SAFE_SITES.forEach(s => {
      const marker = L.marker([s.lat, s.lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div class="marker-site"><div class="site-marker-icon"><i data-lucide="shield-check"></i></div><div class="marker-label">' + s.name + '</div></div>',
          iconSize: [0, 0],
          iconAnchor: [12, 24]
        })
      }).addTo(map);

      marker.on('click', () => {
        showToast(s.name + ' · Usable capacity: ' + s.usable + ' · ' + s.utilPct + '% utilized');
      });
      markers.sites.push(marker);
    });
  }

  // === HABITATIONS TABLE ===
  function buildHabitationTable() {
    const tbody = $('#habTableBody');
    tbody.innerHTML = '';

    HABITATIONS.forEach(h => {
      const pLabel = h.p === 'P1' ? 'Immediate' : h.p === 'P2' ? 'Short-term' : 'Medium-term';
      const tr = document.createElement('tr');
      tr.dataset.name = h.name;
      tr.dataset.priority = h.p;
      tr.innerHTML =
        '<td><span class="priority ' + h.p.toLowerCase() + '">' + h.p + ' · ' + pLabel + '</span></td>' +
        '<td style="font-weight:600;color:var(--text-page)">' + h.name + '</td>' +
        '<td class="num"><strong style="color:var(--text-page)">' + h.score + '</strong></td>' +
        '<td class="num">' + h.pop + '</td>' +
        '<td><span class="factor-badge ' + getBadgeClass(h.flood) + '">' + h.flood + '</span></td>' +
        '<td><span class="factor-badge ' + getBadgeClass(h.vuln) + '">' + h.vuln + '</span></td>' +
        '<td><span class="factor-badge ' + getBadgeClass(h.medical) + '">' + h.medical + '</span></td>' +
        '<td><span class="factor-badge ' + getBadgeClass(h.road) + '">' + h.road + '</span></td>' +
        '<td>' + h.dest + '</td>' +
        '<td class="num">' + h.distance + '</td>';

      tr.addEventListener('click', () => {
        selectHabitat(h.name);
      });

      tbody.appendChild(tr);
    });

    updateTableFooter('All');
  }

  function getBadgeClass(level) {
    if (level === 'HIGH' || level === 'POOR') return 'badge-high';
    if (level === 'MEDIUM' || level === 'MODERATE' || level === 'LIMITED') return 'badge-medium';
    if (level === 'GOOD') return 'badge-low';
    if (level === 'CONSTRAINED' || level === 'ONE-WAY') return 'badge-constrained';
    return 'badge-medium';
  }

  // === SEARCH ===
  function setupSearch() {
    const input = $('#habSearch');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      $$('#habTableBody tr').forEach(tr => {
        const match = tr.dataset.name.toLowerCase().includes(q);
        tr.style.display = match ? '' : 'none';
      });
      updateTableFooter('search');
    });
  }

  // === FILTER BUTTONS ===
  function setupFilterButtons() {
    $$('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        $$('#habTableBody tr').forEach(tr => {
          if (filter === 'all') {
            tr.style.display = '';
          } else {
            tr.style.display = tr.dataset.priority === filter ? '' : 'none';
          }
        });

        updateTableFooter(filter);
      });
    });
  }

  function updateTableFooter(mode) {
    const total = $$('#habTableBody tr').length;
    const visible = $$('#habTableBody tr').filter(tr => tr.style.display !== 'none').length;
    const footer = $('#habTableFooter');
    if (mode === 'search') {
      footer.textContent = 'Showing ' + visible + ' of ' + total + ' habitations';
    } else if (mode === 'all') {
      footer.textContent = 'Showing all ' + total + ' habitations';
    } else {
      footer.textContent = 'Filtering by ' + mode + ' · ' + visible + ' of ' + total + ' habitations';
    }
  }

  // === SAFE SITES ===
  function buildSafeSites() {
    const grid = $('#sitesGrid');
    if (!grid) return;

    SAFE_SITES.forEach(s => {
      const card = document.createElement('div');
      card.className = 'site-card';
      card.innerHTML =
        '<div class="site-card-header">' +
          '<div><div class="site-name">' + s.name + '</div><div class="site-location">' + s.location + '</div></div>' +
          '<span class="site-status">Operational</span>' +
        '</div>' +
        '<div class="site-metrics">' +
          '<div class="site-metric"><div class="site-metric-val">' + s.usable + '</div><div class="site-metric-label">Usable</div></div>' +
          '<div class="site-metric"><div class="site-metric-val">' + s.used + '</div><div class="site-metric-label">Used</div></div>' +
          '<div class="site-metric"><div class="site-metric-val safe-val">' + s.available + '</div><div class="site-metric-label">Available</div></div>' +
        '</div>' +
        '<div class="site-capacity-bar">' +
          '<div class="site-cap-bar"><div class="site-cap-fill" style="width:' + s.utilPct + '%"></div></div>' +
          '<div class="site-cap-labels"><span>' + s.utilPct + '% utilized</span><span>' + s.usable + ' total</span></div>' +
        '</div>';

      grid.appendChild(card);
    });
  }

  // === RELOCATION PLAN ===
  function buildRelocationPlan() {
    const timeline = $('#planTimeline');
    if (!timeline) return;

    RELOCATION_PLAN.forEach(phase => {
      const phaseClass = phase.phase === 'P1' ? 'p1-badge' : phase.phase === 'P2' ? 'p2-badge' : 'p3-badge';

      const div = document.createElement('div');
      div.className = 'plan-phase';

      let assignmentsHTML = '';
      phase.assignments.forEach(a => {
        assignmentsHTML +=
          '<div class="plan-assignment">' +
            '<div class="plan-from">' +
              '<div class="plan-from-label">Origin</div>' +
              '<div class="plan-from-name">' + a.from + '</div>' +
              '<div class="plan-pop">' + a.pop + ' people</div>' +
            '</div>' +
            '<div class="plan-arrow">' +
              '<i data-lucide="chevron-right"></i>' +
              '<div class="plan-dist">' + a.dist + ' · ' + a.time + '</div>' +
            '</div>' +
            '<div class="plan-to">' +
              '<div class="plan-to-label">Destination</div>' +
              '<div class="plan-to-name">' + a.to + '</div>' +
              '<div class="plan-pop">' + a.util + '% capacity utilized</div>' +
            '</div>' +
          '</div>';
      });

      div.innerHTML =
        '<div class="plan-phase-header">' +
          '<span class="plan-phase-badge ' + phaseClass + '">' + phase.phase + '</span>' +
          '<span class="plan-phase-title">' + (phase.phase === 'P1' ? 'Immediate' : phase.phase === 'P2' ? 'Short-term' : 'Medium-term') + '</span>' +
          '<span class="plan-phase-window">' + phase.window + '</span>' +
        '</div>' +
        '<div class="plan-assignments">' + assignmentsHTML + '</div>';

      timeline.appendChild(div);
    });
  }

  // === ALERTS FEED ===
  function buildAlertsFeed() {
    const feed = $('#alertsFeed');
    if (!feed) return;

    ALERTS.forEach(a => {
      const sevClass = a.severity === 'P1' ? 'sev-p1' : a.severity === 'P2' ? 'sev-p2' : 'sev-p3';
      const rowClass = a.severity === 'P1' ? 'alert-p1' : a.severity === 'P2' ? 'alert-p2' : 'alert-p3';
      const iconName = a.severity === 'P1' ? 'alert-triangle' : a.severity === 'P2' ? 'alert-circle' : 'info';

      const div = document.createElement('div');
      div.className = 'alert-row ' + rowClass;
      div.innerHTML =
        '<div class="alert-sev ' + sevClass + '"><i data-lucide="' + iconName + '"></i></div>' +
        '<div class="alert-content">' +
          '<div class="alert-title">' + a.title + '</div>' +
          '<div class="alert-desc">' + a.desc + '</div>' +
          '<div class="alert-meta">' +
            '<span>' + a.time + '</span>' +
            '<span><strong>Effect: </strong>' + a.effect + '</span>' +
          '</div>' +
        '</div>';

      feed.appendChild(div);
    });
  }

  function buildDashboardAlerts() {
    const feed = $('#dashAlertFeed');
    if (!feed) return;

    ALERTS.forEach(a => {
      const sevClass = a.severity === 'P1' ? 'sev-p1' : a.severity === 'P2' ? 'sev-p2' : 'sev-p3';
      const rowClass = a.severity === 'P1' ? 'alert-p1' : a.severity === 'P2' ? 'alert-p2' : 'alert-p3';
      const iconName = a.severity === 'P1' ? 'alert-triangle' : a.severity === 'P2' ? 'alert-circle' : 'info';

      const div = document.createElement('div');
      div.className = 'alert-row ' + rowClass;
      div.innerHTML =
        '<div class="alert-sev ' + sevClass + '"><i data-lucide="' + iconName + '"></i></div>' +
        '<div class="alert-content">' +
          '<div class="alert-title">' + a.title + '</div>' +
          '<div class="alert-desc">' + a.desc + '</div>' +
        '</div>';

      feed.appendChild(div);
    });

    lucide.createIcons({ nodes: [feed] });
  }

  // === ANALYTICS ===
  function buildAnalyticsCharts() {
    const dist = $('#analyticsDist');
    if (!dist) return;

    const ranges = [
      { label: '90–100 (Critical)', count: 2, color: 'var(--p1)' },
      { label: '80–89 (High)', count: 1, color: 'var(--p2)' },
      { label: '70–79 (Elevated)', count: 2, color: 'var(--p3)' },
      { label: '60–69 (Moderate)', count: 1, color: '#64748b' },
      { label: '50–59 (Low)', count: 1, color: '#94a3b8' }
    ];

    ranges.forEach(r => {
      const row = document.createElement('div');
      row.className = 'weight-bar-wrap';
      row.innerHTML =
        '<div class="weight-row"><span>' + r.label + '</span><strong>' + r.count + ' habitation' + (r.count !== 1 ? 's' : '') + '</strong></div>' +
        '<div class="weight-bar"><div class="weight-fill" style="width:' + (r.count / 3 * 100) + '%;background:' + r.color + '"></div></div>';
      dist.appendChild(row);
    });
  }

  // === REPORT ===
  function buildReport() {
    const preview = $('#reportPreview');
    if (!preview) return;

    const s = SCENARIOS[currentScenario];
    let habRows = '';
    HABITATIONS.forEach(h => {
      habRows +=
        '<tr>' +
          '<td>' + h.p + '</td>' +
          '<td>' + h.name + '</td>' +
          '<td>' + h.score + '</td>' +
          '<td>' + h.pop + '</td>' +
          '<td>' + h.flood + '</td>' +
          '<td>' + h.vuln + '</td>' +
          '<td>' + h.dest + '</td>' +
          '<td>' + h.distance + '</td>' +
        '</tr>';
    });

    preview.innerHTML =
      '<div class="report-header">' +
        '<div class="report-logo">' +
          '<div class="report-logo-mark"><i data-lucide="shield"></i></div>' +
          '<div><div class="report-logo-name">RAKSHA</div><div class="report-logo-sub">Risk-Aware Knowledge & Safe Habitation Allocation</div></div>' +
        '</div>' +
        '<div class="report-meta">' +
          'Chamoli District<br>' +
          'Uttarakhand · India<br>' +
          '20 May 2025 · 10:30 IST<br>' +
          'Prototype Report' +
        '</div>' +
      '</div>' +
      '<h1 class="report-title">Disaster Preparedness Report</h1>' +
      '<p class="report-subtitle">Chamoli Heavy Rainfall Response · Problem Statement 26191 · SIH 2026</p>' +
      '<div class="report-section">' +
        '<div class="report-section-title">Executive Summary</div>' +
        '<p style="font-size:12px;color:var(--text-page-secondary);line-height:1.6;margin-bottom:16px">' +
          'This report summarizes the RAKSHA decision-support analysis for the Chamoli Heavy Rainfall Response scenario. ' +
          'The system identified 152 habitations at risk with 1,24,860 total population exposure. 48 habitations are classified P1 (Immediate), ' +
          '62 as P2 (Short-term), and 42 as P3 (Medium-term). 36 safe sites have been assessed with 29 currently usable.' +
        '</p>' +
      '</div>' +
      '<div class="report-kpis">' +
        '<div class="report-kpi"><div class="report-kpi-label">HABITATIONS</div><div class="report-kpi-value">152</div></div>' +
        '<div class="report-kpi"><div class="report-kpi-label">POPULATION</div><div class="report-kpi-value">1,24,860</div></div>' +
        '<div class="report-kpi"><div class="report-kpi-label">SAFE CAPACITY</div><div class="report-kpi-value">2,18,650</div></div>' +
      '</div>' +
      '<div class="report-section">' +
        '<div class="report-section-title">Habitation Analysis</div>' +
        '<table class="report-habitations">' +
          '<thead><tr><th>Priority</th><th>Habitation</th><th>Risk</th><th>Pop.</th><th>Flood</th><th>Vulnerability</th><th>Destination</th><th>Distance</th></tr></thead>' +
          '<tbody>' + habRows + '</tbody>' +
        '</table>' +
      '</div>' +
      '<div class="report-section">' +
        '<div class="report-section-title">Assumptions & Limitations</div>' +
        '<p style="font-size:11px;color:var(--text-page-secondary);line-height:1.6">' +
          '• All data is hardcoded scenario data for prototype demonstration<br>' +
          '• Risk scores use prototype weighting: Hazard 45%, Vulnerability 30%, Access 15%, Historical 10%<br>' +
          '• Travel times are prototype estimates<br>' +
          '• Capacity utilization reflects current scenario allocation<br>' +
          '• Production validation would require field verification<br>' +
          '• This report is intended for prototype demonstration purposes only' +
        '</p>' +
      '</div>' +
      '<div class="report-footer">' +
        'RAKSHA Prototype Report · SIH 2026 · Problem Statement 26191 · Controlled Scenario Data · Not for operational use' +
      '</div>';

    lucide.createIcons({ nodes: [preview] });
  }

  // === SETTINGS ===
  function setupSettings() {
    $('#settingReducedMotion')?.addEventListener('change', e => {
      document.documentElement.style.setProperty('--dur-fast', e.target.value ? '0ms' : '120ms');
      document.documentElement.style.setProperty('--dur-normal', e.target.value ? '0ms' : '200ms');
      document.documentElement.style.setProperty('--dur-slow', e.target.value ? '0ms' : '300ms');
    });
  }

  // === PRINT ===
  function setupPrint() {
    $('#printReportBtn')?.addEventListener('click', () => {
      window.print();
    });
  }

  // === START ===
  document.addEventListener('DOMContentLoaded', init);
})();
