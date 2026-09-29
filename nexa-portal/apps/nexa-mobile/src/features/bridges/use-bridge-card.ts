import { BRIDGE_STATUS, type MountedBridgePlatform } from '@nexa/contract';
import { bridgeStatusQueryOptions, bridgesApi, extractApiError } from '@nexa/data';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useSnackbar } from '../../app/snackbar';

/** Parity with web: no confirm, local logged_out, no status refetch. */
export function useBridgeCard(platform: MountedBridgePlatform) {
  const queryClient = useQueryClient();
  const snackbar = useSnackbar();
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  const statusQuery = useQuery(bridgeStatusQueryOptions(platform));

  const disconnect = useMutation({
    mutationFn: () => bridgesApi.logout(platform),
    onMutate: () => {
      setActionMessage('');
      setActionError('');
    },
    onSuccess: () => {
      queryClient.setQueryData(bridgeStatusQueryOptions(platform).queryKey, (previous) =>
        previous ? { ...previous, status: BRIDGE_STATUS.loggedOut } : previous
      );
      setActionMessage('Disconnected successfully.');
      snackbar.success('Disconnected successfully.');
    },
    onError: (error) => {
      const message = extractApiError(error, 'Logout failed');
      setActionError(message);
      snackbar.error(message);
    },
  });

  const status = statusQuery.isError ? null : (statusQuery.data?.status ?? null);

  return {
    isChecking: statusQuery.isLoading,
    status,
    isConnected: status === BRIDGE_STATUS.connected,
    statusError: statusQuery.isError ? 'Could not reach bridge' : '',
    actionError,
    actionMessage,
    isDisconnecting: disconnect.isPending,
    disconnect: () => disconnect.mutate(),
  };
}
