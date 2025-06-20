
export interface CutsceneSlide {
  image?: string; // Image is optional for black screens
  text: string;
  duration?: number; // Optional: duration in ms for auto-advancing slides
}

export const openingCutsceneData: CutsceneSlide[] = [
  {
    // Initial black screen with ambient sound (sound will be added later)
    text: "Eles chamam isso de Território de Caldera. Dizem que o Diabo cuspiu essa terra num acesso de febre, e Deus nunca mais olhou para trás. Era um lugar de sede, poeira e silêncio. Um lugar onde a vida era barata e a morte, uma vizinha constante."
  },
  {
    image: 'https://raw.githubusercontent.com/Gustavito456/assets/main/cutscene1.png',
    text: "No meio do nada, havia uma ferida chamada Red Hollow. Um burgo esquecido que não ganhou esse nome pela cor da terra, mas pelo sangue que a regava para mantê-la viva. Era um lugar honesto em sua miséria. Pelo menos, até o progresso chegar."
  },
  {
    image: 'https://raw.githubusercontent.com/Gustavito456/assets/main/cutscene2.png',
    text: "Não veio como uma promessa. Veio como uma praga, montada numa serpente de aço e vapor. A ferrovia. Ela não conectava cidades; ela sangrava a terra. E com ela, vieram os homens que a serviam. Homens com corações de ferro frio e a fome de um deus ganancioso."
  },
  {
    image: 'https://raw.githubusercontent.com/Gustavito456/assets/main/cutscene3.png',
    text: "Eles não viam o solo; viam o que estava por baixo. Prata. O bastante para comprar o silêncio, a lei e a alma de qualquer um. Promessas foram quebradas como ossos. Uma dessas famílias era a Kane. E um desses homens... era o Capitão McGraw."
  },
  {
    // Final black screen
    text: "Esta é a história que a poeira se lembra. Uma história paga com sangue e terminada com pólvora."
  }
];
