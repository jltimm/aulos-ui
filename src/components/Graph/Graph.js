import React, { useState, useCallback, useMemo } from "react";
import artistsData from "../../data/data.json"
import ForceGraph2D from 'react-force-graph-2d';

const createNodesAndEdges = () => {
  var nodes = []
  var links = []
  artistsData.all_artists.forEach(item => {
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
  const [fromSearchTerm, setFromSearchTerm] = useState( { searchTerm: '', isValid: false } );
  const [toSearchTerm, setToSearchTerm] = useState( { searchTerm: '', isValid: false } );

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
    } else {
      console.log("Hover leave")
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
    ctx.fillStyle =
      (node === hoverNode
        || fromSearchTerm.searchTerm.toLowerCase() === node.name.toLowerCase()
        || toSearchTerm.searchTerm.toLowerCase() === node.name.toLowerCase()) ? 'red' : 'orange';
    ctx.fillText(node.name, node.x + 6, node.y)
    ctx.fill();
  }, [hoverNode, fromSearchTerm, toSearchTerm]);

  const handleFromSearch = (e) => {
    const searchTerm = e.target.value
    const searchNode = data.nodes.filter(node => node.name.toLowerCase() === searchTerm.toLowerCase())
    if (searchNode.length !== 0) {
      setFromSearchTerm( { searchTerm: searchTerm, isValid: true })
      highlightLinks.clear();
      let nodesToRemove = new Set()
      highlightNodes.forEach(node => {
        if (node.name.toLowerCase() !== toSearchTerm.searchTerm.toLowerCase()) {
          nodesToRemove.add(node);
        }
      })
      nodesToRemove.forEach(node => {
        highlightNodes.delete(node)
      })
      highlightNodes.add(searchNode[0])
      if (toSearchTerm.isValid) {
        getShortestPath(toSearchTerm.searchTerm, searchNode[0].name)
      }
      updateHighlight()
    } else {
      setFromSearchTerm( { searchTerm: searchTerm, isValid: false } )
    }
  }

  const getShortestPath = (from, to) => {
    const fromId = data.nodes.filter(node => node.name.toLowerCase() === from.toLowerCase())[0].id
    const toId = data.nodes.filter(node => node.name.toLowerCase() === to.toLowerCase())[0].id
    const fromIndex = artistsData.index_id_map.filter(it => it.id === fromId)[0].index
    const toIndex = artistsData.index_id_map.filter(it => it.id === toId)[0].index
    const indexPath = getPath(fromIndex, toIndex, [])
    highlightNodes.clear()
    highlightLinks.clear()
    var previousNode = null
    indexPath.forEach(index => {
      const id = artistsData.index_id_map.filter(it => it.index === index)[0].id
      const pathNode = data.nodes.filter(node => node.id === id)[0]
      highlightNodes.add(pathNode)
      pathNode.links.forEach(link => {
        if (previousNode != null && link.target.id === previousNode.id) {
            highlightLinks.add(link)
        }
      });
      previousNode = pathNode
    })
  }

  const getPath = (i, j, path) => {
    if (i === j) {
      path.push(i)
      return path
    }
    path.push(j)
    path = getPath(i, artistsData.shortest_paths_matrix[i][j], path)
    return path
  }

  const handleToSearch = (e) => {
    const searchTerm = e.target.value
    setToSearchTerm( { searchTerm: searchTerm, isValid: false })
    const searchNode = data.nodes.filter(node => node.name.toLowerCase() === searchTerm.toLowerCase())
    if (searchNode.length !== 0) {
      setToSearchTerm( { searchTerm: searchTerm, isValid: true })
      highlightLinks.clear()
      let nodesToRemove = new Set()
      highlightNodes.forEach(node => {
        if (node.name.toLowerCase() !== fromSearchTerm.searchTerm.toLowerCase()) {
          nodesToRemove.add(node);
        }
      })
      nodesToRemove.forEach(node => {
        highlightNodes.delete(node)
      })
      highlightNodes.add(searchNode[0])
      if (fromSearchTerm.isValid) {
        getShortestPath(fromSearchTerm.searchTerm, searchNode[0].name)
      }
      updateHighlight()
    } else {
      setToSearchTerm( { searchTerm: searchTerm, isValid: false } )
    }
  }

  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <br></br>
        <input type='text' value={fromSearchTerm.searchTerm} onChange={handleFromSearch} placeholder='Search for a name!' />
        <br></br>
        <input type='text' value={toSearchTerm.searchTerm} onChange={handleToSearch} placeholder='Search for a name!' />
      </div>
      <ForceGraph2D
        graphData={data}
        nodeLabel={() => ''}
        nodeRelSize={NODE_R}
        linkWidth={link => highlightLinks.has(link) ? 5 : 1}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={link => highlightLinks.has(link) ? 4 : 0}
        nodeCanvasObjectMode={node => highlightNodes.has(node) ? 'before' : undefined}
        nodeCanvasObject={paintRing}
        onNodeHover={handleNodeHover}
        onLinkHover={handleLinkHover}
      />
    </div>
  );
}