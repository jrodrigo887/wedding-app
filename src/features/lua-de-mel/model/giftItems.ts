export type GiftCategory =
  | 'viagem'
  | 'hotel'
  | 'folga'
  | 'gastronomia'
  | 'relaxar'
  | 'memória';

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
    title: 'Coca zero na beira da piscina',
    description:
      'A segunda é por conta da casa. (Não é, mas foi bonito pensar.)',
    price: 52,
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
    price: 43,
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
    price: 48.9,
    category: 'viagem',
  },
  {
    id: 12,
    emoji: '📱',
    title: 'Wi-Fi do hotel pra ele ver o jogo',
    description: 'Romantismo é aceitar quem a pessoa é.',
    price: 70,
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
    emoji: '💊',
    title: '"Fundo de emergência para TPM" (cofrinho)',
    description: 'O noivo agradece a sua contribuição.',
    price: 100,
    category: 'relaxar',
  },
  {
    id: 15,
    emoji: '🧾',
    title: 'Fundo de emergência da viagem',
    description:
      'Pra quando a bagagem sumir, o voo atrasar, ou ele perder o passaporte.',
    price: 100,
    category: 'viagem',
  },
  {
    id: 16,
    emoji: '💊',
    title: 'Kit pós-festa',
    description:
      'Salada de frutas, água de coco e uma boa desculpa para não sair da cama.',
    price: 45,
    category: 'relaxar',
  },
  {
    id: 17,
    emoji: '📖',
    title: 'Guia fictício: Lua de mel sem brigas',
    description: 'Spoiler: não existe. Mas pelo menos é engraçado tentar.',
    price: 40,
    category: 'memória',
  },
  {
    id: 18,
    emoji: '🍿',
    title: 'Noite de cinema no quarto',
    description: 'Netflix, minibar e total irresponsabilidade com a dieta.',
    price: 60,
    category: 'folga',
  },
  {
    id: 19,
    emoji: '🍿',
    title: 'Coleção de jogos para diversão do noivo e tristeza da noiva',
    description: 'Não contribui com isso, é sério!!!',
    price: 55,
    category: 'folga',
  },
  {
    id: 20,
    emoji: '🍿',
    title: 'Teste',
    description: 'Teste',
    price: 5,
    category: 'folga',
  },
];
