export interface IInfosSite {
  title: string; // titulo
  description: string; // descricao
  highlights: { name: string; description: string }[]; // destaques
  price_from: number; // precoAPartir
  average_area_m2: number; // areaMediaM2
}
