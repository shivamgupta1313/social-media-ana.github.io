/**
 * Clearly labeled demonstration data for Authentic Reach.
 * Used when Flask API is unavailable. Never presented as live production data.
 */
const DEMO = (() => {
  const platforms = ['Instagram', 'Facebook', 'YouTube', 'LinkedIn', 'Other'];
  const contentTypes = ['Image', 'Video', 'Reel', 'Story', 'Text', 'Other'];
  const campaigns = ['Summer Launch 2025', 'Brand Awareness Q3', 'Product Demo', 'Holiday Promo'];

  const posts = [
    { id: 1, platform: 'Instagram', post_name: 'Summer Collection Reveal', campaign_name: 'Summer Launch 2025', date: '2025-07-12', content_type: 'Reel', engagement_type: 'Organic', reach: 156920, impressions: 218400, likes: 8420, comments: 612, shares: 1240, clicks: 3200, conversions: 148, ad_spend: 0 },
    { id: 2, platform: 'Instagram', post_name: 'Influencer Collab Story', campaign_name: 'Summer Launch 2025', date: '2025-07-15', content_type: 'Story', engagement_type: 'Paid', reach: 89200, impressions: 145000, likes: 2100, comments: 89, shares: 340, clicks: 8900, conversions: 412, ad_spend: 1250 },
    { id: 3, platform: 'Facebook', post_name: 'Product Feature Carousel', campaign_name: 'Brand Awareness Q3', date: '2025-08-02', content_type: 'Image', engagement_type: 'Organic', reach: 67400, impressions: 98200, likes: 1890, comments: 210, shares: 560, clicks: 1450, conversions: 62, ad_spend: 0 },
    { id: 4, platform: 'YouTube', post_name: 'How-To Tutorial #12', campaign_name: 'Product Demo', date: '2025-08-10', content_type: 'Video', engagement_type: 'Organic', reach: 42100, impressions: 78900, likes: 3200, comments: 890, shares: 410, clicks: 5600, conversions: 210, ad_spend: 0 },
    { id: 5, platform: 'LinkedIn', post_name: 'Thought Leadership Post', campaign_name: 'Brand Awareness Q3', date: '2025-08-18', content_type: 'Text', engagement_type: 'Organic', reach: 18500, impressions: 31200, likes: 780, comments: 145, shares: 220, clicks: 980, conversions: 38, ad_spend: 0 },
    { id: 6, platform: 'Facebook', post_name: 'Retargeting Video Ad', campaign_name: 'Holiday Promo', date: '2025-09-05', content_type: 'Video', engagement_type: 'Paid', reach: 124000, impressions: 210000, likes: 1560, comments: 72, shares: 180, clicks: 14200, conversions: 890, ad_spend: 2800 },
    { id: 7, platform: 'Instagram', post_name: 'UGC Spotlight', campaign_name: 'Summer Launch 2025', date: '2025-07-22', content_type: 'Image', engagement_type: 'Organic', reach: 53400, impressions: 71200, likes: 4120, comments: 380, shares: 890, clicks: 2100, conversions: 95, ad_spend: 0 },
    { id: 8, platform: 'YouTube', post_name: 'Pre-Roll Campaign', campaign_name: 'Holiday Promo', date: '2025-09-12', content_type: 'Video', engagement_type: 'Paid', reach: 98000, impressions: 175000, likes: 890, comments: 45, shares: 60, clicks: 11000, conversions: 520, ad_spend: 1950 },
    { id: 9, platform: 'LinkedIn', post_name: 'Sponsored Article', campaign_name: 'Brand Awareness Q3', date: '2025-08-25', content_type: 'Text', engagement_type: 'Paid', reach: 22000, impressions: 38000, likes: 320, comments: 48, shares: 95, clicks: 2100, conversions: 110, ad_spend: 750 },
    { id: 10, platform: 'Instagram', post_name: 'Flash Sale Story', campaign_name: 'Holiday Promo', date: '2025-09-20', content_type: 'Story', engagement_type: 'Paid', reach: 61000, impressions: 98000, likes: 980, comments: 55, shares: 210, clicks: 7200, conversions: 340, ad_spend: 980 },
  ];

  function engagement(p) {
    return (p.likes || 0) + (p.comments || 0) + (p.shares || 0);
  }

  function summary(filterFn = () => true) {
    const list = posts.filter(filterFn);
    const total = (key) => list.reduce((s, p) => s + (Number(p[key]) || 0), 0);
    const reach = total('reach');
    const eng = list.reduce((s, p) => s + engagement(p), 0);
    const clicks = total('clicks');
    const conversions = total('conversions');
    const adSpend = total('ad_spend');
    return {
      total_reach: reach,
      total_impressions: total('impressions'),
      total_engagement: eng,
      total_clicks: clicks,
      total_conversions: conversions,
      total_ad_spend: adSpend,
      engagement_rate: reach > 0 ? (eng / reach) * 100 : null,
      cost_per_click: clicks > 0 ? adSpend / clicks : null,
      conversion_rate: clicks > 0 ? (conversions / clicks) * 100 : null,
      post_count: list.length,
      is_demo: true,
    };
  }

  function organicVsPaid() {
    const org = posts.filter((p) => p.engagement_type === 'Organic');
    const paid = posts.filter((p) => p.engagement_type === 'Paid');
    const sum = (arr, key) => arr.reduce((s, p) => s + (Number(p[key]) || 0), 0);
    return {
      labels: ['Reach', 'Impressions', 'Engagement', 'Clicks', 'Conversions'],
      organic: [
        sum(org, 'reach'),
        sum(org, 'impressions'),
        org.reduce((s, p) => s + engagement(p), 0),
        sum(org, 'clicks'),
        sum(org, 'conversions'),
      ],
      paid: [
        sum(paid, 'reach'),
        sum(paid, 'impressions'),
        paid.reduce((s, p) => s + engagement(p), 0),
        sum(paid, 'clicks'),
        sum(paid, 'conversions'),
      ],
    };
  }

  function platformDistribution() {
    const map = {};
    posts.forEach((p) => {
      map[p.platform] = (map[p.platform] || 0) + (p.reach || 0);
    });
    return {
      labels: Object.keys(map),
      values: Object.values(map),
    };
  }

  function trends() {
    // Simple monthly aggregation for demo
    const months = ['Jul 2025', 'Aug 2025', 'Sep 2025'];
    const organicEng = [8420 + 612 + 1240 + 4120 + 380 + 890, 1890 + 210 + 560 + 3200 + 890 + 410 + 780 + 145 + 220, 0];
    const paidEng = [2100 + 89 + 340, 320 + 48 + 95, 1560 + 72 + 180 + 890 + 45 + 60 + 980 + 55 + 210];
    return { labels: months, organic: organicEng, paid: paidEng };
  }

  function topPosts(n = 5) {
    return [...posts]
      .map((p) => ({ ...p, engagement: engagement(p), eng_rate: p.reach ? (engagement(p) / p.reach) * 100 : 0 }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, n);
  }

  return {
    posts,
    platforms,
    contentTypes,
    campaigns,
    summary,
    organicVsPaid,
    platformDistribution,
    trends,
    topPosts,
    engagement,
  };
})();
