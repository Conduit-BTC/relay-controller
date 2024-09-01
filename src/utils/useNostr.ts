import { useState, useEffect } from 'react';
import { SimplePool } from 'nostr-tools';

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nostr.fmt.wiz.biz',
  'wss://nostr.oxtr.dev',
  'wss://relay.nostr.band',
];

export const useNostr = () => {
  const [pool, setPool] = useState<SimplePool | null>(null);

  useEffect(() => {
    const newPool = new SimplePool();
    setPool(newPool);

    return () => {
      newPool.close(RELAYS);
    };
  }, []);

  return { pool, relays: RELAYS };
};
