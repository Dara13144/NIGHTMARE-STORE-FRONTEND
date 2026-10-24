import { getAssetUrl } from './api';

/**
 * Comprehensive Product Cover Image Resolver
 * Accurately maps all store products to their dedicated high-definition artwork/assets
 */
export const PRODUCT_IMAGE_MAP = {
  // Direct UUIDs from Supabase Database
  '10000000-0000-0000-0000-000000000001': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80', // Cyberpunk
  '10000000-0000-0000-0000-000000000002': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80', // Elden Ring
  '10000000-0000-0000-0000-000000000003': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80', // Black Myth Wukong
  '10000000-0000-0000-0000-000000000004': '/card-minecraft-hd.png', // Minecraft Java & Bedrock
  '10000000-0000-0000-0000-000000000005': 'https://images.unsplash.com/photo-1552824722-ddab1374e622?w=800&auto=format&fit=crop&q=80', // Helldivers 2
  '10000000-0000-0000-0000-000000000006': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80', // PlayStation Card
  '10000000-0000-0000-0000-000000000007': 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&auto=format&fit=crop&q=80', // Xbox Game Pass
  '10000000-0000-0000-0000-000000000008': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80', // EA Sports FC 25
  '10000000-0000-0000-0000-000000000009': '/card-rockstar-hd.png', // FiveM Code
  '10000000-0000-0000-0000-000000000010': '/card-rockstar-account.png', // Rockstar Account
  '10000000-0000-0000-0000-000000000011': '/card-gemini.png', // Gemini Pro
  '10000000-0000-0000-0000-000000000012': '/card-nitro.png', // Discord Nitro
  '10000000-0000-0000-0000-000000000013': '/card-nitro-boosts-hd.png', // Discord Boosts
  '10000000-0000-0000-0000-000000000014': 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80', // Outlook
  '10000000-0000-0000-0000-000000000015': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', // NordVPN
  '10000000-0000-0000-0000-000000000016': '/card-discord.png', // Discord Account
  '10000000-0000-0000-0000-000000000017': 'https://images.unsplash.com/photo-1612287233214-a957d553e1a0?w=800&auto=format&fit=crop&q=80', // Steam
  '10000000-0000-0000-0000-000000000018': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80', // IPVanish
  '10000000-0000-0000-0000-000000000019': '/card-rockstar-hd.png', // Rockstar Tool
  '10000000-0000-0000-0000-000000000020': '/card-minecraft-java.png', // Minecraft Account

  // String Slug / Short IDs
  'prod-1': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
  'prod-2': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
  'prod-3': 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
  'prod-4': '/card-minecraft-hd.png',
  'prod-5': 'https://images.unsplash.com/photo-1552824722-ddab1374e622?w=800&auto=format&fit=crop&q=80',
  'prod-6': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80',
  'prod-7': 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&auto=format&fit=crop&q=80',
  'prod-8': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
  'prod-fivem-code': '/card-rockstar-hd.png',
  'prod-fivem-ready': '/card-rockstar-account.png',
  'prod-gemini-18m': '/card-gemini.png',
  'prod-nitro-3m': '/card-nitro.png',
  'prod-nitro-boosts': '/card-nitro-boosts-hd.png',
  'prod-outlook-mail': 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80',
  'prod-nord-vpn': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
  'prod-discord-group': '/card-discord.png',
  'prod-steam-group': 'https://images.unsplash.com/photo-1612287233214-a957d553e1a0?w=800&auto=format&fit=crop&q=80',
  'prod-ipvanish': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80',
  'prod-rockstar-tool': '/card-rockstar-hd.png',
  'prod-mc-group': '/card-minecraft-java.png',
};

export function getProductCoverImage(prod) {
  if (!prod) return '/card-rockstar-hd.png';

  // 1. If product has an explicit cover_image (uploaded file, custom URL, or base64), prioritize it!
  const customImg = prod.cover_image || prod.coverImage || prod.image;
  if (customImg && typeof customImg === 'string' && customImg.trim() !== '') {
    return getAssetUrl(customImg.trim());
  }

  const id = String(prod.id || prod.productId || '').trim();
  if (PRODUCT_IMAGE_MAP[id]) {
    return PRODUCT_IMAGE_MAP[id];
  }

  const name = String(prod.name || prod.title || prod.productName || '').toLowerCase();
  const platform = String(prod.platform || prod.category || '').toLowerCase();

  // Keyword-based matching
  if (name.includes('gemini')) return '/card-gemini.png';
  if (name.includes('server boost') || name.includes('14x')) return '/card-nitro-boosts-hd.png';
  if (name.includes('nitro')) return '/card-nitro.png';
  if (name.includes('discord')) return '/card-discord.png';
  if (name.includes('rockstar account') || name.includes('fivem account') || (name.includes('rockstar') && name.includes('ready'))) return '/card-rockstar-account.png';
  if (name.includes('ready')) return '/card-rockstar-account.png';
  if (name.includes('fivem') || name.includes('rockstar')) return '/card-rockstar-hd.png';
  if (name.includes('bedrock')) return '/card-minecraft-bedrock.png';
  if (name.includes('minecraft java') || name.includes('full access')) return '/card-minecraft-java.png';
  if (name.includes('minecraft')) return '/card-minecraft-hd.png';
  if (name.includes('nord') || platform.includes('vpn') && name.includes('nord')) {
    return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('ipvanish') || name.includes('ip vanish')) {
    return 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('outlook') || platform.includes('mail')) {
    return 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('steam')) {
    return 'https://images.unsplash.com/photo-1612287233214-a957d553e1a0?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('cyberpunk')) {
    return 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('elden ring')) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('wukong') || name.includes('black myth')) {
    return 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('helldivers')) {
    return 'https://images.unsplash.com/photo-1552824722-ddab1374e622?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('playstation')) {
    return 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('xbox')) {
    return 'https://images.unsplash.com/photo-1605901309584-818e25960a8f?w=800&auto=format&fit=crop&q=80';
  }
  if (name.includes('fc 25') || name.includes('ea sports')) {
    return 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80';
  }

  // Fallback to existing cover image or default
  return prod.cover_image || prod.coverImage || prod.image || '/card-rockstar-hd.png';
}
