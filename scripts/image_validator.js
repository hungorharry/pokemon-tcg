/**
 * IMAGE VALIDATOR v2.0
 * Conforms to IMAGE_SCRAPING_RULES_v2.md
 */

const { URL } = require('url');

// Strict Hostname Allowlist (No Markdown strings, no substring matching)
const ALLOWED_HOSTNAMES = new Set([
  'storage.googleapis.com',
  'cert-images.psa.com',
  'images.pokemontcg.io'
]);

/**
 * Validates candidate URL string and Hostname
 */
function validateImageUrlFormat(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    return { valid: false, reason: 'ERR_EMPTY_URL' };
  }

  // Reject raw Markdown strings like [https://...](...)
  if (urlString.includes('[') || urlString.includes(']') || urlString.includes('(') && urlString.includes(')')) {
    return { valid: false, reason: 'ERR_MALFORMED_MARKDOWN_URL' };
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(urlString);
  } catch (err) {
    return { valid: false, reason: 'ERR_INVALID_URL_SYNTAX' };
  }

  if (parsedUrl.protocol !== 'https:') {
    return { valid: false, reason: 'ERR_INSECURE_PROTOCOL' };
  }

  if (!ALLOWED_HOSTNAMES.has(parsedUrl.hostname.toLowerCase())) {
    return { valid: false, reason: `ERR_HOSTNAME_NOT_ALLOWED: ${parsedUrl.hostname}` };
  }

  // Specifically for PriceCharting Google Storage CDN
  if (parsedUrl.hostname.toLowerCase() === 'storage.googleapis.com') {
    if (!parsedUrl.pathname.startsWith('/images.pricecharting.com/')) {
      return { valid: false, reason: 'ERR_UNAUTHORIZED_STORAGE_PATH' };
    }
    // Reject explicit 60px thumbnail candidates as primary image
    if (parsedUrl.pathname.endsWith('/60.jpg') || parsedUrl.pathname.endsWith('/120.jpg')) {
      return { valid: false, reason: 'ERR_THUMBNAIL_TOO_SMALL' };
    }
  }

  return { valid: true, parsedUrl };
}

/**
 * Determines Image Status and Review Reason according to v2 Rules
 */
function evaluateImageCandidate(identity, candidateUrl, testResult = null) {
  // If item is OUT_OF_SCOPE, immediately reject from standard TCG
  if (!identity.is_standard_tcg) {
    return {
      status: 'REJECTED',
      reason: `ERR_OUT_OF_SCOPE: ${identity.scope_reason}`,
      image_url: null,
      evidence: []
    };
  }

  // Format validation
  const formatCheck = validateImageUrlFormat(candidateUrl);
  if (!formatCheck.valid) {
    return {
      status: 'REJECTED',
      reason: formatCheck.reason,
      image_url: null,
      evidence: []
    };
  }

  // Special Variants Check: No Symbol, 1st Edition, Master Ball, Errors
  // Per v2 Section 5.2: Artwork alone is NOT enough for variants. Requires specialized verification.
  const isSpecialVariant = 
    identity.edition === '1st Edition' || 
    identity.stamp.includes('Error') || 
    identity.foil === 'Master Ball Holo' ||
    identity.stamp.includes('Staff') ||
    identity.stamp.includes('Prerelease');

  // If live network test data is provided
  if (testResult) {
    if (testResult.statusCode !== 200) {
      return {
        status: 'REJECTED',
        reason: `ERR_HTTP_${testResult.statusCode}`,
        image_url: null,
        evidence: []
      };
    }

    if (testResult.width && testResult.width < 600 || testResult.height && testResult.height < 840) {
      return {
        status: 'REJECTED',
        reason: `ERR_DIMENSIONS_TOO_SMALL (${testResult.width}x${testResult.height} < 600x840)`,
        image_url: null,
        evidence: []
      };
    }
  }

  if (isSpecialVariant) {
    return {
      status: 'REVIEW_REQUIRED',
      reason: `ERR_VARIANT_UNVERIFIED: Biến thể đặc biệt (${identity.edition} / ${identity.stamp}) cần thẩm định đối chứng`,
      image_url: candidateUrl,
      evidence: ['pricecharting_candidate_1600']
    };
  }

  // If candidate is a 1600px scan from verified PriceCharting product page
  if (candidateUrl.includes('/1600.jpg')) {
    return {
      status: 'REFERENCE_ART_ONLY', // High-res reference art
      reason: 'Ảnh phôi thẻ tham khảo độ phân giải cao từ PriceCharting (Chưa phải scan PSA Slab riêng biệt)',
      image_url: candidateUrl,
      evidence: [`product_id:${identity.pricecharting_product_id}`]
    };
  }

  return {
    status: 'REVIEW_REQUIRED',
    reason: 'ERR_CANDIDATE_UNVERIFIED: Cần đối chiếu độc lập',
    image_url: null,
    evidence: []
  };
}

module.exports = {
  ALLOWED_HOSTNAMES,
  validateImageUrlFormat,
  evaluateImageCandidate
};
