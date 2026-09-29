import { BRIDGE_STATUS, type MountedBridgePlatform } from '@nexa/contract';
import { bridgeStatusQueryOptions, bridgesApi, extractApiError } from '@nexa/data';
import { useToast } from '@nexa/shared-ui/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * Controller for one bridge card.
 *
 * Each card owns its own request and its own state, exactly as the legacy `BridgeCard` did — there
 * is no shared parent state, so one bridge failing does not affect the other.
 *
 * Preserved quirks:
 * - A failed status fetch shows the literal 'Could not reach bridge' and leaves status null, so
 *   the card falls back to the Connect button rather than an error state.
 * - Disconnect writes `logged_out` into local state on success. It does NOT refetch the status
 *   endpoint, which would be an extra request (DP-003 covers revisiting this).
 * - There is no confirmation step. Disconnect fires on the first click.
 */
export function useBridgeCard(platform: MountedBridgePlatform) {
  const queryClient = useQueryClient();
  const toast = useToast();
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
      // Local-only status update, matching `set({ status: 'logged_out' })`.
      queryClient.setQueryData(bridgeStatusQueryOptions(platform).queryKey, (previous) =>
        previous ? { ...previous, status: BRIDGE_STATUS.loggedOut } : previous
      );
      setActionMessage('Disconnected successfully.');
      toast.success('Disconnected successfully.');
    },
    onError: (error) => {
      const message = extractApiError(error, 'Logout failed');
      setActionError(message);
      toast.error(message);
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
