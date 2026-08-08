import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { apiClient } from '@/api/apiClient';
import type { Notificacao } from '@/types';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Mantém uma conexão SignalR com o hub de notificações enquanto o usuário estiver
 * autenticado. Trata dois eventos: "ReceberNotificacao" (pessoal, ex.: atribuição de
 * tarefa — exibe toast) e "DadosAtualizados" (broadcast para todos os conectados sempre
 * que uma tarefa ou projeto é criado/alterado/excluído, para manter dashboards e
 * listagens de outras sessões em sincronia sem precisar de reload).
 */
export function useSignalRNotifications() {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${baseUrl}/hubs/notifications`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connection.on('ReceberNotificacao', (notificacao: Notificacao) => {
      toast.success(notificacao.mensagem, { icon: <Bell className="h-4 w-4 text-brand-600" /> });
      dispatch(apiClient.util.invalidateTags([{ type: 'Notificacao', id: 'LIST' }]));
    });

    connection.on('DadosAtualizados', () => {
      dispatch(
        apiClient.util.invalidateTags([{ type: 'Tarefa', id: 'LIST' }, { type: 'Projeto', id: 'LIST' }, 'Dashboard']),
      );
    });

    connection.start().catch(() => {
      // Falha silenciosa: a UI continua funcional sem notificações em tempo real.
    });

    return () => {
      connection.stop();
    };
  }, [token, dispatch]);
}
