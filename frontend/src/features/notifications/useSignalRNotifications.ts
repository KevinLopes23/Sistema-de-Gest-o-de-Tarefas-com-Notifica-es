import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { apiClient } from '@/api/apiClient';
import type { Notificacao } from '@/types';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Mantém uma conexão SignalR com o hub de notificações enquanto o usuário estiver
 * autenticado, exibindo um toast e invalidando o cache de notificações a cada evento.
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
      toast.success(notificacao.mensagem, { icon: '🔔' });
      dispatch(apiClient.util.invalidateTags([{ type: 'Notificacao', id: 'LIST' }]));
    });

    connection.start().catch(() => {
      // Falha silenciosa: a UI continua funcional sem notificações em tempo real.
    });

    return () => {
      connection.stop();
    };
  }, [token, dispatch]);
}
