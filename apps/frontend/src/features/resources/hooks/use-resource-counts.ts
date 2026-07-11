import { useQuery } from '@tanstack/react-query';

import { resourcesApi } from '../api/resources-api';
import { resourceKeys } from '../api/query-keys';

export function useResourceCounts() {
  return useQuery({
    queryKey: resourceKeys.counts(),
    queryFn: resourcesApi.counts,
  });
}
