import React from "react";
import Image from "next/image";
import { parseUserMetadata, formatTimestamp } from "../utils/nostrUtils";

interface EventTooltipProps {
  event: NostrEvent;
}

const EventTooltip: React.FC<EventTooltipProps> = ({ event }) => {
  const formattedTime = formatTimestamp(event.created_at);

  if (event.kind === 0) {
    const metadata: UserMetadata = parseUserMetadata(event.content);
    return (
      <div className="flex flex-col p-2 bg-white rounded shadow-lg max-w-sm">
        <p className="text-xs text-gray-500 mb-2">
          Last updated on {formattedTime}
        </p>
        <div className="flex items-center">
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
      </div>
    );
  } else if (event.kind === 1) {
    return (
      <div className="p-2 bg-white rounded shadow-lg max-w-sm">
        <p className="text-xs text-gray-500 mb-2">Posted on {formattedTime}</p>
        <p>{event.content.slice(0, 100)}...</p>
      </div>
    );
  } else {
    return (
      <div className="p-2 bg-white rounded shadow-lg max-w-sm">
        <p className="text-xs text-gray-500 mb-2">Created at {formattedTime}</p>
        <p>Event ID: {event.id}</p>
      </div>
    );
  }
};

export default EventTooltip;
