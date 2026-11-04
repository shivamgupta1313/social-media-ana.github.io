document.addEventListener('DOMContentLoaded', () => {
  App.requireAuth();
  App.initSidebar('reports');
  App.chartDefaults();

  let chartInstance = null;

  document.getElementById('btn-generate')?.addEventListener('click', generateReport);
  document.getElementById('btn-export-csv')?.addEventListener('click', exportCsv);
  document.getElementById('btn-export-pdf')?.addEventListener('click', exportPdf);

  function generateReport() {
    const platform = document.getElementById('filter-platform').value;
    const engType = document.getElementById('filter-eng').value;
    const campaign = document.getElementById('filter-campaign').value;

    let rows = [...DEMO.posts];
    if (platform) rows = rows.filter((p) => p.platform === platform);
    if (engType) rows = rows.filter((p) => p.engagement_type === engType);
    if (campaign) rows = rows.filter((p) => p.campaign_name === campaign);

    const summary = {
      total_reach: rows.reduce((s, p) => s + (p.reach || 0), 0),
      total_impressions: rows.reduce((s, p) => s + (p.impressions || 0), 0),
      total_engagement: rows.reduce((s, p) => s + DEMO.engagement(p), 0),
      total_clicks: rows.reduce((s, p) => s + (p.clicks || 0), 0),
      total_conversions: rows.reduce((s, p) => s + (p.conversions || 0), 0),
      total_ad_spend: rows.reduce((s, p) => s + (p.ad_spend || 0), 0),
      count: rows.length,
    };

    document.getElementById('report-preview').classList.remove('hidden');
    document.getElementById('r-reach').textContent = App.formatNumber(summary.total_reach);
    document.getElementById('r-impressions').textContent = App.formatNumber(summary.total_impressions);
    document.getElementById('r-engagement').textContent = App.formatNumber(summary.total_engagement);
    document.getElementById('r-clicks').textContent = App.formatNumber(summary.total_clicks);
    document.getElementById('r-conversions').textContent = App.formatNumber(summary.total_conversions);
    document.getElementById('r-spend').textContent = App.formatCurrency(summary.total_ad_spend);
    document.getElementById('r-count').textContent = summary.count;

    const tbody = document.getElementById('report-table-body');
    tbody.innerHTML = '';
    rows.forEach((p) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-surface-container';
      tr.innerHTML = `<td class="py-2 px-3 text-sm">${App.escapeHtml(p.post_name)}</td>
        <td class="py-2 px-3 text-sm">${App.escapeHtml(p.platform)}</td>
        <td class="py-2 px-3 text-sm">${p.engagement_type}</td>
        <td class="py-2 px-3 text-sm text-right tabular-nums">${App.formatNumber(p.reach)}</td>
        <td class="py-2 px-3 text-sm text-right tabular-nums">${App.formatNumber(DEMO.engagement(p))}</td>
        <td class="py-2 px-3 text-sm text-right tabular-nums">${App.formatCurrency(p.ad_spend)}</td>`;
      tbody.appendChild(tr);
    });

    // Chart
    const orgRows = rows.filter((p) => p.engagement_type === 'Organic');
    const paidRows = rows.filter((p) => p.engagement_type === 'Paid');
    const ctx = document.getElementById('report-chart');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Reach', 'Engagement', 'Clicks'],
        datasets: [
          {
            label: 'Organic',
            data: [
              orgRows.reduce((s, p) => s + p.reach, 0),
              orgRows.reduce((s, p) => s + DEMO.engagement(p), 0),
              orgRows.reduce((s, p) => s + p.clicks, 0),
            ],
            backgroundColor: '#14B8A6',
            borderRadius: 4,
          },
          {
            label: 'Paid',
            data: [
              paidRows.reduce((s, p) => s + p.reach, 0),
              paidRows.reduce((s, p) => s + DEMO.engagement(p), 0),
              paidRows.reduce((s, p) => s + p.clicks, 0),
            ],
            backgroundColor: '#2563EB',
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', align: 'end' } },
        scales: { y: { beginAtZero: true, ticks: { callback: (v) => App.formatNumber(v) } } },
      },
    });

    window.__reportRows = rows;
    App.toast('Report generated.', 'success', 2000);
  }

  function exportCsv() {
    const rows = window.__reportRows || DEMO.posts;
    const headers = ['platform','post_name','campaign_name','date','content_type','engagement_type','reach','impressions','likes','comments','shares','clicks','conversions','ad_spend'];
    const lines = [headers.join(',')];
    rows.forEach((r) => {
      lines.push(headers.map((h) => {
        const v = r[h] ?? '';
        const s = String(v);
        return s.includes(',') ? `"${s}"` : s;
      }).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `authentic_reach_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    App.toast('CSV exported.', 'success');
  }

  function exportPdf() {
    // Browser print as PDF fallback (no external lib required)
    const preview = document.getElementById('report-preview');
    if (preview.classList.contains('hidden')) {
      App.toast('Generate a report first.', 'error');
      return;
    }
    App.toast('Opening print dialog — choose “Save as PDF”.', 'info', 4000);
    window.print();
  }

  // Populate campaign filter
  const campSelect = document.getElementById('filter-campaign');
  if (campSelect) {
    [...new Set(DEMO.posts.map((p) => p.campaign_name).filter(Boolean))].forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      campSelect.appendChild(opt);
    });
  }
});
