declare global {
  export interface PubKey {
    id: string;
  }

  export interface NostrEvent {
    kind: number;
    content: string;
    created_at: number;
    id: string;
    pubkey: string;
    tags: string[][];
    sig: string;
  }

  export interface UserMetadata {
    name: string;
    about: string;
    picture: string;
  }
}

export { };
