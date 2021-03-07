import React from "react";
import VisGraph from "react-graph-vis";
import data from "../../data/data.json"

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
  autoResize: true,
  physics:{
    enabled: true,
    barnesHut: {
      springConstant: 0,
      avoidOverlap: 0.2
    }
}
}

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

const events = {
    select: (event) => {
      var { nodes, edges } = event;
    }
  };

const randomColor = () => {
  const red = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const green = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const blue = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  return `#${red}${green}${blue}`;
}

export default function Graph() {
  return (
    <div>
        <VisGraph graph={createNodesAndEdges()} options={options} events={events} style={{ height: "640px" }} />
    </div>
  )
}