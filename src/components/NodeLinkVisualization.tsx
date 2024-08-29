"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { dummyData } from "../fixtures/dummy";
import { getEventColor, getEventSize } from "../utils/nostrUtils";
import EventTooltip from "./EventTooltip";

const NodeLinkVisualization: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltipEvent, setTooltipEvent] = useState<NostrEvent | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!svgRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const data = dummyData;

    const nodes = [
      ...data.pubkeys.map((pk) => ({ id: pk.id, type: "pubkey" })),
      ...data.events.map((e) => ({ ...e, type: "event" })),
    ];

    const links = data.events.flatMap((event) => [
      { source: event.pubkey, target: event.id },
      ...event.tags
        .filter((tag) => tag[0] === "e" || tag[0] === "p")
        .map((tag) => ({ source: event.id, target: tag[1] })),
    ]);

    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        "link",
        d3.forceLink(links).id((d: any) => d.id)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1);

    const node = svg
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d: any) => (d.type === "pubkey" ? 10 : getEventSize(d)))
      .attr("fill", (d: any) =>
        d.type === "pubkey" ? "#FFA500" : getEventColor(d)
      );

    // Add hover functionality
    node
      .on("mouseover", (event, d: any) => {
        if (d.type === "event") {
          setTooltipEvent(d);
          setTooltipPosition({ x: event.pageX, y: event.pageY });
        }
      })
      .on("mouseout", () => {
        setTooltipEvent(null);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);
    });
  }, []);

  return (
    <>
      <svg ref={svgRef} style={{ background: "#1e1e1e" }}></svg>
      {tooltipEvent && (
        <div
          style={{
            position: "absolute",
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 10}px`,
            zIndex: 1000,
          }}
        >
          <EventTooltip event={tooltipEvent} />
        </div>
      )}
    </>
  );
};

export default NodeLinkVisualization;
