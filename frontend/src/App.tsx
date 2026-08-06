import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from '@/features/auth/LoginPage';
import { RegisterPage } from '@/features/auth/RegisterPage';
import { ProjetosPage } from '@/features/projetos/ProjetosPage';
import { TarefasPage } from '@/features/tarefas/TarefasPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { FullPageSpinner } from '@/components/ui/Spinner';

// Code-split o Dashboard: é a única tela que depende do recharts (~250kB), então
// carregá-la sob demanda evita inflar o bundle inicial de login/projetos/tarefas.
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<FullPageSpinner />}>
                  <DashboardPage />
                </Suspense>
              }
            />
            <Route path="/projetos" element={<ProjetosPage />} />
            <Route path="/tarefas" element={<TarefasPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
