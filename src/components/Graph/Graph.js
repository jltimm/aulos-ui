import React, {useRef, useCallback} from "react";
import data from "../../data/data.json"
import ForceGraph3D from 'react-force-graph-3d';

const createNodesAndEdges = () => {
  var nodes = []
  var links = []
  data.all_artists.forEach(item => {
    nodes.push({ id: item.id, name: item.name, val: item.popularity / 10.0 })
    item.recommended.forEach(recommended => {
      links.push({ source: item.id, target: recommended })
    })
  })
  return {
    nodes: nodes,
    links: links
  }
}

export default function Graph(props) {
  const fgRef = useRef();

  const handleClick = useCallback(node => {
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
      node, // lookAt ({ x, y, z })
      3000  // ms transition duration
    );
  }, [fgRef]);

  return (
    <ForceGraph3D
      ref={fgRef}
      graphData={createNodesAndEdges()}
      nodeLabel="name"
      nodeAutoColorBy="group"
      onNodeClick={handleClick}
    />
  );
}