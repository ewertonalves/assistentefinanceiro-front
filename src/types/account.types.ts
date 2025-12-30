export interface DadosContaDTO {
  id?: number;
  banco: string;
  numeroAgencia: string;
  numeroConta: string;
  tipoConta: string;
  responsavel: string;
  saldo?: number;
}

