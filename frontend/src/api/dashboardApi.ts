import { apiClient } from './apiClient';
import type { DashboardMetricas } from '@/types';

export const dashboardApi = apiClient.injectEndpoints({
  endpoints: (builder) => ({
    obterMetricas: builder.query<DashboardMetricas, void>({
      query: () => '/dashboard/metricas',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useObterMetricasQuery } = dashboardApi;
