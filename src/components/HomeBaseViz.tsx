import React, { useState, useEffect, useRef } from "react";
import { Event, Filter, SimplePool } from "nostr-tools";
import { nip19 } from "nostr-tools";
import EventTooltip from "./EventTooltip";
import ProfileCard from "./ProfileCard";

const RELAYS = [
  "wss://relay.damus.io",
  "wss://nostr.fmt.wiz.biz",
  "wss://nostr.oxtr.dev",
  "wss://relay.nostr.band",
];

const colorSelector = (kind: number): string => {
  const hue = (kind * 137.5) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const HomeBaseViz: React.FC = () => {
  const [npub, setNpub] = useState("");
  const [pubkey, setPubkey] = useState("");
  const [kind0Event, setKind0Event] = useState<Event | null>(null);
  const [events, setEvents] = useState<EventNode[]>([]);
  const [pool, setPool] = useState<SimplePool | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<EventNode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const newPool = new SimplePool();
    setPool(newPool);

    return () => {
      newPool.close(RELAYS);
    };
  }, []);

  useEffect(() => {
    if (pool && pubkey) {
      setIsLoading(true);
      setError(null);
      console.log("Fetching events for pubkey:", pubkey);
      fetchKind0Event();
      fetchAllEvents();
    }
  }, [pool, pubkey]);

  const handleNpubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { type, data } = nip19.decode(npub);
      if (type === "npub") {
        setPubkey(data as string);
      } else {
        setError("Invalid npub format");
      }
    } catch (error) {
      console.error("Error decoding npub:", error);
      setError("Error decoding npub. Please check the input and try again.");
    }
  };

  const fetchKind0Event = async () => {
    if (!pool) return;
    const filter: Filter = { authors: [pubkey], kinds: [0], limit: 1 };
    const sub = pool.subscribeMany(RELAYS, [filter], {
      onevent(event: Event) {
        setKind0Event(event);
        sub.close();
      },
    });
  };

  const fetchAllEvents = async () => {
    if (!pool) return;
    const filter: Filter = { authors: [pubkey] };
    const sub = pool.subscribeMany(RELAYS, [filter], {
      onevent(event: Event) {
        setEvents((prevEvents) => {
          const eventNode: EventNode = {
            id: event.id,
            kind: event.kind,
            content: event.content,
            created_at: event.created_at,
            pubkey: event.pubkey,
          };
          // Check if the event already exists (by id) and update it, otherwise add it
          const index = prevEvents.findIndex((e) => e.id === event.id);
          if (index > -1) {
            const updatedEvents = [...prevEvents];
            updatedEvents[index] = eventNode;
            return updatedEvents;
          } else {
            return [...prevEvents, eventNode];
          }
        });
        setIsLoading(false);
      },
    });
  };

  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.kind]) {
      acc[event.kind] = [];
    }
    acc[event.kind].push(event);
    return acc;
  }, {} as Record<number, EventNode[]>);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div
        className="overflow-auto"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <div className="p-4">
          <form onSubmit={handleNpubSubmit} className="flex">
            <input
              type="text"
              value={npub}
              onChange={(e) => setNpub(e.target.value)}
              placeholder="Enter npub"
              className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit
            </button>
          </form>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </div>
        )}
        {kind0Event && (
          <div className="p-4 bg-gray-200 rounded-bl-lg shadow-md">
            <ProfileCard profile={JSON.parse(kind0Event.content)} />
          </div>
        )}
        {!isLoading && events.length > 0 && (
          <div className="flex-grow overflow-x-auto p-4 relative">
            <svg
              ref={svgRef}
              width={Object.values(groupedEvents).reduce(
                (max, events) => Math.max(max, events.length * 50 + 100),
                0
              )}
              height={Object.keys(groupedEvents).length * 100}
              onMouseMove={handleMouseMove}
            >
              {Object.entries(groupedEvents).map(
                ([kind, events], kindIndex) => (
                  <g key={kind} transform={`translate(0, ${kindIndex * 100})`}>
                    {events
                      .sort((a, b) => a.created_at - b.created_at)
                      .map((event, index, array) => (
                        <React.Fragment key={event.id}>
                          <circle
                            cx={index * 50 + 50}
                            cy={50}
                            r={10}
                            fill={colorSelector(parseInt(kind))}
                            onMouseEnter={() => setHoveredEvent(event)}
                            onMouseLeave={() => setHoveredEvent(null)}
                            className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          />
                          {index < array.length - 1 && (
                            <line
                              x1={index * 50 + 60}
                              y1={50}
                              x2={(index + 1) * 50 + 40}
                              y2={50}
                              stroke={colorSelector(parseInt(kind))}
                              strokeWidth={2}
                            />
                          )}
                          <text
                            x={index * 50 + 50}
                            y={75}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#4A5568"
                          >
                            {event.kind}
                          </text>
                        </React.Fragment>
                      ))}
                  </g>
                )
              )}
            </svg>
            {hoveredEvent && (
              <div
                className="absolute bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md"
                style={{
                  left: `${mousePosition.x + 50}px`,
                  top: `${mousePosition.y + 50}px`,
                  zIndex: 1000,
                }}
              >
                <EventTooltip event={hoveredEvent} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeBaseViz;
