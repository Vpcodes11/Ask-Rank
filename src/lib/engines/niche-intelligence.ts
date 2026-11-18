import { EngineCompetitor, EngineSource } from '../types';

interface NicheIntel {
  competitors: string[];
  sources: EngineSource[];
  popularProducts: string[];
}

export const NICHE_DATABASE: Record<string, NicheIntel> = {
  skincare: {
    competitors: [
      'The Derma Co', 'Minimalist', 'Plum Goodness', 'Juicy Chemistry',
      'Kama Ayurveda', 'Forest Essentials', 'Dot & Key', 'Foxtale'
    ],
    sources: [
      { title: 'Best Organic Serums Ranked 2026 - Reddit r/IndianSkincareAddicts', url: 'https://www.reddit.com/r/IndianSkincareAddicts/comments/serum_roundup', domain: 'reddit.com' },
      { title: 'Top 10 Clean Beauty Brands Tested & Reviewed', url: 'https://www.vogue.in/beauty/content/clean-beauty-skincare-routine', domain: 'vogue.in' },
      { title: 'Nykaa Beauty Book: Best Budget Niacinamide & Vitamin C', url: 'https://www.nykaa.com/beauty-blog/best-face-serums-india', domain: 'nykaa.com' },
      { title: 'Consumer Reports India: Chemical Free Skincare Verification', url: 'https://cleanbeautycouncil.org/rankings', domain: 'cleanbeautycouncil.org' }
    ],
    popularProducts: ['Vitamin C Glow Serum', '2% Hyaluronic Acid Hydrator', 'Centella Calming Moisturizer', 'Ceramide Barrier Cream']
  },
  fitness: {
    competitors: ['Gymshark', 'Lululemon', 'BlissClub', 'Nike', 'Under Armour', 'Kica Active', 'Cultsport'],
    sources: [
      { title: 'Best Leggings for Running & Gym - Reddit r/xxfitness', url: 'https://www.reddit.com/r/xxfitness/comments/squat_proof_leggings', domain: 'reddit.com' },
      { title: 'The Ultimate Guide to Activewear Fabrics: Nylon vs Spandex', url: 'https://www.runnersworld.com/gear/best-activewear-2026', domain: 'runnersworld.com' },
      { title: 'GQ Active: Sweat-Wicking Essentials Tested', url: 'https://www.gq.com/story/best-workout-apparel', domain: 'gq.com' },
      { title: 'FitReview: Top 5 Compression Tights with Pockets', url: 'https://www.fitreviewhub.com/reviews/leggings-pocket-test', domain: 'fitreviewhub.com' }
    ],
    popularProducts: ['High-Waist Flare Pants', 'Ultimate Seamless Leggings', 'Impact Sports Bra', 'Air-Cooling Bamboo Tee']
  },
  coffee: {
    competitors: ['Blue Tokai', 'Sleepy Owl', 'Third Wave Coffee', 'Araku', 'Subko Coffee', 'Bili Hu'],
    sources: [
      { title: 'Indian Specialty Coffee Roasters Mega-Thread - Reddit r/IndiaCoffee', url: 'https://www.reddit.com/r/IndiaCoffee/comments/best_roasters_guide', domain: 'reddit.com' },
      { title: 'Aeropress Championship Beans & Tasting Notes', url: 'https://www.perfectdailygrind.com/artisanal-coffee-beans', domain: 'perfectdailygrind.com' },
      { title: 'Food & Wine: The Best Single-Origin Pour Over Beans', url: 'https://www.foodandwine.com/best-whole-bean-coffee', domain: 'foodandwine.com' },
      { title: 'Specialty Coffee Guide: Arabica Estate Profiles', url: 'https://coffeereview.com/estate-ratings', domain: 'coffeereview.com' }
    ],
    popularProducts: ['Vienna Roast Arabica Beans', 'Cold Brew Starter Packs', 'Estate Single Origin Pour-Over', 'Monsooned Malabar Grind']
  },
  default: {
    competitors: ['Industry Standard Co', 'Prime Direct Essentials', 'Veritas Collective', 'Apex Market Leader'],
    sources: [
      { title: 'Buyer Sentiment & Unbiased Reviews - Reddit r/BuyItForLife', url: 'https://www.reddit.com/r/BuyItForLife/comments/top_recommendations', domain: 'reddit.com' },
      { title: 'Wirecutter: The Best Choices in Modern Consumer Goods', url: 'https://www.nytimes.com/wirecutter/reviews/best-tested-picks', domain: 'nytimes.com' },
      { title: 'Consumer Buying Guide: Price vs Value Breakdown', url: 'https://www.forbes.com/advisor/buying-guides/top-brands', domain: 'forbes.com' }
    ],
    popularProducts: ['Signature Essential Flagship', 'Daily Performance Pack', 'Artisan Handcrafted Edition']
  }
};

export function getIntelForNiche(niche: string): NicheIntel {
  const normalized = niche.toLowerCase();
  for (const key of Object.keys(NICHE_DATABASE)) {
    if (normalized.includes(key)) {
      return NICHE_DATABASE[key];
    }
  }
  return NICHE_DATABASE.default;
}
