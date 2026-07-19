import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../services/firebase/odService';

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ['audit_logs'],
    queryFn: fetchAuditLogs,
    refetchInterval: 10000, // Reactive polling every 10s for active security monitoring
  });
};
