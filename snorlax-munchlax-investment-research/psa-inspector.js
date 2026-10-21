/* Free public research. Source estimates are never labelled as PSA valuations. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const num = value => Number.isFinite(value) ? value.toLocaleString('vi-VN') : '—';
  const pct = value => Number.isFinite(value) ? value.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + '%' : '—';
  const money = price => price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: price.currency }).format(price.market) : 'Chưa có giá';
  const date = value => value ? new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' }) : 'Nguồn chưa công bố';
  let active = null, controller = null, returnFocus = null;
  const root = () => document.getElementById('cardModalContainer');
  window.openCardModal = function (id) {
    const card = allCards.find(c => c.id === id);
    if (!card) return;
    controller?.abort(); returnFocus = document.activeElement;
    active = { card, tab: 'overview', grade: '10', data: null };
    document.body.classList.add('inspector-open');
    root().innerHTML = `<div class="mi-backdrop" id="modalBackdrop"><section class="mi-window" role="dialog" aria-modal="true" aria-labelledby="mi-title" tabindex="-1">
      <header class="mi-topbar"><span class="mi-wordmark">COLLECTOR <span>/ PSA RESEARCH</span></span><button class="mi-close" data-action="close" aria-label="Đóng chi tiết">×</button></header>
      <div class="mi-heading"><div class="mi-eyebrow">THE CARD. THE GRADE. THE POPULATION.</div><h2 id="mi-title">${esc(card.name)}</h2><p>${esc(card.set)} <span>·</span> #${esc(card.card_number)} <span>·</span> ${esc(card.year)} <span>·</span> ${esc((card.language || '').toUpperCase())}</p></div>
      <nav class="mi-tabs" role="tablist" aria-label="Nghiên cứu PSA">${[['overview','Tổng quan'],['population','Phân bố điểm'],['sources','Nguồn & định danh']].map(([id,label],i) => `<button id="mi-tab-${id}" role="tab" aria-controls="mi-${id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-tab="${id}">${label}</button>`).join('')}</nav>
      <div class="mi-scroll"><div id="mi-overview" role="tabpanel" aria-labelledby="mi-tab-overview"><div id="mi-summary" aria-live="polite"></div></div><div id="mi-population" role="tabpanel" aria-labelledby="mi-tab-population" hidden></div><div id="mi-sources" class="mi-prose" role="tabpanel" aria-labelledby="mi-tab-sources" hidden></div></div>
      <footer class="mi-footer"><span>Giá tham khảo · Population PSA qua nguồn công khai</span><button data-action="refresh">Cập nhật dữ liệu ↻</button></footer></section></div>`;
    root().onclick = event => {
      if (event.target.id === 'modalBackdrop' || event.target.closest('[data-action="close"]')) return closeCardModal();
      const tab = event.target.closest('[data-tab]'); if (tab) selectTab(tab.dataset.tab);
      const grade = event.target.closest('[data-grade]'); if (grade) { active.grade = grade.dataset.grade; render(); }
      if (event.target.closest('[data-action="refresh"]')) fetchResearch(true);
    };
    root().querySelector('.mi-close').focus(); fetchResearch();
  };
  function selectTab(tab) {
    if (!active) return;
    active.tab = tab;
    root().querySelectorAll('[data-tab]').forEach(button => { const selected = button.dataset.tab === tab; button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1; });
    ['overview','population','sources'].forEach(id => { document.getElementById(`mi-${id}`).hidden = id !== tab; });
  }
  async function fetchResearch(refresh = false) {
    if (!active) return;
    controller?.abort(); const request = new AbortController(); controller = request;
    const state = active, summary = document.getElementById('mi-summary');
    summary.innerHTML = `<div class="mi-loading"><div class="mi-skeleton"></div><div><div class="mi-eyebrow">PUBLIC DATA · NO API KEY</div><h3>Đọc hồ sơ PSA.</h3><p>Đang tải giá tham khảo và số lượng ở từng điểm.</p><div class="mi-skeleton mi-line"></div></div></div>`;
    if (!state.data) { document.getElementById('mi-population').innerHTML = '<p class="mi-footnote">Đang tải population…</p>'; document.getElementById('mi-sources').innerHTML = '<p class="mi-footnote">Đang tải nguồn…</p>'; }
    try {
      const response = await fetch(`/api/psa/research?cardId=${encodeURIComponent(state.card.id)}${refresh ? '&refresh=1' : ''}`, { signal: request.signal });
      if (!response.ok) throw new Error('Không tải được hồ sơ nghiên cứu.');
      const data = await response.json();
      if (active !== state || request.signal.aborted) return;
      state.data = data; render();
    } catch (error) {
      if (error.name === 'AbortError' || active !== state) return;
      summary.innerHTML = `<div class="mi-empty"><h3>Chưa tải được dữ liệu.</h3><p>${esc(error.message)}</p><button class="mi-primary" data-action="refresh">Thử lại</button></div>`;
    }
  }
  function render() {
    if (!active?.data) return;
    const { card, data, grade } = active, pop = data.population;
    const price = data.prices.find(p => p.grade === grade), gradeCount = pop?.grades.find(g => g.grade === grade);
    const rarity = !pop || !pop.total ? 'Chưa đủ dữ liệu' : pop.gemRate < 1 ? 'PSA 10 chiếm dưới 1%' : pop.gemRate < 5 ? 'PSA 10 chiếm dưới 5%' : pop.gemRate < 20 ? 'PSA 10 chiếm dưới 20%' : 'PSA 10 chiếm từ 20%';
    const status = data.stale ? `<div class="pr-status pr-warning">Làm mới chưa thành công; đang giữ bản lấy lúc ${esc(date(data.fetchedAt))}. ${esc(data.refreshError)}</div>` : `<div class="pr-status">${data.sourceUrl ? `Lấy từ trang công khai lúc ${esc(date(data.fetchedAt))}${data.cached ? ' · Lưu đệm 1 giờ' : ''}` : 'Chưa có nguồn khớp đúng phiên bản.'}</div>`;
    const photo = data.image ? `<img src="${esc(data.image)}" alt="Artwork tham khảo ${esc(card.name)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span hidden>Chưa tải được ảnh</span>` : '<span class="mi-photo-missing">Chưa có ảnh tham khảo khớp nguồn</span>';
    const availableGrades = [...new Set(['10','9','8',...data.prices.map(p => p.grade)])].sort((a,b) => Number(b)-Number(a));
    document.getElementById('mi-summary').innerHTML = `${status}<div class="mi-product pr-product"><div class="mi-gallery"><div class="mi-photo-stage">${photo}</div><p class="mi-photo-caption">${esc(data.imageCaption || 'Không thay bằng ảnh lá khác.')}</p></div><div class="mi-offer"><div class="mi-eyebrow">PSA GRADED · MARKET REFERENCE</div><h3>Giá theo điểm. Độ hiếm từ dữ liệu.</h3><div class="pr-grade-picker" aria-label="Chọn điểm PSA">${availableGrades.map(g => `<button data-grade="${esc(g)}" aria-pressed="${g===grade}">PSA ${esc(g)}</button>`).join('')}</div><div class="mi-price">${esc(money(price))}${price ? `<span>${esc(price.currency)}</span>` : ''}</div><p class="mi-shipping">Giá thị trường tham khảo cho PSA ${esc(grade)} do Scrydex tổng hợp. Không phải định giá chính thức do PSA công bố.</p><dl class="mi-seller"><div><dt>Population PSA ${esc(grade)}</dt><dd>${num(gradeCount?.count)} thẻ</dd></div><div><dt>Tỷ trọng điểm ${esc(grade)}</dt><dd>${pct(gradeCount?.percent)}</dd></div><div><dt>Ngày nguồn cập nhật</dt><dd>${esc(date(data.sourceUpdatedAt))}</dd></div></dl>${data.sourceUrl ? `<a class="mi-primary mi-buy" href="${esc(data.sourceUrl)}" target="_blank" rel="noopener noreferrer">Đối chiếu nguồn miễn phí <span>↗</span></a>` : `<p class="mi-review">${esc(data.message || 'Nguồn chưa có dữ liệu cho đúng thẻ này.')}</p>`}${(data.identityNotes || []).map(note => `<p class="mi-review pr-warning">${esc(note)}</p>`).join('')}</div></div>
      <div class="pr-metrics"><div><span>Population được báo cáo</span><strong>${num(pop?.total)}</strong><small>Số bản ghi trong báo cáo nguồn</small></div><div><span>PSA 10</span><strong>${num(pop?.psa10)}</strong><small>${esc(rarity)}</small></div><div><span>Tỷ lệ PSA 10</span><strong>${pct(pop?.gemRate)}</strong><small>PSA 10 ÷ population tổng</small></div><div><span>Tỷ lệ điểm 9 trở lên</span><strong>${pct(pop?.highGradeRate)}</strong><small>Không gồm điểm có qualifier</small></div></div><p class="mi-footnote">Population không phải tổng số thẻ từng gửi đến PSA: thẻ bị từ chối, không chấm điểm hoặc tái chấm có thể không được phản ánh như lượt gửi độc lập. Tỷ lệ này không phải xác suất đạt điểm cho lá thẻ bạn định gửi.</p>`;
    const grades = pop?.grades || [];
    document.getElementById('mi-population').innerHTML = `<div class="pr-section-head"><div class="mi-eyebrow">THE GRADE DISTRIBUTION</div><h3>${pop ? `${num(pop.total)} bản ghi. Từng điểm rõ ràng.` : 'Chưa có population xác minh.'}</h3><p>Đếm theo đúng phiên bản ${esc(data.variant || '')}. Q = qualifier; các điểm lẻ giữ riêng.</p></div>${pop ? `<div class="pr-grade-table" role="table" aria-label="Phân bố điểm PSA"><div class="pr-grade-row pr-table-head" role="row"><span role="columnheader">Điểm PSA</span><span role="columnheader">Phân bố</span><span role="columnheader">Số lượng</span><span role="columnheader">Tỷ trọng</span></div>${grades.map(g => `<div class="pr-grade-row ${g.grade === '10' ? 'pr-gem' : ''}" role="row"><strong role="cell">${esc(g.grade)}</strong><div role="cell" aria-label="${esc(pct(g.percent))}"><div class="pr-track"><div style="width:${g.percent || 0}%"></div></div></div><span role="cell">${num(g.count)}</span><span role="cell">${pct(g.percent)}</span></div>`).join('')}${pop.unclassified ? `<div class="pr-grade-row" role="row"><strong role="cell">Khác</strong><span role="cell">Chưa tách điểm</span><span role="cell">${num(pop.unclassified)}</span><span role="cell">${pct(pop.total ? pop.unclassified/pop.total*100 : null)}</span></div>` : ''}</div><p class="mi-footnote">Điểm không có dòng trong nguồn không được thêm số 0 giả. Tỷ trọng dùng population tổng ${num(pop.total)} làm mẫu số; tổng phần trăm có thể lệch nhẹ do làm tròn.</p>` : `<div class="mi-empty"><p>${esc(data.message || 'Nguồn chưa công bố population cho phiên bản này.')}</p></div>`}`;
    document.getElementById('mi-sources').innerHTML = `<div class="mi-eyebrow">TRACEABLE. PUBLIC. FREE TO VIEW.</div><h3>Nguồn và phạm vi dữ liệu.</h3><dl class="mi-facts">${[['Giá PSA graded','Giá thị trường do Scrydex tổng hợp; không phải PSA Price Guide'],['Population','Population PSA do Scrydex hiển thị lại'],['Thời điểm lấy',date(data.fetchedAt)],['Ngày nguồn cập nhật',date(data.sourceUpdatedAt)],['Tên tại nguồn',data.sourceIdentity?.name],['Bộ thẻ tại nguồn',data.sourceIdentity?.set],['Số tại nguồn',data.sourceIdentity?.number],['Ngôn ngữ',data.sourceIdentity?.language],['Phiên bản',data.variant],['PSA Spec ID',pop?.specId]].map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || 'Chưa có dữ liệu')}</dd></div>`).join('')}</dl>${data.sourceUrl ? `<a class="pr-source-link" href="${esc(data.sourceUrl)}" target="_blank" rel="noopener noreferrer">Mở hồ sơ Scrydex ↗</a>` : ''}${pop?.specId ? `<a class="pr-source-link" href="https://www.psacard.com/spec/psa/${encodeURIComponent(pop.specId)}" target="_blank" rel="noopener noreferrer">Đối chiếu PSA gốc (có thể cần đăng nhập) ↗</a>` : ''}<p class="mi-footnote">Dữ liệu lấy từ trang web công khai, không cần mua API. Nguồn chưa công bố thời điểm cập nhật nên không gắn nhãn “PSA mới nhất”. Population là số lượng trong hệ thống chấm điểm, không phải tổng lượng in hay tổng thẻ tồn tại. Báo cáo nguồn có thể trễ hoặc có sai sót.</p>${data.evidenceHash ? `<p class="mi-footnote pr-hash">Mã kiểm tra bản dữ liệu: ${esc(data.evidenceHash)}</p>` : ''}`;
    selectTab(active.tab);
  }
  window.closeCardModal = function () { controller?.abort(); active = null; root().innerHTML = ''; document.body.classList.remove('inspector-open'); if (returnFocus?.isConnected) returnFocus.focus(); };
  window.triggerPriceScan = async function () { if (active) { await fetchResearch(true); return; } showToast('Chọn một thẻ để xem population và giá PSA graded từ nguồn miễn phí.'); };
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { closeCardModal(); return; }
    if (['ArrowLeft','ArrowRight','Home','End'].includes(event.key) && event.target.matches('[data-tab]')) {
      event.preventDefault(); const tabs = [...root().querySelectorAll('[data-tab]')], index = tabs.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].dataset.tab); tabs[next].focus();
    }
    if (event.key === 'Tab') { const nodes = [...root().querySelectorAll('button, a[href], [tabindex="0"]')].filter(el => el.getClientRects().length && el.tabIndex >= 0); if (event.shiftKey && document.activeElement === nodes[0]) { event.preventDefault(); nodes.at(-1).focus(); } if (!event.shiftKey && document.activeElement === nodes.at(-1)) { event.preventDefault(); nodes[0].focus(); } }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('btnLiveScan'); if (button) button.textContent = 'Dữ liệu PSA ↗';
    const badge = document.getElementById('scanStatusBadge'); if (badge) badge.textContent = 'Nguồn miễn phí: Scrydex · Giá PSA graded và population có nguồn đối chiếu.';
    const note = document.createElement('div'); note.className = 'mi-dashboard-note'; note.textContent = 'Bấm vào thẻ để xem giá PSA graded, population và tỷ trọng từng điểm từ nguồn công khai. Thẻ chưa khớp nguồn sẽ hiển thị “chưa có dữ liệu”.'; document.querySelector('header')?.after(note);
  });
})();
