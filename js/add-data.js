document.addEventListener('DOMContentLoaded', () => {
  App.requireAuth();
  App.initSidebar('add-data');

  const form = document.getElementById('add-data-form');
  const engType = document.getElementById('engagement_type');
  const adSpendGroup = document.getElementById('ad-spend-group');
  const adSpendInput = document.getElementById('ad_spend');

  function toggleAdSpend() {
    const isPaid = engType.value === 'Paid';
    adSpendGroup.classList.toggle('opacity-50', !isPaid);
    adSpendInput.disabled = !isPaid;
    if (!isPaid) adSpendInput.value = '0';
    adSpendInput.required = isPaid;
  }
  engType.addEventListener('change', toggleAdSpend);
  toggleAdSpend();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());

    // Validation
    const required = ['platform', 'post_name', 'date', 'content_type', 'engagement_type', 'reach', 'impressions'];
    for (const k of required) {
      if (!payload[k] && payload[k] !== 0) {
        App.toast(`${k.replace('_', ' ')} is required.`, 'error');
        return;
      }
    }
    const numeric = ['reach', 'impressions', 'likes', 'comments', 'shares', 'clicks', 'conversions', 'ad_spend'];
    for (const k of numeric) {
      const v = Number(payload[k] || 0);
      if (Number.isNaN(v) || v < 0) {
        App.toast(`${k} must be a non-negative number.`, 'error');
        return;
      }
      payload[k] = v;
    }
    if (payload.engagement_type === 'Organic') payload.ad_spend = 0;

    const btn = form.querySelector('[type="submit"]');
    App.setLoading(btn, true);
    try {
      await API.createSocialData(payload);
      App.toast('Data saved successfully.', 'success');
      form.reset();
      toggleAdSpend();
    } catch (err) {
      if (err.message.includes('Cannot reach API')) {
        App.toast('API offline — record validated but not persisted. Connect Flask backend to save.', 'info', 6000);
      } else {
        App.toast(err.message || 'Failed to save.', 'error');
      }
    } finally {
      App.setLoading(btn, false);
    }
  });

  document.getElementById('btn-reset')?.addEventListener('click', () => {
    form.reset();
    toggleAdSpend();
  });
  document.getElementById('btn-cancel')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
});
