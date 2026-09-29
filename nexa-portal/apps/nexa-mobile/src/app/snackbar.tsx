import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Snackbar } from 'react-native-paper';

type SnackTone = 'default' | 'success' | 'error' | 'warning';

interface SnackState {
  visible: boolean;
  message: string;
  tone: SnackTone;
}

interface SnackbarApi {
  show: (message: string, tone?: SnackTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
}

const SnackbarContext = createContext<SnackbarApi | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SnackState>({
    visible: false,
    message: '',
    tone: 'default',
  });

  const show = useCallback((message: string, tone: SnackTone = 'default') => {
    setState({ visible: true, message, tone });
  }, []);

  const api = useMemo<SnackbarApi>(
    () => ({
      show,
      success: (message) => show(message, 'success'),
      error: (message) => show(message, 'error'),
      warning: (message) => show(message, 'warning'),
    }),
    [show]
  );

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      <Snackbar
        visible={state.visible}
        onDismiss={() => setState((prev) => ({ ...prev, visible: false }))}
        duration={3200}
        style={
          state.tone === 'error'
            ? { backgroundColor: '#dc2626' }
            : state.tone === 'success'
              ? { backgroundColor: '#16a34a' }
              : state.tone === 'warning'
                ? { backgroundColor: '#d97706' }
                : undefined
        }
      >
        {state.message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar(): SnackbarApi {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }
  return ctx;
}
