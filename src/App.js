import Graph from "react-graph-vis";
import React, { useState } from "react";
import data from "./data/data.json"

const options = {
  layout: {
    hierarchical: false,
    improvedLayout: false
  },
  edges: {
    color: "#000000",
    arrows: {
      to: {
        enabled: false
      }
    }
  },
  autoResize: true
};

const createNodesAndEdges = () => {
  var nodes = []
  var edges = []
  data.all_artists.forEach(item => {
    nodes.push({ id: item.id, label: item.name, color: randomColor()})
    item.recommended.forEach(recommended => {
      edges.push({ from: item.id, to: recommended })
    })
  })
  return {
    nodes: nodes,
    edges: edges
  }
}

function randomColor() {
  const red = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const green = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const blue = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return `#${red}${green}${blue}`;
}

const App = () => {
  const [state] = useState({
    counter: 5,
    graph: createNodesAndEdges(),
    events: {
      select: ({ nodes, edges }) => {
        console.log("Selected nodes:");
        console.log(nodes);
        console.log("Selected edges:");
        console.log(edges);
        alert("Selected node: " + nodes);
      }
    }
  })
  const { graph, events } = state;
  console.log(data.all_artists)
  return (
    <div>
      <Graph graph={graph} options={options} events={events} style={{ height: "640px" }} />
    </div>
  );
}

export default App;
