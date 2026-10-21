/* Every listing keeps its own photo, price and source together. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = p => p ? new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency }).format(p.value) : 'Chưa có giá';
  let active = null, controller = null, returnFocus = null;
  const root = () => document.getElementById('cardModalContainer');
  const time = date => new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok' });

  window.openCardModal = function (id) {
    const card = allCards.find(c => c.id === id);
    if (!card) return;
    controller?.abort();
    returnFocus = document.activeElement;
    active = { card, listings: [], selected: null, tab: 'listings' };
    document.body.classList.add('inspector-open');
    root().innerHTML = `
      <div class="mi-backdrop" id="modalBackdrop">
        <section class="mi-window" role="dialog" aria-modal="true" aria-labelledby="mi-title" tabindex="-1">
          <header class="mi-topbar"><span class="mi-wordmark">COLLECTOR <span>/ INSPECT</span></span><button class="mi-close" data-action="close" aria-label="Đóng chi tiết">×</button></header>
          <div class="mi-heading"><div class="mi-eyebrow">THE CARD. THE LISTING. THE DETAILS.</div><h2 id="mi-title">${esc(card.name)}</h2><p>${esc(card.set)} <span>·</span> #${esc(card.card_number)} <span>·</span> ${esc(card.year)} <span>·</span> ${esc(card.language.toUpperCase())}</p></div>
          <nav class="mi-tabs" role="tablist" aria-label="Chi tiết thẻ">
            <button id="mi-tab-listings" role="tab" aria-controls="mi-listings" aria-selected="true" data-tab="listings">Tin rao eBay</button><button id="mi-tab-identity" role="tab" aria-controls="mi-identity" aria-selected="false" tabindex="-1" data-tab="identity">Định danh thẻ</button><button id="mi-tab-sources" role="tab" aria-controls="mi-sources" aria-selected="false" tabindex="-1" data-tab="sources">Nguồn dữ liệu</button>
          </nav>
          <div class="mi-scroll">
            <div id="mi-listings" role="tabpanel" aria-labelledby="mi-tab-listings"><div id="mi-live" aria-live="polite"></div></div>
            <div id="mi-identity" class="mi-prose" role="tabpanel" aria-labelledby="mi-tab-identity" hidden>
              <div class="mi-eyebrow">KNOW WHAT YOU'RE LOOKING AT</div><h3>Một lá thẻ. Đúng phiên bản.</h3><p>Thông tin từ hồ sơ nghiên cứu. Hãy đối chiếu lại với ảnh và nhãn slab trong từng tin rao.</p>
              <dl class="mi-facts">${[['Bộ thẻ', card.set], ['Số thẻ', card.card_number], ['Edition', card.edition], ['Foil', card.foil], ['Ngôn ngữ', card.language], ['Grade mục tiêu', card.grade]].map(([k,v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v || 'Chưa xác định')}</dd></div>`).join('')}</dl><p class="mi-footnote">Chứng thư trong hồ sơ chưa được liên kết với tin rao. Không dùng nó để xác nhận ảnh của người bán.</p>
            </div>
            <div id="mi-sources" class="mi-prose" role="tabpanel" aria-labelledby="mi-tab-sources" hidden><div class="mi-eyebrow">A CLEARER VIEW OF THE MARKET</div><h3>Biết giá đến từ đâu.</h3><dl class="mi-facts"><div><dt>Tin đang rao</dt><dd>eBay Browse API · US</dd></div><div><dt>Ảnh sản phẩm</dt><dd>Ảnh do người bán đăng trong cùng tin rao</dd></div><div><dt>Giá hiển thị</dt><dd>Giá Buy It Now, giữ nguyên tiền tệ</dd></div><div><dt>Phí và thuế</dt><dd>Phí ship ghi riêng; thuế xác nhận tại eBay</dd></div><div><dt>Bộ nhớ đệm</dt><dd>Tối đa 60 giây, có thời điểm lấy dữ liệu</dd></div></dl><p>Giá rao không phải giá đã bán. Kết quả tìm kiếm chỉ là ứng viên; tiêu đề khớp chưa chứng minh đúng artwork, phiên bản hoặc chứng thư.</p><p class="mi-footnote">Các mức giá và số lượng listing trên bảng nghiên cứu cũ chưa được xác minh trực tiếp. Không dùng chúng như dữ liệu eBay hiện tại.</p></div>
          </div>
          <footer class="mi-footer"><span>Thông tin rõ ràng. Quyết định có cơ sở.</span><button data-action="refresh">Làm mới tin rao ↻</button></footer>
        </section>
      </div>`;
    root().onclick = event => {
      if (event.target.id === 'modalBackdrop' || event.target.closest('[data-action="close"]')) return closeCardModal();
      const tab = event.target.closest('[data-tab]');
      if (tab) selectTab(tab.dataset.tab);
      const listing = event.target.closest('[data-listing]');
      if (listing) { active.selected = Number(listing.dataset.listing); renderListings(); }
      const thumb = event.target.closest('[data-photo]');
      if (thumb) {
        const img = document.getElementById('mi-main-photo');
        if (img) img.src = active.listings[active.selected].images[Number(thumb.dataset.photo)];
        root().querySelectorAll('[data-photo]').forEach(b => b.setAttribute('aria-pressed', String(b === thumb)));
      }
      if (event.target.closest('[data-action="refresh"]')) fetchListings();
    };
    root().querySelector('.mi-close').focus();
    fetchListings();
  };

  function selectTab(name) {
    active.tab = name;
    root().querySelectorAll('[data-tab]').forEach(b => { const selected = b.dataset.tab === name; b.setAttribute('aria-selected', String(selected)); b.tabIndex = selected ? 0 : -1; });
    ['listings', 'identity', 'sources'].forEach(t => { document.getElementById(`mi-${t}`).hidden = t !== name; });
  }

  async function fetchListings() {
    if (!active) return;
    controller?.abort();
    const request = new AbortController(); controller = request;
    const state = active;
    const live = document.getElementById('mi-live');
    live.innerHTML = `<div class="mi-loading"><div class="mi-skeleton"></div><div><div class="mi-eyebrow">CONNECTING TO EBAY</div><h3>Đang tìm tin rao cho bạn.</h3><p>Ảnh và giá được lấy từ cùng một sản phẩm.</p><div class="mi-skeleton mi-line"></div><div class="mi-skeleton mi-line short"></div></div></div>`;
    try {
      const response = await fetch(`/api/ebay/listings?cardId=${encodeURIComponent(state.card.id)}`, { signal: request.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể lấy dữ liệu eBay.');
      if (active !== state || request.signal.aborted) return;
      state.listings = data.listings; state.data = data;
      state.selected = data.listings.length ? 0 : null;
      renderListings();
    } catch (err) {
      if (err.name === 'AbortError' || active !== state) return;
      live.innerHTML = `<div class="mi-empty"><span class="mi-empty-icon">↗</span><div class="mi-eyebrow">EBAY CONNECTION</div><h3>Chưa có tin rao trực tiếp.</h3><p>${esc(err.message)}</p><div class="mi-empty-actions"><button class="mi-primary" data-action="refresh">Thử kết nối lại</button><a href="${esc(state.card.ebay_all_sellers_buy_it_now)}" target="_blank" rel="noopener noreferrer">Tìm trên eBay ↗</a></div><small>Giá cũ không được dùng thay cho giá đang rao.</small></div>`;
    }
  }

  function renderListings() {
    if (!active) return;
    const { listings, selected, data } = active;
    const live = document.getElementById('mi-live');
    if (!listings.length) { live.innerHTML = `<div class="mi-empty"><span class="mi-empty-icon">⌕</span><h3>Chưa tìm thấy tin rao.</h3><p>Không có kết quả trong lần tìm này. Thử lại sau hoặc kiểm tra trực tiếp trên eBay.</p><a href="${esc(active.card.ebay_all_sellers_buy_it_now)}" target="_blank" rel="noopener noreferrer">Tìm trên eBay ↗</a></div>`; return; }
    const item = listings[selected];
    live.innerHTML = `<div class="mi-result-meta"><span>${listings.length} ứng viên trong lần tìm này</span><span>${data.cached ? 'Bộ nhớ đệm · ' : ''}${esc(time(data.fetchedAt))}</span></div>
      <div class="mi-product"><div class="mi-gallery"><div class="mi-photo-stage">${item.image ? `<img id="mi-main-photo" src="${esc(item.image)}" alt="${esc(item.title)}" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="mi-photo-missing" hidden>Ảnh không tải được</span>` : '<span class="mi-photo-missing">Tin rao chưa có ảnh</span>'}</div><div class="mi-thumbs">${item.images.map((url,i) => `<button data-photo="${i}" aria-label="Ảnh ${i+1}" aria-pressed="${i === 0}"><img src="${esc(url)}" alt="" loading="lazy"></button>`).join('')}</div><p class="mi-photo-caption">Ảnh người bán · Cùng mã tin ${esc(item.itemId)}</p></div>
      <div class="mi-offer"><div class="mi-eyebrow">EBAY · BUY IT NOW</div><h3>${esc(item.title)}</h3><span class="mi-match ${item.match.status === 'TITLE_MATCH' ? 'mi-match-title' : ''}">${item.match.status === 'TITLE_MATCH' ? 'Tiêu đề khớp · Cần kiểm tra ảnh' : 'Cần đối chiếu phiên bản'}</span><div class="mi-price">${esc(money(item.price))}<span>${esc(item.price.currency)}</span></div><p class="mi-shipping">${item.shipping ? (item.shipping.value === 0 ? 'Miễn phí vận chuyển theo API' : `Phí vận chuyển: ${esc(money(item.shipping))}`) : 'Phí vận chuyển chưa xác định'} · Chưa gồm thuế</p>
      <dl class="mi-seller"><div><dt>Người bán</dt><dd>${esc(item.seller.username)}</dd></div><div><dt>Phản hồi tích cực</dt><dd>${item.seller.feedbackPercentage !== null ? esc(item.seller.feedbackPercentage) + '%' : 'Chưa rõ'}${item.seller.feedbackScore !== null ? ` · ${esc(item.seller.feedbackScore)} đánh giá` : ''}</dd></div><div><dt>Tình trạng</dt><dd>${esc(item.condition || 'Không có dữ liệu')}</dd></div><div><dt>Nơi bán</dt><dd>${esc(item.location || 'Chưa rõ')}</dd></div></dl>
      <a class="mi-primary mi-buy" href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Xem đúng tin này trên eBay <span>↗</span></a><p class="mi-footnote">Giá tại ${esc(time(item.fetchedAt))}. Giá và tình trạng có thể thay đổi khi mở eBay.</p><div class="mi-review">${item.match.reasons.length ? esc(item.match.reasons.join(' · ')) + '. ' : ''}${esc(item.match.note)}</div></div></div>
      <div class="mi-other-heading"><h3>So sánh các tin rao</h3><span>Ảnh và giá của từng người bán</span></div><div class="mi-offers">${listings.map((l,i) => `<button class="mi-offer-row ${i === selected ? 'selected' : ''}" data-listing="${i}" aria-pressed="${i === selected}">${l.image ? `<img src="${esc(l.image)}" alt="" loading="lazy">` : '<span class="mi-thumb-placeholder">—</span>'}<span class="mi-row-text"><strong>${esc(l.title)}</strong><small>${esc(l.seller.username)} · ${l.match.status === 'TITLE_MATCH' ? 'Tiêu đề khớp' : 'Cần đối chiếu'}</small></span><span class="mi-row-price">${esc(money(l.price))}<small>${esc(l.price.currency)}</small></span></button>`).join('')}</div>`;
  }

  window.closeCardModal = function () {
    controller?.abort(); active = null;
    root().innerHTML = ''; document.body.classList.remove('inspector-open');
    if (returnFocus?.isConnected) returnFocus.focus();
  };
  window.triggerPriceScan = async function () {
    if (active) { selectTab('listings'); await fetchListings(); return; }
    try {
      const res = await fetch('/api/ebay/status'); const status = await res.json();
      showToast(status.configured ? 'Chọn một thẻ để xem ảnh và giá tin rao eBay.' : 'Chưa kết nối eBay Production. Chọn thẻ để mở tab chi tiết.');
    } catch { showToast('Không kết nối được máy chủ. Hãy chạy ứng dụng bằng npm start.'); }
  };
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { closeCardModal(); return; }
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) && event.target.matches('[data-tab]')) {
      event.preventDefault(); const tabs = [...root().querySelectorAll('[data-tab]')]; const index = tabs.indexOf(event.target);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      selectTab(tabs[next].dataset.tab); tabs[next].focus();
    }
    if (event.key === 'Tab') {
      const nodes = [...root().querySelectorAll('button, a[href], [tabindex="0"]')].filter(el => el.getClientRects().length && el.tabIndex >= 0);
      const first = nodes[0], last = nodes[nodes.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    const button = document.getElementById('btnLiveScan'); if (button) button.textContent = 'Kết nối eBay ↗';
    const badge = document.getElementById('scanStatusBadge'); if (badge) badge.textContent = 'Bảng nghiên cứu: giá và số lượng tin chưa xác minh trực tiếp. Mở thẻ để tìm tin rao eBay.';
    const header = document.querySelector('header');
    const note = document.createElement('div'); note.className = 'mi-dashboard-note';
    note.textContent = 'Dữ liệu nghiên cứu chưa xác minh trực tiếp. Bấm vào thẻ để xem ảnh, giá và người bán từ cùng một tin eBay.';
    header?.after(note);
  });
})();
