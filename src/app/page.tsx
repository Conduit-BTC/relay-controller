"use client";

// import { useState } from "react";
// import NodeLinkVisualization from "@/components/NodeLinkVisualization";
import HomeBase from "@/components/HomeBase";

export default function Home() {
  // const [maxKind0Events, setMaxKind0Events] = useState(10);
  // const [maxKind1Events, setMaxKind1Events] = useState(25);

  return (
    <div>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          color: "white",
          zIndex: 1000,
        }}
      >
        {/* <div>
          <label htmlFor="maxKind0Events">
            Max Kind 0 Events: {maxKind0Events}
          </label>
          <input
            type="range"
            id="maxKind0Events"
            min="1"
            max="50"
            value={maxKind0Events}
            onChange={(e) => setMaxKind0Events(Number(e.target.value))}
            style={{ width: "200px" }}
          />
        </div>
        <div>
          <label htmlFor="maxKind1Events">
            Max Kind 1 Events per Kind 0: {maxKind1Events}
          </label>
          <input
            type="range"
            id="maxKind1Events"
            min="1"
            max="50"
            value={maxKind1Events}
            onChange={(e) => setMaxKind1Events(Number(e.target.value))}
            style={{ width: "200px" }}
          />
        </div> */}
      </div>
      {/* <NodeLinkVisualization maxKind0Events={maxKind0Events} maxKind1Events={maxKind1Events} /> */}
      <HomeBase />
    </div>
  );
}
