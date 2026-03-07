export type GiftCategory = 'viagem' | 'hotel' | 'folga' | 'gastronomia' | 'relaxar' | 'memória';

export interface GiftItem {
  id: number;
  emoji: string;
  title: string;
  description: string;
  price: number;
  category: GiftCategory;
}

export const GIFT_ITEMS: GiftItem[] = [
  {
    id: 1,
    emoji: '✈️',
    title: 'Metade da passagem de avião',
    description: 'A outra metade a gente dá um jeito. Talvez.',
    price: 300,
    category: 'viagem',
  },
  {
    id: 2,
    emoji: '🏨',
    title: 'Uma noite no hotel dos sonhos',
    description: 'Com café da manhã incluído, porque somos finos assim.',
    price: 250,
    category: 'hotel',
  },
  {
    id: 3,
    emoji: '🌊',
    title: 'Um dia inteiro de praia',
    description: 'Protetor solar, caldo de cana e total irresponsabilidade.',
    price: 50,
    category: 'folga',
  },
  {
    id: 4,
    emoji: '🛁',
    title: 'Suíte com banheira de hidromassagem',
    description: 'Sim, afundou. Sim, a gente ficou.',
    price: 480,
    category: 'hotel',
  },
  {
    id: 5,
    emoji: '🦞',
    title: 'Jantar romântico com lagosta',
    description: 'Ele queria strogonoff. Demos um upgrade.',
    price: 350,
    category: 'gastronomia',
  },
  {
    id: 6,
    emoji: '💆',
    title: 'Spa do casal',
    description: 'Pra desentortar a coluna depois das danças do casamento.',
    price: 220,
    category: 'relaxar',
  },
  {
    id: 7,
    emoji: '🍹',
    title: 'Caipirinha na beira da piscina',
    description: 'A segunda é por conta da casa. (Não é, mas foi bonito pensar.)',
    price: 25,
    category: 'folga',
  },
  {
    id: 8,
    emoji: '📸',
    title: 'Fotógrafo de lua de mel',
    description: 'Pra provar que fomos lindos mesmo com bronzeado irregular.',
    price: 500,
    category: 'memória',
  },
  {
    id: 9,
    emoji: '☕',
    title: 'Café da manhã na cama',
    description: 'O único dia do ano que ele acorda antes das 9.',
    price: 35,
    category: 'relaxar',
  },
  {
    id: 10,
    emoji: '💤',
    title: 'Uma semana sem trabalhar',
    description: 'Sim, isso tem preço. E caro.',
    price: 180,
    category: 'folga',
  },
  {
    id: 11,
    emoji: '🚗',
    title: 'Uber pro aeroporto às 4h',
    description: '30kg de bagagem + sem dormir = não é tão caro assim.',
    price: 45,
    category: 'viagem',
  },
  {
    id: 12,
    emoji: '📱',
    title: 'Wi-Fi do hotel pra ele ver o jogo',
    description: 'Romantismo é aceitar quem a pessoa é.',
    price: 20,
    category: 'relaxar',
  },
  {
    id: 13,
    emoji: '🎂',
    title: 'Bolo do 1º mês de casados',
    description: 'Porque sim, a gente vai comemorar tudo.',
    price: 80,
    category: 'memória',
  },
  {
    id: 14,
    emoji: '💝',
    title: 'Qualquer coisa com amor',
    description: 'Contribuição simbólica pra quem já deu (demais) no casamento.',
    price: 10,
    category: 'folga',
  },
];
