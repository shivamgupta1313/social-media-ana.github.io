document.addEventListener('DOMContentLoaded', async () => {
  App.requireAuth();
  App.initSidebar('analytics');
  App.chartDefaults();

  const org = DEMO.summary((p) => p.engagement_type === 'Organic');
  const paid = DEMO.summary((p) => p.engagement_type === 'Paid');
  const all = DEMO.summary();
  const ovp = DEMO.organicVsPaid();

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };

  set('ov-reach', App.formatNumber(all.total_reach));
  set('ov-impressions', App.formatNumber(all.total_impressions));
  set('ov-engagement', App.formatNumber(all.total_engagement));
  set('ov-eng-rate', App.formatPercent(all.engagement_rate));
  set('ov-clicks', App.formatNumber(all.total_clicks));
  set('ov-conversions', App.formatNumber(all.total_conversions));

  set('org-reach', App.formatNumber(org.total_reach));
  set('org-engagement', App.formatNumber(org.total_engagement));
  set('org-eng-rate', App.formatPercent(org.engagement_rate));

  set('paid-reach', App.formatNumber(paid.total_reach));
  set('paid-engagement', App.formatNumber(paid.total_engagement));
  set('paid-spend', App.formatCurrency(paid.total_ad_spend));
  set('paid-cpc', App.formatCurrency(paid.cost_per_click));
  set('paid-cvr', App.formatPercent(paid.conversion_rate));

  // Comparison chart
  const ctx = document.getElementById('chart-comparison');
  if (ctx) {
    new Chart(ctx, {
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

  // Best organic posts
  const tbody = document.getElementById('best-organic-body');
  if (tbody) {
    DEMO.topPosts(10)
      .filter((p) => p.engagement_type === 'Organic')
      .slice(0, 5)
      .forEach((p) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-surface-container';
        tr.innerHTML = `<td class="py-3 px-4 text-sm font-medium">${App.escapeHtml(p.post_name)}</td>
          <td class="py-3 px-4 text-sm text-on-surface-variant">${App.escapeHtml(p.platform)}</td>
          <td class="py-3 px-4 text-sm text-right tabular-nums">${App.formatNumber(p.reach)}</td>
          <td class="py-3 px-4 text-sm text-right tabular-nums text-tertiary font-semibold">${App.formatPercent(p.eng_rate)}</td>`;
        tbody.appendChild(tr);
      });
  }

  // Campaign rankings table
  const campBody = document.getElementById('campaign-rank-body');
  if (campBody) {
    const camps = {};
    DEMO.posts.forEach((p) => {
      const c = p.campaign_name || 'Uncategorized';
      if (!camps[c]) camps[c] = { name: c, reach: 0, eng: 0, spend: 0 };
      camps[c].reach += p.reach || 0;
      camps[c].eng += DEMO.engagement(p);
      camps[c].spend += p.ad_spend || 0;
    });
    Object.values(camps)
      .sort((a, b) => b.reach - a.reach)
      .forEach((c) => {
        const tr = document.createElement('tr');
        tr.className = 'border-b border-surface-container';
        tr.innerHTML = `<td class="py-3 px-4 text-sm font-medium">${App.escapeHtml(c.name)}</td>
          <td class="py-3 px-4 text-sm text-right tabular-nums">${App.formatNumber(c.reach)}</td>
          <td class="py-3 px-4 text-sm text-right tabular-nums">${App.formatNumber(c.eng)}</td>
          <td class="py-3 px-4 text-sm text-right tabular-nums">${App.formatCurrency(c.spend)}</td>`;
        campBody.appendChild(tr);
      });
  }
});
