export const getEventColor = (event: NostrEvent): string => {
  switch (event.kind) {
    case 0:
      return "#4CAF50"; // Green for user metadata
    case 1:
      return "#2196F3"; // Blue for text notes
    default:
      return "#9E9E9E"; // Grey for other kinds
  }
};

export const getEventSize = (event: NostrEvent): number => {
  switch (event.kind) {
    case 0:
      return 8; // Larger for user metadata
    case 1:
      return 5; // Standard size for text notes
    default:
      return 4; // Smaller for other kinds
  }
};

export const parseUserMetadata = (content: string): UserMetadata => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse user metadata:", error);
    return { name: "Unknown", about: "", picture: "" };
  }
};

export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'America/Los_Angeles'
  }) + ' PST';
};

export const getEventTooltipContent = (event: NostrEvent): string => {
  const formattedTime = formatTimestamp(event.created_at);
  switch (event.kind) {
    case 0:
      const metadata = parseUserMetadata(event.content);
      return `Last updated on ${formattedTime}\nUser: ${metadata.name}\nAbout: ${metadata.about}`;
    case 1:
      return `Posted on ${formattedTime}\nNote: ${event.content.slice(0, 50)}${event.content.length > 50 ? '...' : ''}`;
    default:
      return `Event: ${event.id}\nCreated at: ${formattedTime}`;
  }
};
