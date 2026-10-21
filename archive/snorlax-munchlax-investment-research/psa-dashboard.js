(() => {
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pop = c => c.psa_research?.population;
  const price = c => c.psa_research?.prices.find(p => p.grade === '10');
  const n = v => Number.isFinite(v) ? v.toLocaleString('vi-VN') : '—';
  const percent = v => Number.isFinite(v) ? v.toLocaleString('vi-VN',{maximumFractionDigits:2})+'%' : '—';
  const amount = c => price(c) ? new Intl.NumberFormat('en-US',{style:'currency',currency:price(c).currency}).format(price(c).market) : 'Chưa có giá';
  const thumb = c => c.psa_research?.image || 'listing-placeholder.svg';
  window.updateKPIs = cards => {
    const values = [cards.length,cards.filter(c=>pop(c)).length,cards.filter(c=>price(c)).length,cards.filter(c=>pop(c)?.total>0&&pop(c).gemRate<5).length,cards.filter(c=>!pop(c)).length];
    ['kpiTotal','kpiDeals','kpiScarce','kpiFlooded','kpiInfiniteReady'].forEach((id,i)=>document.getElementById(id).textContent=values[i]);
  };
  window.renderFeaturedPicks = () => {
    let cards=allCards.filter(c=>c.psa_research);
    if(currentCategoryTab==='infinite-grails') cards=cards.filter(c=>pop(c)).sort((a,b)=>pop(a).gemRate-pop(b).gemRate);
    if(currentCategoryTab==='best-deals') cards=cards.filter(c=>price(c)).sort((a,b)=>price(b).market-price(a).market);
    if(currentCategoryTab==='scarce-supply') cards=cards.filter(c=>pop(c)).sort((a,b)=>pop(a).psa10-pop(b).psa10);
    if(currentCategoryTab==='related-char') cards=cards.filter(c=>c.pokemon_species==='Munchlax');
    if(currentCategoryTab==='flooded-avoid') cards=cards.filter(c=>pop(c)).sort((a,b)=>pop(b).total-pop(a).total);
    document.getElementById('featuredPicksContainer').innerHTML=cards.slice(0,5).map(c=>`<button class="mini-card pr-mini-button" onclick="openCardModal('${e(c.id)}')"><img class="mini-card-img" src="${e(thumb(c))}" alt="" loading="lazy"><span class="mini-card-info"><span class="mini-card-title">${e(c.name)}</span><span class="mini-card-set">PSA 10: ${n(pop(c)?.psa10)} · ${percent(pop(c)?.gemRate)}</span></span><span class="mini-card-price">${e(amount(c))}</span></button>`).join('') || '<p class="mi-footnote">Chưa có dữ liệu nguồn cho nhóm này.</p>';
  };
  window.renderLeaderboard = cards => {
    document.getElementById('resultsCount').textContent=`Hiển thị ${cards.length} / ${allCards.length} hồ sơ · Ảnh artwork tham khảo`;
    document.getElementById('leaderboardTbody').innerHTML=cards.length?cards.map((c,i)=>`<tr onclick="openCardModal('${e(c.id)}')" tabindex="0" onkeydown="if(event.key==='Enter'){openCardModal('${e(c.id)}')}"><td>${i+1}</td><td><div class="table-card-info"><img class="table-card-thumb" src="${e(thumb(c))}" alt="" loading="lazy"><div><div class="table-card-name">${e(c.name)}</div><div class="table-card-meta">${e(c.set)} · ${e(c.language.toUpperCase())}</div></div></div></td><td>PSA 10<small class="pr-cell-note">Điểm tham khảo</small></td><td><strong>${e(amount(c))}</strong><small class="pr-cell-note">${price(c)?'Scrydex · giá tham khảo':'Chưa có nguồn'}</small></td><td>${n(pop(c)?.total)}</td><td>${n(pop(c)?.psa10)}</td><td>${percent(pop(c)?.gemRate)}</td><td>${percent(pop(c)?.highGradeRate)}</td><td><button class="btn-open-inspect-small" onclick="event.stopPropagation();openCardModal('${e(c.id)}')">Chi tiết ↗</button></td></tr>`).join(''):'<tr><td colspan="9">Không có hồ sơ khớp bộ lọc.</td></tr>';
  };
  window.renderCardsGrid = cards => {
    document.getElementById('cardsContainer').innerHTML=cards.map(c=>`<button class="card-item pr-grid-button" onclick="openCardModal('${e(c.id)}')"><div class="card-presentation-box"><img class="card-clean-img" src="${e(thumb(c))}" alt="${e(c.name)}" loading="lazy"><small>Artwork tham khảo</small></div><div class="card-content"><h3 class="card-title">${e(c.name)}</h3><p class="card-set-meta">${e(c.set)}</p><div class="pr-card-price">${e(amount(c))}<small>Giá tham khảo PSA 10 · Scrydex</small></div><dl class="mi-seller"><div><dt>Population</dt><dd>${n(pop(c)?.total)}</dd></div><div><dt>PSA 10</dt><dd>${n(pop(c)?.psa10)} · ${percent(pop(c)?.gemRate)}</dd></div></dl><span class="pr-source-link">Xem phân bố từng điểm ↗</span></div></button>`).join('');
  };
  window.applyFiltersAndSort = () => {
    const species=document.querySelector('.apple-segment-btn.active')?.dataset.filter||'standard';
    const q=document.getElementById('searchInput').value.trim().toLowerCase();
    const source=document.getElementById('priceDealFilter').value, scarcity=document.getElementById('saturationFilter').value, coverage=document.getElementById('infiniteFilter').value;
    let result=allCards.filter(c=>{
      if(species==='standard'&&!c.is_standard_tcg)return false;
      if(['Snorlax','Munchlax'].includes(species)&&(c.pokemon_species!==species||!c.is_standard_tcg))return false;
      if(species==='out-of-scope'&&c.is_standard_tcg)return false;
      if(q&&!`${c.name} ${c.set} ${c.card_number}`.toLowerCase().includes(q))return false;
      if(source==='deals'&&!price(c))return false;
      if(source==='fair'&&!pop(c))return false;
      if(source==='overpriced'&&(price(c)||pop(c)))return false;
      if(scarcity!=='all'){
        const r=pop(c)?.gemRate;if(!Number.isFinite(r)||!pop(c).total)return false;
        if(scarcity==='scarce'&&r>=1)return false;
        if(scarcity==='moderate'&&(r<1||r>=5))return false;
        if(scarcity==='high'&&(r<5||r>=20))return false;
        if(scarcity==='flooded'&&r<20)return false;
      }
      if(coverage==='ready'&&(!price(c)||!pop(c)))return false;
      if(coverage==='tier-s'&&!c.psa_research?.identityNotes?.length)return false;
      if(coverage==='fail'&&c.psa_research)return false;
      return true;
    });
    const sort=document.getElementById('sortSelect').value;
    const numeric=(c,field)=>field==='price'?price(c)?.market:field==='gem'?pop(c)?.gemRate:pop(c)?.total;
    const compare=(a,b,field,descending=false)=>{const x=numeric(a,field),y=numeric(b,field);if(x==null)return y==null?0:1;if(y==null)return -1;return descending?y-x:x-y;};
    result.sort((a,b)=>sort==='price-asc'?compare(a,b,'price'):sort==='price-desc'?compare(a,b,'price',true):sort==='discount-desc'||sort==='ebay-scarce'?compare(a,b,'gem'):sort==='ebay-flooded'?compare(a,b,'total',true):a.rank_overall-b.rank_overall);
    renderLeaderboard(result);renderCardsGrid(result);
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const labels=[['Hồ sơ trong danh mục','Bao gồm cả mục chưa tìm được nguồn'],['Có population PSA','Số lượng phân theo điểm từ nguồn công khai'],['Có giá tham khảo PSA 10','Giá Scrydex; không phải PSA Price Guide'],['Tỷ lệ PSA 10 dưới 5%','Độ hiếm trong population của từng phiên bản'],['Chưa có population','Không dùng số liệu giả lập thay thế']];
    document.querySelectorAll('.kpi-card').forEach((el,i)=>{el.querySelector('.kpi-label').textContent=labels[i][0];el.querySelector('.kpi-sub').textContent=labels[i][1];});
    const titles=['Tỷ lệ PSA 10 thấp','Giá tham khảo cao','Ít bản PSA 10','Munchlax','Population lớn'];document.querySelectorAll('.cat-tab-btn').forEach((el,i)=>el.textContent=titles[i]);
    document.querySelector('.featured-header h2').textContent='Từ dữ liệu nguồn công khai';
    const headers=['STT','Thẻ & bộ','Điểm','Giá tham khảo','Population tổng','PSA 10','Tỷ lệ PSA 10','Tỷ lệ điểm ≥9','Chi tiết'];document.querySelectorAll('.leaderboard-table thead th').forEach((el,i)=>el.textContent=headers[i]);
    const controls=[['priceDealFilter','Dữ liệu:',['Tất cả','Có giá PSA 10','Có population','Chưa có giá / population']],['saturationFilter','Tỷ lệ PSA 10:',['Tất cả','Dưới 1%','1% đến dưới 5%','5% đến dưới 20%','Từ 20%']],['infiniteFilter','Đối chiếu:',['Tất cả','Có giá và population','Khác finish trong hồ sơ cũ','Chưa ghép nguồn']]];
    for(const[id,label,options]of controls){const select=document.getElementById(id);select.parentElement.querySelector('.apple-chip-label').textContent=label;[...select.options].forEach((opt,i)=>opt.textContent=options[i]);}
    const sorts=['Thứ tự danh mục','Tỷ lệ PSA 10 thấp','Tỷ lệ PSA 10 thấp','Population lớn','Giá thấp → cao','Giá cao → thấp'];
    const names={'rank-asc':'Thứ tự danh mục','discount-desc':'Tỷ lệ PSA 10 thấp','ebay-scarce':'Tỷ lệ PSA 10 thấp','ebay-flooded':'Population lớn','price-asc':'Giá thấp → cao','price-desc':'Giá cao → thấp'};[...document.getElementById('sortSelect').options].forEach(o=>{if(names[o.value])o.textContent=names[o.value];});
    document.querySelector('#btnViewLeaderboard').lastChild.textContent=' Bảng nghiên cứu PSA';
    const version=document.querySelector('.badge-version');if(version)version.textContent='PSA graded · Nguồn công khai miễn phí';
  });
})();
