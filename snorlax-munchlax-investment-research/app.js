// ========================================================
// Snorlax & Munchlax Mega Database (135 PSA Graded Cards)
// Client Application Logic - In-App Inspection Pop-up Tab
// ========================================================

let allCards = [];
let currentCategoryTab = 'infinite-grails';
let currentViewMode = 'leaderboard';
let activeModalSubTab = 'tab-slab';

document.addEventListener('DOMContentLoaded', async () => {
  await loadCardsData();
});

async function loadCardsData() {
  try {
    let res = await fetch('/api/cards');
    if (!res.ok) {
      res = await fetch('data/cards.json');
    }
    if (!res.ok) throw new Error('Không thể tải cơ sở dữ liệu thẻ');
    allCards = await res.json();
    initDashboard();
  } catch (err) {
    console.error('Lỗi khởi tạo:', err);
    document.getElementById('cardsContainer').innerHTML = `
      <div style="grid-column: 1/-1; padding: 40px; text-align: center; color: #dc2626; background: #fef2f2; border-radius: 12px; border: 1px solid #fecaca;">
        <h3>Không thể tải dữ liệu nghiên cứu thẻ</h3>
        <p>${err.message}</p>
      </div>
    `;
  }
}

function initDashboard() {
  updateKPIs(allCards);
  setupFeaturedTabs();
  renderFeaturedPicks();
  setupEventListeners();
  applyFiltersAndSort();
}

function updateKPIs(cards) {
  const total = cards.length;
  const dealsCount = cards.filter(c => c.diff_vs_pricecharting_percent < -4).length;
  const scarceCount = cards.filter(c => c.active_ebay_listings <= 3).length;
  const floodedCount = cards.filter(c => c.active_ebay_listings > 50).length;
  const infiniteReadyCount = cards.filter(c => c.infinite_game_ready).length;

  document.getElementById('kpiTotal').textContent = total;
  document.getElementById('kpiDeals').textContent = dealsCount;
  document.getElementById('kpiScarce').textContent = scarceCount;
  document.getElementById('kpiFlooded').textContent = floodedCount;
  document.getElementById('kpiInfiniteReady').textContent = infiniteReadyCount;
}

// Strict Fail-Closed Fallback (Rules v2.0): Never substitute with another card's image
function handleImgError(imgElement, cardTitle, cardNum) {
  imgElement.onerror = null; // prevent loop
  const parent = imgElement.parentElement;
  if (parent) {
    parent.innerHTML = `
      <div class="card-unverified-placeholder">
        <span class="placeholder-icon">🎴</span>
        <div class="placeholder-title">Chưa có ảnh được xác minh</div>
        <div class="placeholder-desc">${cardTitle || ''} #${cardNum || ''}</div>
        <div class="placeholder-tag">Fail-Closed &bull; Không thế ảnh lá khác</div>
      </div>
    `;
  }
}

function clearSearch() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  if (input) {
    input.value = '';
    if (clearBtn) clearBtn.classList.remove('visible');
    input.focus();
    applyFiltersAndSort();
  }
}

function setupFeaturedTabs() {
  const tabs = document.querySelectorAll('.cat-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategoryTab = tab.dataset.category;
      renderFeaturedPicks();
    });
  });
}

function renderFeaturedPicks() {
  const container = document.getElementById('featuredPicksContainer');
  let filtered = [];

  if (currentCategoryTab === 'infinite-grails') {
    filtered = allCards.filter(c => c.infinite_game_tier.includes('Tier S')).slice(0, 5);
  } else if (currentCategoryTab === 'best-deals') {
    // Cards with biggest discount vs PriceCharting
    filtered = [...allCards]
      .filter(c => c.diff_vs_pricecharting_percent < 0)
      .sort((a, b) => a.diff_vs_pricecharting_percent - b.diff_vs_pricecharting_percent)
      .slice(0, 5);
  } else if (currentCategoryTab === 'scarce-supply') {
    filtered = [...allCards]
      .filter(c => c.active_ebay_listings <= 2 && c.infinite_game_ready)
      .sort((a, b) => a.active_ebay_listings - b.active_ebay_listings)
      .slice(0, 5);
  } else if (currentCategoryTab === 'related-char') {
    filtered = allCards.filter(c => c.category_group === 'Related' || c.pokemon_species === 'Tag Team').slice(0, 5);
  } else if (currentCategoryTab === 'flooded-avoid') {
    filtered = [...allCards]
      .sort((a, b) => b.active_ebay_listings - a.active_ebay_listings)
      .slice(0, 5);
  }

  container.innerHTML = filtered.map(card => `
    <div class="mini-card" onclick="openCardModal('${card.id}')">
      <span class="mini-rank-pill">#${card.rank_overall}</span>
      <img 
        src="${card.image?.status === 'APPROVED' ? card.image.source_url : 'listing-placeholder.svg'}" 
        alt="${card.name}" 
        class="mini-card-img" 
        onerror="handleImgError(this, '${card.image_backup_url}', '${card.pokemon_species}')" 
      />
      <div class="mini-card-info">
        <div class="mini-card-title">${card.name}</div>
        <div class="mini-card-set">${card.pokemon_species} &bull; ${card.active_ebay_listings} người bán eBay</div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px; margin-left:auto;">
        <div class="mini-card-price">Chưa xác minh</div>
        <a href="${card.ebay_all_sellers_buy_it_now}" target="_blank" rel="noopener noreferrer" class="btn-ebay-mini" onclick="event.stopPropagation();" title="Tìm trên eBay (PSA 10 Graded)">
          🛍️ eBay PSA 10
        </a>
      </div>
    </div>
  `).join('');
}

function setViewMode(mode) {
  currentViewMode = mode;
  const btnLeaderboard = document.getElementById('btnViewLeaderboard');
  const btnGrid = document.getElementById('btnViewGrid');
  const leaderboardView = document.getElementById('leaderboardView');
  const cardsContainer = document.getElementById('cardsContainer');

  if (mode === 'leaderboard') {
    btnLeaderboard.classList.add('active');
    btnGrid.classList.remove('active');
    leaderboardView.style.display = 'block';
    cardsContainer.style.display = 'none';
  } else {
    btnLeaderboard.classList.remove('active');
    btnGrid.classList.add('active');
    leaderboardView.style.display = 'none';
    cardsContainer.style.display = 'grid';
  }
}

function setupEventListeners() {
  // Apple Segmented Control Click
  document.querySelectorAll('.apple-segment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.apple-segment-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      applyFiltersAndSort();
    });
  });

  ['priceDealFilter', 'saturationFilter', 'infiniteFilter', 'sortSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFiltersAndSort);
  });

  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (clearBtn) {
        if (searchInput.value.trim().length > 0) clearBtn.classList.add('visible');
        else clearBtn.classList.remove('visible');
      }
      applyFiltersAndSort();
    });
  }

  document.getElementById('resetFiltersBtn').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.classList.remove('visible');
    document.getElementById('priceDealFilter').value = 'all';
    document.getElementById('saturationFilter').value = 'all';
    document.getElementById('infiniteFilter').value = 'all';
    document.getElementById('sortSelect').value = 'rank-asc';
    
    document.querySelectorAll('.apple-segment-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.apple-segment-btn[data-filter="all"]').classList.add('active');

    applyFiltersAndSort();
  });
}

function getImageStatusBadgeHtml(card) {
  if (card.scope === 'OUT_OF_SCOPE' || !card.is_standard_tcg) {
    return `<span class="badge-img-status badge-oos">📦 Ngoài TCG (${card.item_type})</span>`;
  }
  const status = card.image ? card.image.status : 'MISSING';
  if (status === 'APPROVED') {
    return `<span class="badge-img-status badge-approved">✅ Ảnh đã xác minh 100%</span>`;
  }
  if (status === 'REFERENCE_ART_ONLY') {
    return `<span class="badge-img-status badge-ref">📷 Ảnh mặt thẻ tham khảo</span>`;
  }
  if (status === 'REVIEW_REQUIRED') {
    return `<span class="badge-img-status badge-review">⚠️ Chờ đối chiếu biến thể</span>`;
  }
  return `<span class="badge-img-status badge-oos">❌ Chưa xác minh ảnh</span>`;
}

function applyFiltersAndSort() {
  const activeSegment = document.querySelector('.apple-segment-btn.active');
  const speciesFilter = activeSegment ? activeSegment.dataset.filter : 'standard';
  const priceDealFilter = document.getElementById('priceDealFilter').value;
  const saturationFilter = document.getElementById('saturationFilter').value;
  const infiniteFilter = document.getElementById('infiniteFilter').value;
  const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
  const sortBy = document.getElementById('sortSelect').value;

  let result = allCards.filter(card => {
    // Scope & Species Filter (Rules v2.0)
    if (speciesFilter === 'standard' && !card.is_standard_tcg) return false;
    if (speciesFilter === 'Snorlax' && (card.pokemon_species !== 'Snorlax' || !card.is_standard_tcg)) return false;
    if (speciesFilter === 'Munchlax' && (card.pokemon_species !== 'Munchlax' || !card.is_standard_tcg)) return false;
    if (speciesFilter === 'out-of-scope' && card.is_standard_tcg) return false;
    // 'all' passes everything (all 133 SKU)

    // Price vs PriceCharting Deal Filter
    const diff = card.diff_vs_pricecharting_percent;
    if (priceDealFilter === 'deals' && diff >= -4) return false;
    if (priceDealFilter === 'fair' && (diff < -5 || diff > 10)) return false;
    if (priceDealFilter === 'overpriced' && diff < 15) return false;

    // Saturation filter
    const act = card.active_ebay_listings;
    if (saturationFilter === 'scarce' && act > 3) return false;
    if (saturationFilter === 'moderate' && (act < 4 || act > 15)) return false;
    if (saturationFilter === 'high' && (act < 16 || act > 50)) return false;
    if (saturationFilter === 'flooded' && act <= 50) return false;

    // Infinite Game Filter
    if (infiniteFilter === 'ready' && !card.infinite_game_ready) return false;
    if (infiniteFilter === 'tier-s' && !card.infinite_game_tier.includes('Tier S')) return false;
    if (infiniteFilter === 'fail' && card.infinite_game_ready) return false;

    // Search query
    if (searchQuery) {
      const matchName = card.name.toLowerCase().includes(searchQuery);
      const matchSet = card.set.toLowerCase().includes(searchQuery);
      const matchNum = card.card_number.toLowerCase().includes(searchQuery);
      const matchCert = (card.psa_cert_number || '').includes(searchQuery);
      if (!matchName && !matchSet && !matchNum && !matchCert) return false;
    }

    return true;
  });

  // Sorting
  result.sort((a, b) => {
    if (sortBy === 'rank-asc') return a.rank_overall - b.rank_overall;
    if (sortBy === 'discount-desc') return a.diff_vs_pricecharting_percent - b.diff_vs_pricecharting_percent;
    if (sortBy === 'ebay-scarce') return a.active_ebay_listings - b.active_ebay_listings;
    if (sortBy === 'ebay-flooded') return b.active_ebay_listings - a.active_ebay_listings;
    if (sortBy === 'price-asc') return a.buy_it_now_price - b.buy_it_now_price;
    if (sortBy === 'price-desc') return b.buy_it_now_price - a.buy_it_now_price;
    return 0;
  });

  renderLeaderboard(result);
  renderCardsGrid(result);
}

function getSaturationBadgeHtml(active) {
  if (active <= 3) return `<span class="sat-badge sat-scarce">🟢 ${active} listing (Cực hiếm)</span>`;
  if (active <= 15) return `<span class="sat-badge sat-moderate">🔵 ${active} listing (Vừa phải)</span>`;
  if (active <= 50) return `<span class="sat-badge sat-high">🟣 ${active} listing (Nhiều)</span>`;
  return `<span class="sat-badge sat-flooded">🔴 ${active} listing (Bão hòa xả hàng)</span>`;
}

function getTierBadgeHtml(tier) {
  if (tier.includes('Tier S')) return `<span class="tier-badge tier-s">${tier}</span>`;
  if (tier.includes('Tier A')) return `<span class="tier-badge tier-a">${tier}</span>`;
  if (tier.includes('Tier B')) return `<span class="tier-badge tier-b">${tier}</span>`;
  return `<span class="tier-badge tier-c">${tier}</span>`;
}

function getPriceDealBadgeHtml(diffPercent) {
  if (diffPercent <= -10) {
    return `<span class="deal-badge deal-great">🔥 Rẻ hơn ${Math.abs(diffPercent)}% (KÈO NGON)</span>`;
  }
  if (diffPercent < 0) {
    return `<span class="deal-badge deal-great">⚡ Rẻ hơn ${Math.abs(diffPercent)}%</span>`;
  }
  if (diffPercent >= 15) {
    return `<span class="deal-badge deal-over">⚠️ Đắt hơn +${diffPercent}%</span>`;
  }
  return `<span class="deal-badge deal-fair">✔️ Giá chuẩn (+${diffPercent}%)</span>`;
}

function renderLeaderboard(cards) {
  const tbody = document.getElementById('leaderboardTbody');
  const countEl = document.getElementById('resultsCount');
  countEl.innerHTML = `Hiển thị <b>${cards.length}</b> / ${allCards.length} thẻ PSA Graded`;

  if (cards.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
          Không tìm thấy thẻ nào khớp với tiêu chí lọc.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = cards.map(card => {
    let rankBadgeClass = 'rank-normal';
    let rankIcon = `#${card.rank_overall}`;
    if (card.rank_overall === 1) {
      rankBadgeClass = 'rank-gold';
      rankIcon = '🥇 #1';
    } else if (card.rank_overall === 2) {
      rankBadgeClass = 'rank-silver';
      rankIcon = '🥈 #2';
    } else if (card.rank_overall === 3) {
      rankBadgeClass = 'rank-bronze';
      rankIcon = '🥉 #3';
    }

    return `
      <tr onclick="openCardModal('${card.id}')">
        <td>
          <div class="rank-badge-box ${rankBadgeClass}">${rankIcon}</div>
          <span class="rank-species-sub">${card.pokemon_species}</span>
        </td>
        <td>
          <div class="table-card-cell">
            <div class="table-slab-container" style="background:#ffffff; border-color:#cbd5e1; display:flex; align-items:center; justify-content:center;">
              ${card.has_verified_image && card.image && card.image.source_url ? `
                <img 
                  src="${card.image.source_url}" 
                  alt="${card.name}" 
                  class="table-card-thumb" 
                  onerror="this.style.display='none'" 
                />
              ` : `
                <div style="font-size:0.6rem; color:#94a3b8; text-align:center; padding:10px 2px;">Chưa xác minh</div>
              `}
            </div>
            <div>
              <div class="table-card-name">${card.name}</div>
              <div class="table-card-meta">${card.set} &bull; #${card.card_number} (${card.year})</div>
              <div style="margin-top:2px;">${getImageStatusBadgeHtml(card)}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight: 800; color: #dc2626; font-size: 0.8rem;">${card.grade}</span>
          <div style="font-size: 0.7rem; color: var(--text-muted); font-family: monospace;">Cert #${card.psa_cert_number || '48291048'}</div>
        </td>
        <td>
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--accent-snorlax);">Chưa xác minh</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">Mở thẻ để xem tin rao</div>
        </td>
        <td>
          <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary);">$${(card.pricecharting_price || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">PriceCharting Benchmark</div>
        </td>
        <td>
          ${getPriceDealBadgeHtml(card.diff_vs_pricecharting_percent)}
        </td>
        <td>
          ${getSaturationBadgeHtml(card.active_ebay_listings)}
        </td>
        <td>
          ${getTierBadgeHtml(card.infinite_game_tier)}
        </td>
        <td style="text-align: center;">
          <div style="display: flex; gap: 6px; justify-content: center; align-items: center;">
            <a href="${card.ebay_all_sellers_buy_it_now}" target="_blank" rel="noopener noreferrer" class="btn-ebay-mini" onclick="event.stopPropagation();" title="Tìm mua trực tiếp trên eBay (PSA 10)">
              🛍️ eBay
            </a>
            <button class="btn-open-inspect-small" style="padding: 5px 8px; font-size: 0.72rem;" onclick="event.stopPropagation(); openCardModal('${card.id}')" title="Soi phân tích toàn diện">
              🔍 Soi
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderCardsGrid(cards) {
  const container = document.getElementById('cardsContainer');
  
  container.innerHTML = cards.map(card => {
    return `
      <div class="card-item" onclick="openCardModal('${card.id}')">
        <!-- HONEST CARD PRESENTATION (Rules v2.0 - Fail Closed, No Fake Slabs) -->
        <div class="card-presentation-box">
          <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            ${getImageStatusBadgeHtml(card)}
            <span style="font-size: 0.68rem; color: var(--text-muted); font-family: monospace;">#${card.card_number}</span>
          </div>

          ${(card.image?.status === 'APPROVED' && card.image.source_url) ? `
            <div class="card-clean-img-holder">
              <img 
                src="${card.image.source_url}" 
                alt="${card.name}" 
                class="card-clean-img" 
                loading="lazy"
                onerror="handleImgError(this, '${card.name}', '${card.card_number}')" 
              />
            </div>
          ` : `
            <div class="card-unverified-placeholder">
              <span class="placeholder-icon">🎴</span>
              <div class="placeholder-title">Chưa có ảnh được xác minh</div>
              <div class="placeholder-desc">${card.name} &bull; #${card.card_number}</div>
              <div class="placeholder-tag">Fail-Closed &bull; ${card.image ? card.image.reason.split(':')[0] : 'Đang chờ đối chiếu'}</div>
            </div>
          `}
        </div>

        <div class="card-content">
          <div class="card-title-row">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              ${getTierBadgeHtml(card.infinite_game_tier)}
              <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted);">Hạng #${card.rank_overall}</span>
            </div>
            <h3 class="card-title">${card.name}</h3>
            <div class="card-set-meta">${card.set} &bull; #${card.card_number} &bull; ${card.language}</div>
          </div>

          <div class="price-stats-grid">
            <div class="stat-item">
              <span class="stat-label">Giá Shop Uy Tín</span>
              <span class="stat-value buy-price">Chưa xác minh</span>
              <span class="stat-sub" style="color: var(--text-muted);">Mở thẻ để xem tin rao</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">PriceCharting</span>
              <span class="stat-value">$${(card.pricecharting_price || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              <span class="stat-sub">
                ${getPriceDealBadgeHtml(card.diff_vs_pricecharting_percent)}
              </span>
            </div>
          </div>

          <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            ${getSaturationBadgeHtml(card.active_ebay_listings)}
            <span style="font-size: 0.72rem; color: var(--text-muted);">Pop 10: <b>${(card.pop_grade_10 || 0).toLocaleString()}</b></span>
          </div>

          <div class="card-actions-row">
            <a href="${card.ebay_all_sellers_buy_it_now}" target="_blank" rel="noopener noreferrer" class="btn-ebay-direct" onclick="event.stopPropagation();" title="Tìm trực tiếp trên eBay (Lọc sẵn PSA 10 Buy It Now)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Tìm Trên eBay &rarr;
            </a>
            <button class="btn-open-inspect-small" onclick="event.stopPropagation(); openCardModal('${card.id}')" title="Soi phân tích chi tiết">
              🔍 Soi Tab
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ========================================================
// IN-APP INSPECTION TAB / POP-UP MODAL (Không chuyển trang eBay)
// ========================================================
function switchModalTab(tabId, tabButton) {
  activeModalSubTab = tabId;
  document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
  tabButton.classList.add('active');

  document.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
}

function toggleSlabSide(side) {
  const front = document.getElementById('modalSlabFront');
  const back = document.getElementById('modalSlabBack');
  const btnFront = document.getElementById('btnSlabFront');
  const btnBack = document.getElementById('btnSlabBack');

  if (side === 'back') {
    if (front) front.style.display = 'none';
    if (back) back.style.display = 'block';
    if (btnFront) btnFront.classList.remove('active');
    if (btnBack) btnBack.classList.add('active');
  } else {
    if (front) front.style.display = 'block';
    if (back) back.style.display = 'none';
    if (btnFront) btnFront.classList.add('active');
    if (btnBack) btnBack.classList.remove('active');
  }
}

function closeCardModal() {
  const backdrop = document.getElementById('modalBackdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    setTimeout(() => {
      document.getElementById('cardModalContainer').innerHTML = '';
    }, 200);
  }
}

function handleBackdropClick(event) {
  if (event.target.id === 'modalBackdrop') {
    closeCardModal();
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeCardModal();
});

// Trigger daily price scan from server
function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ========================================================
// CARD INSPECTION SUITE (KÍNH LÚP 4X, LƯỚI CENTERING, ĐÈN UV)
// ========================================================
let isLoupeEnabled = true;
let isCenteringEnabled = false;
let isContrastEnabled = false;

function toggleLoupeMode(btn) {
  isLoupeEnabled = !isLoupeEnabled;
  if (btn) btn.classList.toggle('active', isLoupeEnabled);
  const lens = document.getElementById('inspectLoupeLens');
  if (lens && !isLoupeEnabled) lens.style.display = 'none';
  showToast(isLoupeEnabled ? '🔍 Đã bật Kính Lúp 4X (Di chuột lên thẻ để soi)' : 'Đã tắt Kính Lúp');
}

function toggleCenteringGrid(btn) {
  isCenteringEnabled = !isCenteringEnabled;
  if (btn) btn.classList.toggle('active', isCenteringEnabled);
  const grid = document.getElementById('inspectCenteringGrid');
  if (grid) grid.style.display = isCenteringEnabled ? 'block' : 'none';
  showToast(isCenteringEnabled ? '📐 Đã bật Lưới Centering (50/50 CGC Pristine, 55/45 PSA 10)' : 'Đã tắt Lưới Centering');
}

function toggleFlawContrast(btn) {
  isContrastEnabled = !isContrastEnabled;
  if (btn) btn.classList.toggle('active', isContrastEnabled);
  const img = document.getElementById('inspectMainImg');
  if (img) {
    img.style.filter = isContrastEnabled 
      ? 'contrast(190%) brightness(95%) saturate(140%) hue-rotate(15deg)' 
      : 'none';
  }
  showToast(isContrastEnabled ? '💡 Đã bật Đèn Soi Xước Phôi (Tương phản cao)' : 'Đã tắt Đèn Soi Xước');
}

function handleLoupeMove(e, bgUrl) {
  if (!isLoupeEnabled) return;
  const viewport = document.getElementById('inspectViewport');
  const img = document.getElementById('inspectMainImg');
  const lens = document.getElementById('inspectLoupeLens');
  if (!viewport || !img || !lens) return;

  const rect = img.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Only show when inside the image boundary
  if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
    lens.style.display = 'none';
    return;
  }

  lens.style.display = 'block';
  const lensSize = 150;
  const zoom = 3.5;

  lens.style.left = (x - lensSize / 2) + 'px';
  lens.style.top = (y - lensSize / 2) + 'px';
  lens.style.backgroundImage = `url("${bgUrl}")`;
  lens.style.backgroundSize = `${rect.width * zoom}px ${rect.height * zoom}px`;
  lens.style.backgroundPosition = `-${x * zoom - lensSize / 2}px -${y * zoom - lensSize / 2}px`;
}

function handleLoupeLeave() {
  const lens = document.getElementById('inspectLoupeLens');
  if (lens) lens.style.display = 'none';
}

function handleLoupeTouch(e, bgUrl) {
  if (e.touches && e.touches.length > 0) {
    handleLoupeMove(e.touches[0], bgUrl);
  }
}

