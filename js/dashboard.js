/**
 * Dashboard page logic — summary cards, charts, top posts table
 */
document.addEventListener('DOMContentLoaded', async () => {
  App.requireAuth();
  App.initSidebar('dashboard');
  App.chartDefaults();

  let attribution = 'all';
  let charts = {};

  const demoBanner = document.getElementById('demo-banner');
  if (demoBanner && CONFIG.DEMO_BANNER) {
    demoBanner.classList.remove('hidden');
  }

  async function loadData() {
    const filterFn = (p) => {
      if (attribution === 'organic') return p.engagement_type === 'Organic';
      if (attribution === 'paid') return p.engagement_type === 'Paid';
      return true;
    };

    let summary, ovp, platforms, trends, top;
    try {
      if (!CONFIG.FORCE_DEMO_DATA) {
        const data = await API.getDashboardSummary({ attribution });
        if (data && !data.is_demo) {
          summary = data.summary || data;
          // Prefer API chart payloads when present
        }
      }
    } catch (_) {
      /* fall through to demo */
    }

    if (!summary) {
      summary = DEMO.summary(filterFn);
      ovp = DEMO.organicVsPaid();
      platforms = DEMO.platformDistribution();
      trends = DEMO.trends();
      top = DEMO.topPosts(5);
      if (demoBanner) demoBanner.classList.remove('hidden');
    } else {
      ovp = DEMO.organicVsPaid();
      platforms = DEMO.platformDistribution();
      trends = DEMO.trends();
      top = DEMO.topPosts(5);
    }

    // Metrics
    setText('metric-reach', App.formatNumber(summary.total_reach));
    setText('metric-impressions', App.formatNumber(summary.total_impressions));
    setText('metric-engagement', App.formatNumber(summary.total_engagement));
    setText('metric-clicks', App.formatNumber(summary.total_clicks));
    setText('metric-conversions', App.formatNumber(summary.total_conversions));
    setText('metric-adspend', App.formatCurrency(summary.total_ad_spend));

    renderCharts(ovp, platforms, trends);
    renderTopTable(top);
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderCharts(ovp, platforms, trends) {
    // Organic vs Paid grouped bar
    const ctx1 = document.getElementById('chart-organic-paid');
    if (ctx1) {
      if (charts.ovp) charts.ovp.destroy();
      charts.ovp = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels: ovp.labels,
          datasets: [
            { label: 'Organic', data: ovp.organic, backgroundColor: '#14B8A6', borderRadius: 4 },
            { label: 'Paid', data: ovp.paid, backgroundColor: '#2563EB', borderRadius: 4 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', align: 'end' } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { callback: (v) => App.formatNumber(v) } },
          },
        },
      });
    }

    // Trends line
    const ctx2 = document.getElementById('chart-trends');
    if (ctx2) {
      if (charts.trends) charts.trends.destroy();
      charts.trends = new Chart(ctx2, {
        type: 'line',
        data: {
          labels: trends.labels,
          datasets: [
            { label: 'Organic Engagement', data: trends.organic, borderColor: '#14B8A6', backgroundColor: 'rgba(20,184,166,0.1)', fill: true, tension: 0.3 },
            { label: 'Paid Engagement', data: trends.paid, borderColor: '#2563EB', backgroundColor: 'rgba(37,99,235,0.1)', fill: true, tension: 0.3 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', align: 'end' } },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { callback: (v) => App.formatNumber(v) } },
          },
        },
      });
    }

    // Platform doughnut
    const ctx3 = document.getElementById('chart-platforms');
    if (ctx3) {
      if (charts.plat) charts.plat.destroy();
      const colors = ['#2563EB', '#14B8A6', '#F59E0B', '#8B5CF6', '#64748B'];
      charts.plat = new Chart(ctx3, {
        type: 'doughnut',
        data: {
          labels: platforms.labels,
          datasets: [{ data: platforms.values, backgroundColor: colors.slice(0, platforms.labels.length), borderWidth: 0 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          cutout: '62%',
        },
      });
    }

    // Reach comparison (simple bar by platform)
    const ctx4 = document.getElementById('chart-reach');
    if (ctx4) {
      if (charts.reach) charts.reach.destroy();
      charts.reach = new Chart(ctx4, {
        type: 'bar',
        data: {
          labels: platforms.labels,
          datasets: [{ label: 'Reach', data: platforms.values, backgroundColor: '#2563EB', borderRadius: 4 }],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, ticks: { callback: (v) => App.formatNumber(v) } },
            y: { grid: { display: false } },
          },
        },
      });
    }
  }

  function renderTopTable(rows) {
    const tbody = document.getElementById('top-posts-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    rows.forEach((p) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-surface-container hover:bg-surface-container-low/50 transition-colors';
      const badgeClass = p.engagement_type === 'Organic' ? 'badge-organic' : 'badge-paid';
      tr.innerHTML = `
        <td class="py-3.5 px-4 text-sm font-medium text-on-surface">${App.escapeHtml(p.post_name)}</td>
        <td class="py-3.5 px-4 text-sm text-on-surface-variant">${App.escapeHtml(p.platform)}</td>
        <td class="py-3.5 px-4">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${badgeClass}">
            <span class="w-1.5 h-1.5 rounded-full ${p.engagement_type === 'Organic' ? 'bg-tertiary' : 'bg-primary-container'}"></span>
            ${p.engagement_type}
          </span>
        </td>
        <td class="py-3.5 px-4 text-sm text-right font-medium tabular-nums">${App.formatNumber(p.reach)}</td>
        <td class="py-3.5 px-4 text-sm text-right font-semibold tabular-nums text-tertiary">${App.formatPercent(p.eng_rate)}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Attribution pills
  window.setAttributionFilter = function (type) {
    attribution = type;
    ['all', 'organic', 'paid'].forEach((t) => {
      const btn = document.getElementById('pill-' + t);
      if (!btn) return;
      if (t === type) {
        btn.classList.add('bg-surface-container-lowest', 'text-on-surface', 'shadow-sm', 'font-semibold');
        btn.classList.remove('text-on-surface-variant');
      } else {
        btn.classList.remove('bg-surface-container-lowest', 'text-on-surface', 'shadow-sm', 'font-semibold');
        btn.classList.add('text-on-surface-variant');
      }
    });
    loadData();
  };

  document.getElementById('btn-refresh')?.addEventListener('click', () => {
    loadData();
    App.toast('Metrics refreshed.', 'info', 2000);
  });

  await loadData();
});
