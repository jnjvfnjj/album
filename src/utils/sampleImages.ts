/**
 * Resilient, zero-broken-image photography generator.
 * Produces crisp, beautiful, domain-authentic event photography data URLs
 * with dark sleek aesthetic, ambient spotlights, conference stages, and keynote vibes.
 */

function createSvgDataUrl(title: string, subtitle: string, category: string, color1: string, color2: string, pattern: 'stage' | 'retreat' | 'hackathon' | 'gala' | 'camera'): string {
  let graphic = '';

  if (pattern === 'stage') {
    graphic = `
      <!-- Stage Spotlights & Modern Conference Hall -->
      <defs>
        <linearGradient id="beam1" x1="0%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="beam2" x1="100%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#818cf8" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <polygon points="200,0 600,600 0,600" fill="url(#beam1)" />
      <polygon points="600,0 800,600 200,600" fill="url(#beam2)" />
      <rect x="0" y="480" width="800" height="120" fill="#09090b" />
      <rect x="240" y="430" width="320" height="10" rx="3" fill="#38bdf8" opacity="0.8" />
      <circle cx="400" cy="410" r="14" fill="#ffffff" opacity="0.9" />
      <path d="M386 440 L414 440 L410 480 L390 480 Z" fill="#ffffff" opacity="0.6" />
      <!-- Audience Silhouettes -->
      <circle cx="100" cy="540" r="16" fill="#18181b" />
      <circle cx="160" cy="530" r="18" fill="#18181b" />
      <circle cx="230" cy="545" r="17" fill="#18181b" />
      <circle cx="580" cy="535" r="19" fill="#18181b" />
      <circle cx="660" cy="540" r="17" fill="#18181b" />
      <circle cx="730" cy="530" r="16" fill="#18181b" />
    `;
  } else if (pattern === 'retreat') {
    graphic = `
      <!-- Mountain & Architectural Venue -->
      <polygon points="0,500 220,240 450,500" fill="#18181b" opacity="0.9" />
      <polygon points="280,500 520,180 750,500" fill="#27272a" opacity="0.8" />
      <polygon points="500,500 680,280 800,500" fill="#18181b" opacity="0.95" />
      <circle cx="650" cy="140" r="40" fill="#e4e4e7" opacity="0.15" />
      <rect x="180" y="440" width="440" height="120" rx="6" fill="#111827" stroke="#374151" stroke-width="2" />
      <!-- Venue glowing glass windows -->
      <rect x="210" y="460" width="60" height="50" rx="3" fill="#fbbf24" opacity="0.75" />
      <rect x="290" y="460" width="60" height="50" rx="3" fill="#fbbf24" opacity="0.65" />
      <rect x="370" y="460" width="60" height="50" rx="3" fill="#f59e0b" opacity="0.7" />
      <rect x="450" y="460" width="60" height="50" rx="3" fill="#fbbf24" opacity="0.8" />
      <rect x="530" y="460" width="60" height="50" rx="3" fill="#f59e0b" opacity="0.6" />
    `;
  } else if (pattern === 'hackathon') {
    graphic = `
      <!-- Code Monitors & Hackathon Workspace -->
      <rect x="80" y="260" width="180" height="120" rx="6" fill="#18181b" stroke="#3b82f6" stroke-width="2" />
      <line x1="100" y1="290" x2="220" y2="290" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" />
      <line x1="100" y1="310" x2="190" y2="310" stroke="#93c5fd" stroke-width="3" stroke-linecap="round" />
      <line x1="100" y1="330" x2="240" y2="330" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
      
      <rect x="310" y="220" width="220" height="150" rx="6" fill="#18181b" stroke="#10b981" stroke-width="2" />
      <line x1="330" y1="250" x2="480" y2="250" stroke="#34d399" stroke-width="3" stroke-linecap="round" />
      <line x1="330" y1="270" x2="440" y2="270" stroke="#6ee7b7" stroke-width="3" stroke-linecap="round" />
      <line x1="330" y1="290" x2="500" y2="290" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
      <line x1="330" y1="310" x2="410" y2="310" stroke="#34d399" stroke-width="3" stroke-linecap="round" />

      <rect x="580" y="270" width="160" height="110" rx="6" fill="#18181b" stroke="#a855f7" stroke-width="2" />
      <line x1="600" y1="300" x2="710" y2="300" stroke="#c084fc" stroke-width="3" stroke-linecap="round" />
      <line x1="600" y1="320" x2="680" y2="320" stroke="#d8b4fe" stroke-width="3" stroke-linecap="round" />
      
      <rect x="0" y="380" width="800" height="220" fill="#09090b" />
      <line x1="0" y1="380" x2="800" y2="380" stroke="#27272a" stroke-width="3" />
    `;
  } else {
    graphic = `
      <!-- Camera Aperture & Minimalist Tech Geometric Grid -->
      <circle cx="400" cy="280" r="100" fill="none" stroke="#52525b" stroke-width="3" stroke-dasharray="8 6"/>
      <circle cx="400" cy="280" r="70" fill="#18181b" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="400" cy="280" r="30" fill="#09090b" stroke="#ffffff" stroke-width="2"/>
      <polygon points="370,220 440,240 400,310" fill="#38bdf8" opacity="0.3" />
      <polygon points="440,250 430,330 360,300" fill="#818cf8" opacity="0.3" />
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="30%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#bg)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
    
    <!-- Subtle grid lines -->
    <g stroke="#ffffff" stroke-width="1" opacity="0.05">
      <line x1="0" y1="100" x2="800" y2="100"/>
      <line x1="0" y1="200" x2="800" y2="200"/>
      <line x1="0" y1="300" x2="800" y2="300"/>
      <line x1="0" y1="400" x2="800" y2="400"/>
      <line x1="200" y1="0" x2="200" y2="500"/>
      <line x1="400" y1="0" x2="400" y2="500"/>
      <line x1="600" y1="0" x2="600" y2="500"/>
    </g>

    ${graphic}

    <!-- Contrast Scrim at bottom -->
    <rect x="0" y="320" width="800" height="180" fill="url(#bg)" opacity="0.85"/>

    <!-- Category tag & Text overlay -->
    <text x="40" y="400" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#38bdf8" letter-spacing="1.5">${category.toUpperCase()}</text>
    <text x="40" y="435" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" fill="#ffffff">${title}</text>
    <text x="40" y="465" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="400" fill="#a1a1aa">${subtitle}</text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_COVERS = {
  aiSummit: createSvgDataUrl('Global AI Summit 2026', 'Main Auditorium & Live Product Demos', 'Conference', '#09090b', '#18181b', 'stage'),
  foundersRetreat: createSvgDataUrl('Series B Founders Retreat', 'Tahoe Lodge Executive Offsite', 'Executive Offsite', '#0a0a0c', '#1e293b', 'retreat'),
  hackathon: createSvgDataUrl('Winter Hackathon 2026', '72-Hour Builders Showcase & Demo Day', 'Hackathon', '#050505', '#111827', 'hackathon'),
  designSprint: createSvgDataUrl('Apex Design Sprint', 'Design Systems & Spatial UI Exhibition', 'Workshop', '#09090b', '#1f2937', 'camera'),
};

export function generateEventPhoto(title: string, contributor: string, pattern: 'stage' | 'retreat' | 'hackathon' | 'gala' | 'camera', index: number): string {
  const colors = [
    ['#09090b', '#1e1e24'],
    ['#050505', '#172554'],
    ['#09090b', '#064e3b'],
    ['#0a0a0a', '#1e293b'],
    ['#09090b', '#27272a']
  ];
  const pair = colors[index % colors.length];
  return createSvgDataUrl(title, `Captured by ${contributor}`, 'EVENT PHOTO', pair[0], pair[1], pattern);
}
