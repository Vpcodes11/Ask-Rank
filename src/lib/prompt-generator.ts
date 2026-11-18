import { BuyerPrompt } from './types';

export function generateBuyerPrompts(brand: string, niche: string, currency: string = 'INR'): BuyerPrompt[] {
  const isIndia = currency === 'INR' || niche.toLowerCase().includes('india');
  const currencySymbol = isIndia ? '₹' : '$';
  const geo = isIndia ? 'in India' : 'in the US/Global';
  const n = niche.toLowerCase();

  let templates: Array<{
    category: BuyerPrompt['category'];
    intent: string;
    volume: BuyerPrompt['volume_estimate'];
    queryBuilder: () => string;
  }> = [];

  if (n.includes('skin') || n.includes('beauty')) {
    templates = [
      {
        category: 'budget',
        intent: 'Price-conscious shopper looking for proven efficacy',
        volume: 'High',
        queryBuilder: () => `best organic face serum under ${currencySymbol}${isIndia ? '1000' : '30'} ${geo}`
      },
      {
        category: 'intent_buy',
        intent: 'Active consumer seeking top 3 verified clean skincare brands',
        volume: 'High',
        queryBuilder: () => `top 3 clean beauty brands for glowing skin ${geo} with honest reviews`
      },
      {
        category: 'ingredient_spec',
        intent: 'Buyer seeking barrier repair with ceramides and zero fragrance',
        volume: 'High',
        queryBuilder: () => `best fragrance-free ceramide moisturizer for damaged skin barrier`
      },
      {
        category: 'comparison',
        intent: 'Shopper comparing flagship brand against incumbent competitors',
        volume: 'Medium',
        queryBuilder: () => `is ${brand} better than Minimalist or Plum for dark spots and acne marks?`
      },
      {
        category: 'intent_buy',
        intent: 'Consumer searching for daily morning routine picks',
        volume: 'High',
        queryBuilder: () => `best gentle hydrating cleanser for sensitive acne-prone skin ${geo}`
      },
      {
        category: 'gift_occasion',
        intent: 'Holiday/birthday shopper seeking self-care skincare kit',
        volume: 'Medium',
        queryBuilder: () => `best organic skincare starter gift kit under ${currencySymbol}${isIndia ? '1500' : '50'} ${geo}`
      },
      {
        category: 'comparison',
        intent: 'Reddit consensus query on brand credibility',
        volume: 'Trending',
        queryBuilder: () => `honest Reddit reviews on ${brand} skincare: is it worth buying?`
      },
      {
        category: 'ingredient_spec',
        intent: 'Shopper looking for non-comedogenic sunscreen or morning protection',
        volume: 'High',
        queryBuilder: () => `top rated non-sticky lightweight daily sunscreen with zero white cast`
      },
      {
        category: 'budget',
        intent: 'Affordable high-potency vitamin C serum inquiry',
        volume: 'Medium',
        queryBuilder: () => `best 10% or 15% vitamin C face serum for pigmentation under ${currencySymbol}${isIndia ? '800' : '25'}`
      },
      {
        category: 'intent_buy',
        intent: 'Shopper asking dermatologist-favored independent brands',
        volume: 'High',
        queryBuilder: () => `which Indian D2C skincare brands are certified clean and dermatologically tested?`
      }
    ];
  } else if (n.includes('fit') || n.includes('active') || n.includes('apparel')) {
    templates = [
      {
        category: 'budget',
        intent: 'Gym-goer seeking affordable squat-proof tights',
        volume: 'High',
        queryBuilder: () => `best squat proof high-waisted workout leggings under ${currencySymbol}${isIndia ? '2000' : '60'} ${geo}`
      },
      {
        category: 'intent_buy',
        intent: 'High-impact runner looking for bounce-free sports bras',
        volume: 'High',
        queryBuilder: () => `most supportive sports bra for running and high impact workouts`
      },
      {
        category: 'ingredient_spec',
        intent: 'Consumer looking for breathable anti-chafing activewear materials',
        volume: 'Medium',
        queryBuilder: () => `best moisture-wicking seamless activewear for humid hot weather`
      },
      {
        category: 'comparison',
        intent: 'Direct comparison against market leaders like Lululemon or BlissClub',
        volume: 'High',
        queryBuilder: () => `is ${brand} activewear comparable to Gymshark or BlissClub in fabric quality?`
      },
      {
        category: 'intent_buy',
        intent: 'Yoga and pilates practitioner seeking buttery soft flare pants',
        volume: 'High',
        queryBuilder: () => `top comfortable workout flare pants with deep pockets ${geo}`
      },
      {
        category: 'gift_occasion',
        intent: 'Fitness gift pack inquiry',
        volume: 'Medium',
        queryBuilder: () => `best activewear gift set for women under ${currencySymbol}${isIndia ? '2500' : '80'}`
      },
      {
        category: 'comparison',
        intent: 'Community forum sentiment on durability after multiple washes',
        volume: 'Trending',
        queryBuilder: () => `does ${brand} leggings roll down or pill after washing? Reddit review summary`
      },
      {
        category: 'budget',
        intent: 'Budget workout t-shirt and tank recommendations',
        volume: 'Medium',
        queryBuilder: () => `best lightweight gym t-shirts and tanks under ${currencySymbol}${isIndia ? '1000' : '35'} ${geo}`
      },
      {
        category: 'ingredient_spec',
        intent: 'Eco-conscious consumer looking for recycled or bamboo activewear',
        volume: 'Medium',
        queryBuilder: () => `best sustainable and organic bamboo workout clothes brands`
      },
      {
        category: 'intent_buy',
        intent: 'Overall best D2C activewear brands ranking',
        volume: 'High',
        queryBuilder: () => `top 5 D2C athleisure brands in India for comfort and daily wear`
      }
    ];
  } else {
    // Generic high-intent e-commerce buyer queries
    templates = [
      {
        category: 'budget',
        intent: 'Price vs quality shopping query',
        volume: 'High',
        queryBuilder: () => `best high quality ${niche} products under ${currencySymbol}${isIndia ? '1500' : '50'} ${geo}`
      },
      {
        category: 'intent_buy',
        intent: 'Top 3 authoritative recommendations',
        volume: 'High',
        queryBuilder: () => `top 3 recommended brands for ${niche} with verified reviews`
      },
      {
        category: 'ingredient_spec',
        intent: 'Materials, durability and specifications check',
        volume: 'Medium',
        queryBuilder: () => `what is the most durable material and build to look for when buying ${niche}?`
      },
      {
        category: 'comparison',
        intent: 'Brand reputation check compared to market giants',
        volume: 'Medium',
        queryBuilder: () => `how does ${brand} compare to mainstream alternatives in ${niche}?`
      },
      {
        category: 'intent_buy',
        intent: 'Best overall pick for beginners',
        volume: 'High',
        queryBuilder: () => `best beginner-friendly ${niche} essentials bundle ${geo}`
      },
      {
        category: 'gift_occasion',
        intent: 'Gift recommendation search',
        volume: 'Medium',
        queryBuilder: () => `best luxury yet affordable ${niche} gift ideas under ${currencySymbol}${isIndia ? '2000' : '65'}`
      },
      {
        category: 'comparison',
        intent: 'Reddit discussion search',
        volume: 'Trending',
        queryBuilder: () => `what does Reddit say about ${brand}? Honest opinions and user reviews`
      },
      {
        category: 'budget',
        intent: 'Value for money verdict',
        volume: 'Medium',
        queryBuilder: () => `cheapest reliable ${niche} options that do not compromise on quality`
      },
      {
        category: 'ingredient_spec',
        intent: 'Safety, certification, and warranty standards',
        volume: 'Medium',
        queryBuilder: () => `which ${niche} brands offer the best warranty and return policy?`
      },
      {
        category: 'intent_buy',
        intent: 'Overall editorial ranking',
        volume: 'High',
        queryBuilder: () => `top 5 innovative independent brands in ${niche} to watch this year`
      }
    ];
  }

  return templates.map((t, idx) => ({
    id: `prompt-${idx + 1}`,
    query: t.queryBuilder(),
    category: t.category,
    intent: t.intent,
    volume_estimate: t.volume
  }));
}
