"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getEventColor, getEventSize } from "../utils/nostrUtils";
import EventTooltip from "./EventTooltip";
import nostrConnection from "../utils/nostrConnection";

interface NodeLinkVisualizationProps {
  maxKind0Events: number;
  maxKind1Events: number;
}

const NodeLinkVisualization: React.FC<NodeLinkVisualizationProps> = ({
  maxKind0Events,
  maxKind1Events,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipEvents, setTooltipEvents] = useState<EventWithRelay[]>([]);
  const [events, setEvents] = useState<EventWithRelay[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    Record<string, string>
  >({});
  const [showAllTooltips, setShowAllTooltips] = useState(false);

  useEffect(() => {
    const subscribeToNostrEvents = async () => {
      try {
        await nostrConnection.subscribeToEvents(
          (event: NostrEvent, relayUrl: string) => {
            if (event.kind === -1) {
              // Handle connection status update
              const statusUpdate = JSON.parse(event.content);
              setConnectionStatus((prev) => ({
                ...prev,
                [statusUpdate.relayUrl]: statusUpdate.status,
              }));
            } else {
              setEvents((prevEvents) => {
                const eventWithRelay: EventWithRelay = { ...event, relayUrl };
                // Check if the event already exists (by id) and update it, otherwise add it
                const index = prevEvents.findIndex((e) => e.id === event.id);
                if (index > -1) {
                  const updatedEvents = [...prevEvents];
                  updatedEvents[index] = eventWithRelay;
                  return updatedEvents;
                } else {
                  return [...prevEvents, eventWithRelay];
                }
              });
            }
          },
          maxKind0Events,
          maxKind1Events
        );
      } catch (error) {
        console.error("Failed to subscribe to Nostr events:", error);
      }
    };

    subscribeToNostrEvents();

    return () => {
      nostrConnection.close();
    };
  }, [maxKind0Events, maxKind1Events]);

  useEffect(() => {
    if (!svgRef.current || events.length === 0) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Clear previous content
    svg.selectAll("*").remove();

    // Create a group for the zoomable content
    const g = svg.append("g");

    // Sort events by created_at timestamp
    const sortedEvents = [...events].sort(
      (a, b) => a.created_at - b.created_at
    );

    const nodes = sortedEvents.map((e) => ({
      id: e.id,
      ...e,
      type: e.kind === 0 ? "profile" : "event",
    }));
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    // Group events by pubkey and kind
    const eventGroups = sortedEvents.reduce((acc, event) => {
      const key = `${event.pubkey}-${event.kind}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(event);
      return acc;
    }, {} as Record<string, EventWithRelay[]>);

    const links: Link[] = [];

    Object.values(eventGroups).forEach((group) => {
      if (group[0].kind !== 0) {
        const profileEvent = sortedEvents.find(
          (e) => e.kind === 0 && e.pubkey === group[0].pubkey
        );
        if (profileEvent) {
          links.push({ source: profileEvent.id, target: group[0].id });
        }
      }

      for (let i = 1; i < group.length; i++) {
        links.push({ source: group[i - 1].id, target: group[i].id });
      }
    });

    // Add links for referenced events
    sortedEvents.forEach((event) => {
      event.tags
        .filter((tag) => tag[0] === "e" || tag[0] === "p")
        .forEach((tag) => {
          if (nodeMap.has(tag[1])) {
            links.push({ source: event.id, target: tag[1] });
          }
        });
    });

    const validLinks = links.filter(
      (link) => nodeMap.has(link.source) && nodeMap.has(link.target)
    );

    try {
      const simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3.forceLink(validLinks).id((d: any) => d.id)
        )
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(width / 2, height / 2));

      const link = g
        .append("g")
        .selectAll("line")
        .data(validLinks)
        .join("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1);

      const node = g
        .append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", (d: any) => (d.type === "profile" ? 15 : getEventSize(d)))
        .attr("fill", (d: any) =>
          d.type === "profile" ? "#FFA500" : getEventColor(d)
        );

      node
        .on("mouseover", (event, d: any) => {
          if (!showAllTooltips) {
            setTooltipEvents([d]);
          }
        })
        .on("mouseout", () => {
          if (!showAllTooltips) {
            setTooltipEvents([]);
          }
        });

      const zoom = d3
        .zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom as any);

      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
      });

      if (showAllTooltips) {
        setTooltipEvents(nodes as EventWithRelay[]);
      } else {
        setTooltipEvents([]);
      }
    } catch (error) {
      console.error("Error in D3 force simulation:", error);
    }
  }, [events, showAllTooltips]);

  const ToggleSwitch = () => (
    <label
      className="switch"
      style={{ position: "absolute", top: 10, left: 10 }}
    >
      <input
        type="checkbox"
        checked={showAllTooltips}
        onChange={() => setShowAllTooltips(!showAllTooltips)}
      />
      <span className="slider round"></span>
      <span style={{ color: "white", marginLeft: "60px", lineHeight: "34px" }}>
        {showAllTooltips ? "Hide All Tooltips" : "Show All Tooltips"}
      </span>
    </label>
  );

  return (
    <>
      <svg ref={svgRef} style={{ background: "#1e1e1e" }}></svg>
      <div className="absolute top-16">
        <ToggleSwitch />
      </div>
      {tooltipEvents.map((event) => (
        <div
          key={event.id}
          style={{
            position: "absolute",
            left: `${(event as any).x + 10}px`,
            top: `${(event as any).y - 10}px`,
            zIndex: 1000,
          }}
        >
          <EventTooltip event={event} />
        </div>
      ))}
      <div style={{ position: "absolute", top: 10, right: 10, color: "white" }}>
        <h3>Connection Status:</h3>
        {Object.entries(connectionStatus).map(([relay, status]) => (
          <div key={relay}>
            {relay}: {status}
          </div>
        ))}
      </div>
      <div
        style={{ position: "absolute", bottom: 10, right: 10, color: "white" }}
      >
        <p>Use mouse wheel to zoom in/out</p>
        <p>Click and drag to pan</p>
      </div>
    </>
  );
};

export default NodeLinkVisualization;
