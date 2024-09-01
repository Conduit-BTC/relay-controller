declare global {
  interface PubKey {
    id: string;
  }

  interface NostrEvent {
    kind: number;
    content: string;
    created_at: number;
    id: string;
    pubkey: string;
    tags: string[][];
    sig: string;
  }

  interface UserMetadata {
    name: string;
    about: string;
    picture: string;
  }

  interface Link {
    source: string;
    target: string;
  }

  interface EventWithRelay extends NostrEvent {
    relayUrl: string;
  }


}
export { };
