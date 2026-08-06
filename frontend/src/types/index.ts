export type StatusTarefa = 'Pendente' | 'EmAndamento' | 'Concluida' | 'Cancelada';
export type Prioridade = 'Baixa' | 'Media' | 'Alta' | 'Urgente';

export interface Projeto {
  id: number;
  nome: string;
  descricao: string | null;
  dataCriacao: string;
  totalTarefas: number;
  totalTarefasConcluidas: number;
}

export interface CriarProjetoRequest {
  nome: string;
  descricao?: string | null;
}

export type AtualizarProjetoRequest = CriarProjetoRequest;

export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string | null;
  status: StatusTarefa;
  prioridade: Prioridade;
  projetoId: number;
  projetoNome: string | null;
  responsavelId: number | null;
  responsavelNome: string | null;
  dataCriacao: string;
  dataPrazo: string;
  dataConclusao: string | null;
  isAtrasada: boolean;
}

export interface CriarTarefaRequest {
  titulo: string;
  descricao?: string | null;
  prioridade: Prioridade;
  projetoId: number;
  dataPrazo: string;
  responsavelId?: number | null;
}

export interface AtualizarTarefaRequest {
  titulo: string;
  descricao?: string | null;
  prioridade: Prioridade;
  dataPrazo: string;
  responsavelId?: number | null;
}

export interface TarefaFiltro {
  projetoId?: number;
  status?: StatusTarefa;
  responsavelId?: number;
  prazoAte?: string;
  ordenarPor?: 'prazo' | 'prioridade' | 'status' | 'titulo';
  descendente?: boolean;
}

export interface DashboardMetricas {
  totalPorStatus: Record<string, number>;
  totalTarefas: number;
  tarefasAtrasadas: number;
  tarefasConcluidasNoPrazo: number;
  taxaConclusao: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface Notificacao {
  id: number;
  mensagem: string;
  lida: boolean;
  dataCriacao: string;
  tarefaId: number | null;
}

export interface ApiProblemDetails {
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}
