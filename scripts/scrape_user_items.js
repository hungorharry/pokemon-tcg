async (page) => {
    const fs = require('fs');
    const path = require('path');
    
    const allUrls = [
        "https://www.ebay.com/itm/267440444703",
        "https://www.ebay.com/itm/206657911171",
        "https://www.ebay.com/itm/860071177848",
        "https://www.ebay.com/itm/398295298692",
        "https://www.ebay.com/itm/840054835587",
        "https://www.ebay.com/itm/336769959715",
        "https://www.ebay.com/itm/117278721760",
        "https://www.ebay.com/itm/820064003237",
        "https://www.ebay.com/itm/880042699214",
        "https://www.ebay.com/itm/227024066286",
        "https://www.ebay.com/itm/198664783075",
        "https://www.ebay.com/itm/358295745360",
        "https://www.ebay.com/itm/386915014818",
        "https://www.ebay.com/itm/168823526499",
        "https://www.ebay.com/itm/206663584836",
        "https://www.ebay.com/itm/377572496015",
        "https://www.ebay.com/itm/860094535877",
        "https://www.ebay.com/itm/168766924761",
        "https://www.ebay.com/itm/206604692753",
        "https://www.ebay.com/itm/820118793330",
        "https://www.ebay.com/itm/407324448308",
        "https://www.ebay.com/itm/407276783573",
        "https://www.ebay.com/itm/227358863411",
        "https://www.ebay.com/itm/227395154274",
        "https://www.ebay.com/itm/377602498425",
        "https://www.ebay.com/itm/900001053999",
        "https://www.ebay.com/itm/900024353032",
        "https://www.ebay.com/itm/358386463459",
        "https://www.ebay.com/itm/800782322654",
        "https://www.ebay.com/itm/168825612109",
        "https://www.ebay.com/itm/900034438543",
        "https://www.ebay.com/itm/307256228698",
        "https://www.ebay.com/itm/117473813310"
    ];

    // Read existing results if present
    const outputPath = 'C:/Users/hungtn/Downloads/Nghiên cứu chơi/scripts/user_items_scraped.json';
    let existing = [];
    if (fs.existsSync(outputPath)) {
        try {
            existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
        } catch (e) {}
    }
    const scrapedUrls = new Set(existing.map(x => x.url));
    const toScrape = allUrls.filter(u => !scrapedUrls.has(u)).slice(0, 11);
    
    console.log(`Remaining to scrape: ${allUrls.length - existing.length}. Scraping next batch of ${toScrape.length}...`);

    for (let i = 0; i < toScrape.length; i++) {
        const u = toScrape[i];
        try {
            await page.goto(u, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await page.waitForTimeout(600);
            
            const data = await page.evaluate((url) => {
                const title = document.querySelector('h1.x-item-title__mainTitle')?.innerText || document.title;
                const price = document.querySelector('.x-price-primary .ux-textspans')?.innerText || '';
                const approxPrice = document.querySelector('.x-price-approx .ux-textspans')?.innerText || '';
                const bidCount = document.querySelector('.x-bid-count')?.innerText || '';
                const isEnded = document.querySelector('.x-item-ended, .d-item-ended, [data-testid="ux-call-to-action__ended"]') ? true : false;
                
                const sellerName = document.querySelector('.x-sellercard-atf__info__about-seller a span, .ux-seller-section__item--seller a')?.innerText || '';
                const sellerFeedback = document.querySelector('.x-sellercard-atf__data-item, .ux-seller-section__item--feedback')?.innerText || '';
                const sellerSectionText = document.querySelector('.x-sellercard-atf, .ux-seller-section')?.innerText || '';
                
                const imgEls = Array.from(document.querySelectorAll('.ux-image-carousel-item img, .ux-image-filmstrip-carousel img, .x-photos-min-view img, .ux-image-magnify__image--original, img[src*="i.ebayimg.com"]'));
                const imgs = [];
                for (const img of imgEls) {
                    const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-zoom-src');
                    if (src && src.includes('i.ebayimg.com') && !src.includes('s-l64') && !src.includes('s-l140')) {
                        const highRes = src.replace(/s-l\d+\./, 's-l1600.');
                        if (!imgs.includes(highRes)) imgs.push(highRes);
                    }
                }
                
                const placeBidBtn = document.querySelector('#bidBtn_btn, [data-testid="ux-bid-call-to-action"]');
                const isAuction = Boolean(placeBidBtn) || Boolean(bidCount);
                const buyItNowBtn = document.querySelector('#binBtn_btn, [data-testid="ux-call-to-action"]');
                const isBin = Boolean(buyItNowBtn) || !isAuction;

                return {
                    url,
                    title,
                    price,
                    approxPrice,
                    isAuction,
                    isBin,
                    bidCount,
                    isEnded,
                    sellerName,
                    sellerFeedback,
                    sellerSectionText,
                    imgs
                };
            }, u);
            
            existing.push(data);
        } catch (err) {
            existing.push({ url: u, error: err.message });
        }
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(existing, null, 2), 'utf-8');
    return {
        totalTarget: allUrls.length,
        scrapedCount: existing.length,
        lastBatchSize: toScrape.length,
        hasMore: existing.length < allUrls.length
    };
}
