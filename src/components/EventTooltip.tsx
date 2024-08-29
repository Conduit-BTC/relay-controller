import React from "react";
import Image from "next/image";
import { parseUserMetadata } from "../utils/nostrUtils";

interface EventTooltipProps {
  event: NostrEvent;
}

const EventTooltip: React.FC<EventTooltipProps> = ({ event }) => {
  if (event.kind === 0) {
    const metadata: UserMetadata = parseUserMetadata(event.content);
    return (
      <div className="flex items-center p-2 bg-white rounded shadow-lg">
        <div className="w-12 h-12 mr-3 relative">
          <Image
            src={metadata.picture || "/default-avatar.png"}
            alt={metadata.name || "User"}
            layout="fill"
            objectFit="cover"
            className="rounded-full"
          />
        </div>
        <div>
          <h3 className="font-bold">{metadata.name || "Unknown"}</h3>
          <p className="text-sm">{metadata.about || "No description"}</p>
        </div>
      </div>
    );
  } else if (event.kind === 1) {
    return (
      <div className="p-2 bg-white rounded shadow-lg">
        <p>{event.content.slice(0, 100)}...</p>
      </div>
    );
  } else {
    return (
      <div className="p-2 bg-white rounded shadow-lg">
        <p>Event ID: {event.id}</p>
      </div>
    );
  }
};

export default EventTooltip;
