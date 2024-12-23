import { useInterval } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { checkCanDatabaseBeConnected } from 'utils/common/sparql';

export function useDatabaseConnectivity() {
  const [canDatabaseBeConnected, setCanDatabaseBeConnected] = useState(false);

  useEffect(() => {
    (async () => {
      setCanDatabaseBeConnected(await checkCanDatabaseBeConnected());
    })();
  }, []);

  useInterval(
    async () => {
      setCanDatabaseBeConnected(await checkCanDatabaseBeConnected());
    },
    canDatabaseBeConnected ? null : 10 * 1000
  );

  return canDatabaseBeConnected;
}
