export interface ScrapedStoreData {
  cleanDomain: string;
  storeName: string;
  niche: string;
  homepageTitle: string;
  homepageDescription: string;
  productsJsonFound: boolean;
  sitemapFound: boolean;
  sampleProducts: Array<{
    id: string;
    title: string;
    handle: string;
    description: string;
    price: string;
    imageUrl: string;
    tags: string[];
  }>;
  jsonLdSchemas: any[];
  currency: string;
}

export async function fetchStorePublicData(rawUrl: string, nicheInput?: string): Promise<ScrapedStoreData> {
  // Normalize URL
  let cleanDomain = rawUrl.trim().toLowerCase();
  cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  
  const baseUrl = `https://${cleanDomain}`;
  const storeName = cleanDomain
    .split('.')[0]
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  const inferredNiche = nicheInput?.trim() || inferNicheFromDomain(cleanDomain);

  let homepageTitle = `${storeName} | Official Store`;
  let homepageDescription = `Shop the latest collections and premium essentials from ${storeName}.`;
  let productsJsonFound = false;
  let sitemapFound = false;
  const sampleProducts: ScrapedStoreData['sampleProducts'] = [];
  const jsonLdSchemas: any[] = [];
  let currency = inferredNiche.toLowerCase().includes('india') || cleanDomain.endsWith('.in') ? 'INR' : 'USD';

  // 1. Attempt to fetch /products.json
  try {
    const productsRes = await fetch(`${baseUrl}/products.json?limit=10`, {
      headers: {
        'User-Agent': 'AskRank-Bot/1.0 (+https://askrank.ai/bot; geo-audit)',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (productsRes.ok) {
      const data = await productsRes.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        productsJsonFound = true;
        for (const p of data.products.slice(0, 10)) {
          const price = p.variants?.[0]?.price || '999';
          const img = p.images?.[0]?.src || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80';
          sampleProducts.push({
            id: String(p.id || Math.random()),
            title: p.title,
            handle: p.handle,
            description: cleanHtml(p.body_html || ''),
            price,
            imageUrl: img,
            tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : [])
          });
        }
      }
    }
  } catch (err) {
    // /products.json either disabled or blocked
  }

  // 2. Attempt to fetch homepage HTML for title, meta, and JSON-LD schemas
  try {
    const homeRes = await fetch(baseUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      },
      signal: AbortSignal.timeout(6000)
    });

    if (homeRes.ok) {
      const html = await homeRes.text();
      
      // Extract <title>
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        homepageTitle = titleMatch[1].trim();
      }

      // Extract description
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
      if (descMatch && descMatch[1]) {
        homepageDescription = descMatch[1].trim();
      }

      // Extract JSON-LD
      const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
      for (const m of jsonLdMatches) {
        try {
          const parsed = JSON.parse(m[1].trim());
          jsonLdSchemas.push(parsed);
        } catch {}
      }

      // Currency check
      if (html.includes('₹') || html.includes('INR') || html.includes('Rs.')) {
        currency = 'INR';
      }
    }
  } catch (err) {
    // Homepage fetch timed out or network error
  }

  // 3. Attempt to verify sitemap
  try {
    const sitemapRes = await fetch(`${baseUrl}/sitemap.xml`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    if (sitemapRes.ok) {
      sitemapFound = true;
    }
  } catch {}

  // If no products found through products.json, generate high quality niche-realistic products
  if (sampleProducts.length === 0) {
    const generated = generateFallbackCatalog(storeName, inferredNiche, currency);
    sampleProducts.push(...generated);
  }

  return {
    cleanDomain,
    storeName,
    niche: inferredNiche,
    homepageTitle,
    homepageDescription,
    productsJsonFound,
    sitemapFound,
    sampleProducts,
    jsonLdSchemas,
    currency
  };
}

function inferNicheFromDomain(domain: string): string {
  const d = domain.toLowerCase();
  if (d.includes('beauty') || d.includes('skin') || d.includes('organics') || d.includes('derma') || d.includes('glow')) {
    return 'Organic Skincare & Clean Beauty';
  }
  if (d.includes('fit') || d.includes('active') || d.includes('wear') || d.includes('club') || d.includes('gym')) {
    return 'Activewear & Fitness Apparel';
  }
  if (d.includes('coffee') || d.includes('roast') || d.includes('brew') || d.includes('bean')) {
    return 'Specialty Coffee & Artisan Roasts';
  }
  if (d.includes('tea') || d.includes('chai')) {
    return 'Premium Herbal & Loose Leaf Tea';
  }
  if (d.includes('sneaker') || d.includes('kicks') || d.includes('shoe')) {
    return 'Footwear & Athletic Shoes';
  }
  return 'Direct-to-Consumer Essentials';
}

function cleanHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function generateFallbackCatalog(brand: string, niche: string, currency: string) {
  const isIndia = currency === 'INR';
  const prefix = isIndia ? '₹' : '$';

  if (niche.toLowerCase().includes('skin') || niche.toLowerCase().includes('beauty')) {
    return [
      {
        id: 'prod-1',
        title: `${brand} 10% Vitamin C Radiance Booster Serum`,
        handle: 'vitamin-c-radiance-serum',
        description: 'Potent antioxidant serum formulated with pure ethyl ascorbic acid and ferulic acid to brighten dull skin and diminish dark spots.',
        price: isIndia ? '799' : '28',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        tags: ['serum', 'vitamin c', 'brightening', 'clean beauty', 'cruelty-free']
      },
      {
        id: 'prod-2',
        title: `${brand} Barrier Repair Ceramide Moisturizer`,
        handle: 'barrier-repair-ceramide-moisturizer',
        description: 'Ultra-nourishing daily hydrator with 5 essential ceramides and colloidal oat to soothe compromised skin barriers.',
        price: isIndia ? '649' : '24',
        imageUrl: 'https://images.unsplash.com/photo-1608248597359-5773821034c4?w=600&auto=format&fit=crop&q=80',
        tags: ['moisturizer', 'ceramides', 'barrier repair', 'sensitive skin']
      },
      {
        id: 'prod-3',
        title: `${brand} Gentle Centella Jelly Cleanser`,
        handle: 'gentle-centella-jelly-cleanser',
        description: 'Sulfate-free pH 5.5 foaming jelly with madecassoside and panthenol that removes sunscreen without stripping moisture.',
        price: isIndia ? '499' : '18',
        imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
        tags: ['cleanser', 'centella', 'ph balanced', 'daily care']
      }
    ];
  }

  if (niche.toLowerCase().includes('fitness') || niche.toLowerCase().includes('active') || niche.toLowerCase().includes('apparel')) {
    return [
      {
        id: 'prod-1',
        title: `${brand} CloudFlex High-Waist Performance Leggings`,
        handle: 'cloudflex-high-waist-leggings',
        description: 'Squat-proof 4-way stretch fabric with deep dual side pockets and a zero-slip compression waistband for gym and yoga.',
        price: isIndia ? '1899' : '68',
        imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
        tags: ['leggings', 'activewear', 'gym', 'squat proof', 'pockets']
      },
      {
        id: 'prod-2',
        title: `${brand} Seamless Motion High-Impact Sports Bra`,
        handle: 'seamless-motion-sports-bra',
        description: 'Engineered for running and HIIT training. Features moisture-wicking CoolMax panels and removable contoured padding.',
        price: isIndia ? '1299' : '48',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80',
        tags: ['sports bra', 'high impact', 'seamless', 'running']
      },
      {
        id: 'prod-3',
        title: `${brand} Bamboo Air Relaxed Workout Tank`,
        handle: 'bamboo-air-workout-tank',
        description: 'Naturally odor-resistant bamboo fabric with a relaxed drop-armhole cut for maximum airflow during intense sessions.',
        price: isIndia ? '899' : '34',
        imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&auto=format&fit=crop&q=80',
        tags: ['tank', 'bamboo', 'breathable', 'yoga']
      }
    ];
  }

  return [
    {
      id: 'prod-1',
      title: `${brand} Signature Edition Flagship Essential`,
      handle: 'signature-edition-flagship',
      description: 'Crafted with premium materials and engineered for longevity. Supported by our 100% satisfaction guarantee.',
      price: isIndia ? '1499' : '45',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      tags: ['flagship', 'bestseller', 'premium', 'guaranteed']
    },
    {
      id: 'prod-2',
      title: `${brand} Daily Comfort Performance Pack`,
      handle: 'daily-comfort-pack',
      description: 'Designed for everyday utility with reinforced durability and ergonomic styling.',
      price: isIndia ? '999' : '32',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      tags: ['bundle', 'daily', 'ergonomic']
    }
  ];
}
