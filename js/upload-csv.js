document.addEventListener('DOMContentLoaded', () => {
  App.requireAuth();
  App.initSidebar('upload-csv');

  const EXPECTED = ['platform','post_name','campaign_name','date','content_type','engagement_type','reach','impressions','likes','comments','shares','clicks','conversions','ad_spend'];
  const NUMERIC = ['reach','impressions','likes','comments','shares','clicks','conversions','ad_spend'];
  const PLATFORMS = ['Instagram','Facebook','YouTube','LinkedIn','Other'];
  const CONTENT = ['Image','Video','Reel','Story','Text','Other'];
  const ENG = ['Organic','Paid'];

  let validRecords = [];
  let invalidRows = [];
  let uploading = false;

  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const previewSection = document.getElementById('preview-section');
  const previewBody = document.getElementById('preview-body');
  const validCountEl = document.getElementById('valid-count');
  const invalidCountEl = document.getElementById('invalid-count');
  const errorList = document.getElementById('error-list');
  const importBtn = document.getElementById('btn-import');
  const progressBar = document.getElementById('progress-bar');
  const progressWrap = document.getElementById('progress-wrap');

  // Sample CSV download
  document.getElementById('btn-sample')?.addEventListener('click', () => {
    const header = EXPECTED.join(',');
    const row = 'Instagram,Sample Post,Summer Launch,2025-07-01,Reel,Organic,10000,15000,500,20,30,200,5,0';
    const blob = new Blob([header + '\n' + row + '\n'], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'authentic_reach_sample.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });
  document.getElementById('btn-browse')?.addEventListener('click', () => fileInput.click());

  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      App.toast('Only CSV files are accepted.', 'error');
      return;
    }
    fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    const reader = new FileReader();
    reader.onload = (e) => parseCsv(e.target.result);
    reader.readAsText(file);
  }

  function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length < 2) {
      App.toast('CSV is empty or missing data rows.', 'error');
      return;
    }
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const missing = EXPECTED.filter((c) => !headers.includes(c));
    if (missing.length) {
      App.toast('Missing columns: ' + missing.join(', '), 'error');
      return;
    }

    validRecords = [];
    invalidRows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCsvLine(lines[i]);
      if (cols.every((c) => !c.trim())) continue;
      const row = {};
      headers.forEach((h, idx) => { row[h] = (cols[idx] || '').trim(); });
      const errors = validateRow(row, i + 1);
      if (errors.length) {
        invalidRows.push({ line: i + 1, errors, row });
      } else {
        NUMERIC.forEach((k) => { row[k] = Number(row[k] || 0); });
        if (row.engagement_type === 'Organic') row.ad_spend = 0;
        validRecords.push(row);
      }
    }

    validCountEl.textContent = validRecords.length;
    invalidCountEl.textContent = invalidRows.length;
    errorList.innerHTML = '';
    invalidRows.slice(0, 20).forEach((r) => {
      const li = document.createElement('li');
      li.className = 'text-sm text-error';
      li.textContent = `Row ${r.line}: ${r.errors.join('; ')}`;
      errorList.appendChild(li);
    });
    if (invalidRows.length > 20) {
      const li = document.createElement('li');
      li.className = 'text-sm text-on-surface-variant';
      li.textContent = `…and ${invalidRows.length - 20} more.`;
      errorList.appendChild(li);
    }

    previewBody.innerHTML = '';
    validRecords.slice(0, 10).forEach((r) => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-surface-container';
      tr.innerHTML = `<td class="py-2 px-3 text-sm">${App.escapeHtml(r.platform)}</td>
        <td class="py-2 px-3 text-sm">${App.escapeHtml(r.post_name)}</td>
        <td class="py-2 px-3 text-sm">${App.escapeHtml(r.engagement_type)}</td>
        <td class="py-2 px-3 text-sm text-right tabular-nums">${App.formatNumber(r.reach)}</td>
        <td class="py-2 px-3 text-sm text-right tabular-nums">${App.formatNumber(r.impressions)}</td>`;
      previewBody.appendChild(tr);
    });
    previewSection.classList.remove('hidden');
    importBtn.disabled = validRecords.length === 0;
  }

  function splitCsvLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQuotes = !inQuotes; continue; }
      if (c === ',' && !inQuotes) { result.push(cur); cur = ''; continue; }
      cur += c;
    }
    result.push(cur);
    return result;
  }

  function validateRow(row, lineNum) {
    const errs = [];
    if (!row.platform) errs.push('platform required');
    else if (!PLATFORMS.includes(row.platform)) errs.push('invalid platform');
    if (!row.post_name) errs.push('post_name required');
    if (!row.date) errs.push('date required');
    if (!row.content_type || !CONTENT.includes(row.content_type)) errs.push('invalid content_type');
    if (!row.engagement_type || !ENG.includes(row.engagement_type)) errs.push('invalid engagement_type');
    for (const k of NUMERIC) {
      const v = Number(row[k] || 0);
      if (Number.isNaN(v) || v < 0) errs.push(`${k} must be non-negative number`);
    }
    return errs;
  }

  importBtn.addEventListener('click', async () => {
    if (uploading || !validRecords.length) return;
    uploading = true;
    importBtn.disabled = true;
    progressWrap.classList.remove('hidden');
    progressBar.style.width = '30%';
    try {
      progressBar.style.width = '70%';
      await API.importCsv(validRecords);
      progressBar.style.width = '100%';
      App.toast(`Imported ${validRecords.length} records successfully.`, 'success');
    } catch (err) {
      if (err.message.includes('Cannot reach API')) {
        App.toast(`Validated ${validRecords.length} records. API offline — data not persisted.`, 'info', 6000);
      } else {
        App.toast(err.message || 'Import failed.', 'error');
      }
    } finally {
      uploading = false;
      importBtn.disabled = false;
      setTimeout(() => { progressWrap.classList.add('hidden'); progressBar.style.width = '0%'; }, 800);
    }
  });
});
