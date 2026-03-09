import { ResponseFindAllObras } from "./development.interface.integration";

export const isObraDeReceita = (obra: ResponseFindAllObras): boolean => {
  const pertenceEmpresaAlvo = obra.Empresa_obr === 1;
  const temPrefixoValido = ['R', 'J'].includes(obra.Cod_obr?.[0]);
  return pertenceEmpresaAlvo && temPrefixoValido;
};
