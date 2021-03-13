import React, { useState, useCallback, useMemo } from "react";
import data from "../../data/data.json"
import ForceGraph2D from 'react-force-graph-2d';

const createNodesAndEdges = () => {
  var nodes = []
  var links = []
  data.all_artists.forEach(item => {
    nodes.push({ id: item.id, name: item.name, val: 1 })
    item.recommended.forEach(recommended => {
      links.push({ source: item.id, target: recommended })
    })
  })
  return {
    nodes: nodes,
    links: links
  }
}

export default function Graph() {
  const NODE_R = 4;
  const data = useMemo(() => {
    const gData = createNodesAndEdges();

    // cross-link node objects
    gData.links.forEach(link => {
      const a = gData.nodes.filter(it => it.id === link.source)[0];
      const b = gData.nodes.filter(it => it.id === link.target)[0];
      !a.neighbors && (a.neighbors = []);
      !b.neighbors && (b.neighbors = []);
      a.neighbors.push(b);
      b.neighbors.push(a);

      !a.links && (a.links = []);
      !b.links && (b.links = []);
      a.links.push(link);
      b.links.push(link);
    });

    return gData;
  }, []);
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = node => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node);
      node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      node.links.forEach(link => highlightLinks.add(link));
    }

    setHoverNode(node || null);
    updateHighlight();
  };

  const handleLinkHover = link => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  const paintRing = useCallback((node, ctx) => {
    // add ring just for highlighted nodes
    ctx.beginPath();
    ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
    ctx.fillStyle = node === hoverNode ? 'red' : 'orange';
    ctx.fill();
  }, [hoverNode]);
  return (
    <ForceGraph2D
      graphData={data}
      nodeLabel="name"
      nodeRelSize={NODE_R}
      linkWidth={link => highlightLinks.has(link) ? 5 : 1}
      linkDirectionalParticles={4}
      linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 4 : 0}
      nodeCanvasObjectMode={node => highlightNodes.has(node) ? 'before' : undefined}
      nodeCanvasObject={paintRing}
      onNodeHover={handleNodeHover}
      onLinkHover={handleLinkHover}
    />
  );
}