export const dummyData: { pubkeys: PubKey[]; events: NostrEvent[] } = {
  pubkeys: [
    { id: "pubkey1" },
    { id: "pubkey2" },
    { id: "pubkey3" },
  ],
  events: [
    {
      kind: 0,
      content: JSON.stringify({
        name: "Alice",
        about: "I love Nostr!",
        picture: "https://example.com/alice.jpg"
      }),
      created_at: 1677825600,
      id: "event1",
      pubkey: "pubkey1",
      tags: [],
      sig: "signature1",
    },
    {
      kind: 1,
      content: "Hello Nostr! This is my first post.",
      created_at: 1677825700,
      id: "event2",
      pubkey: "pubkey2",
      tags: [],
      sig: "signature2",
    },
    {
      kind: 1,
      content: "Reply to Alice's profile",
      created_at: 1677825800,
      id: "event3",
      pubkey: "pubkey3",
      tags: [["e", "event1"], ["p", "pubkey1"]],
      sig: "signature3",
    },
  ],
};
