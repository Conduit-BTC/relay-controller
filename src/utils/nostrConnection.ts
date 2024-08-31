declare global {
  interface NostrEvent {
    id: string;
    pubkey: string;
    created_at: number;
    kind: number;
    tags: string[][];
    content: string;
    sig: string;
  }

  interface NostrFilter {
    ids?: string[];
    authors?: string[];
    kinds?: number[];
    '#e'?: string[];
    '#p'?: string[];
    since?: number;
    until?: number;
    limit?: number;
  }
}

class NostrConnection {
  private sockets: Map<string, WebSocket> = new Map();
  private subscriptionId: string = 'default-subscription';
  private eventCallback: ((event: NostrEvent, relayUrl: string) => void) | null = null;
  private maxRetries: number = 5;
  private retryDelay: number = 5000; // 5 seconds
  private connectionStatus: Map<string, string> = new Map();
  private connectPromises: Map<string, Promise<WebSocket>> = new Map();

  constructor(private relayUrls: string[]) {
    this.initializeConnections();
  }

  private async initializeConnections() {
    await Promise.all(this.relayUrls.map(url => this.connectToRelay(url)));
  }

  private async connectToRelay(relayUrl: string, retryCount: number = 0): Promise<WebSocket> {
    if (this.connectPromises.has(relayUrl)) {
      return this.connectPromises.get(relayUrl)!;
    }

    const connectPromise = new Promise<WebSocket>((resolve, reject) => {
      this.updateConnectionStatus(relayUrl, 'connecting');
      const socket = new WebSocket(relayUrl);

      socket.onopen = () => {
        console.log(`Connected to relay: ${relayUrl}`);
        this.updateConnectionStatus(relayUrl, 'connected');
        this.sockets.set(relayUrl, socket);
        resolve(socket);
      };

      socket.onclose = (event) => {
        console.log(`Disconnected from relay: ${relayUrl}`);
        this.updateConnectionStatus(relayUrl, 'disconnected');
        this.sockets.delete(relayUrl);
        this.connectPromises.delete(relayUrl);
        if (!event.wasClean && retryCount < this.maxRetries) {
          console.log(`Attempting to reconnect to ${relayUrl}. Attempt ${retryCount + 1} of ${this.maxRetries}`);
          setTimeout(() => this.connectToRelay(relayUrl, retryCount + 1), this.retryDelay);
        } else {
          reject(new Error(`Failed to connect to ${relayUrl} after ${this.maxRetries} attempts`));
        }
      };

      socket.onerror = (error) => {
        console.error(`WebSocket error for ${relayUrl}:`, error);
        this.updateConnectionStatus(relayUrl, 'error');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data) && data[0] === 'EVENT' && data[1] === this.subscriptionId) {
            const nostrEvent = data[2] as NostrEvent;
            this.handleEvent(nostrEvent, relayUrl);
          }
        } catch (error) {
          console.error(`Error parsing message from ${relayUrl}:`, error);
        }
      };
    });

    this.connectPromises.set(relayUrl, connectPromise);
    return connectPromise;
  }

  private updateConnectionStatus(relayUrl: string, status: string) {
    this.connectionStatus.set(relayUrl, status);
    // Notify subscribers about the status change
    if (this.eventCallback) {
      this.eventCallback({ id: 'status-update', pubkey: '', created_at: Date.now(), kind: -1, tags: [], content: JSON.stringify({ relayUrl, status }), sig: '' }, relayUrl);
    }
  }

  private handleEvent(event: NostrEvent, relayUrl: string) {
    if (this.eventCallback) {
      this.eventCallback(event, relayUrl);
    }
  }

  private sendSubscription(socket: WebSocket, relayUrl: string, filter: NostrFilter) {
    if (socket.readyState === WebSocket.OPEN) {
      const subscriptionMessage = JSON.stringify(['REQ', this.subscriptionId, filter]);
      socket.send(subscriptionMessage);
    } else {
      console.warn(`Cannot send subscription to ${relayUrl}: WebSocket is not open. Will retry when connected.`);
    }
  }

  async subscribeToEvents(callback: (event: NostrEvent, relayUrl: string) => void, maxKind0Events: number, maxKind1Events: number) {
    this.eventCallback = callback;
    await this.initializeConnections();

    // First, subscribe to kind 0 events
    const kind0Filter: NostrFilter = { kinds: [0], limit: maxKind0Events };
    this.sockets.forEach((socket, relayUrl) => {
      this.sendSubscription(socket, relayUrl, kind0Filter);
    });

    // Wait for kind 0 events to be received
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds

    // Then, subscribe to kind 1 events for each received kind 0 event
    const kind0Events = Array.from(this.sockets.values())
      .flatMap(socket => (socket as any).receivedEvents || [])
      .filter(event => event.kind === 0);

    const kind1Filter: NostrFilter = {
      kinds: [1],
      authors: kind0Events.map(event => event.pubkey),
      limit: maxKind1Events
    };

    this.sockets.forEach((socket, relayUrl) => {
      this.sendSubscription(socket, relayUrl, kind1Filter);
    });
  }

  getConnectionStatus() {
    return Object.fromEntries(this.connectionStatus);
  }

  async close() {
    const closePromises = Array.from(this.sockets.entries()).map(([relayUrl, socket]) => {
      return new Promise<void>((resolve) => {
        if (socket.readyState === WebSocket.OPEN) {
          const closeMessage = JSON.stringify(['CLOSE', this.subscriptionId]);
          socket.send(closeMessage);
          socket.close();
          console.log(`Closed connection to relay: ${relayUrl}`);
        }
        resolve();
      });
    });

    await Promise.all(closePromises);
    this.sockets.clear();
    this.connectionStatus.clear();
    this.connectPromises.clear();
  }
}

const relayUrls = [
  'wss://nos.lol',
  'wss://relay.snort.social',
  // 'wss://relay.damus.io'
];

export const nostrConnection = new NostrConnection(relayUrls);

export default nostrConnection;
