/**
 * Detecta e remove ciclos em grafos direcionados
 * Usado para garantir que não há links circulares no Sankey
 */

/**
 * Detecta se há um ciclo começando de um nó específico
 */
function hasCycleFromNode(node, graph, visited = new Set(), recStack = new Set()) {
  visited.add(node);
  recStack.add(node);

  const neighbors = graph.get(node) || [];

  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      if (hasCycleFromNode(neighbor, graph, visited, recStack)) {
        return true;
      }
    } else if (recStack.has(neighbor)) {
      // Encontrou um ciclo
      return true;
    }
  }

  recStack.delete(node);
  return false;
}

/**
 * Detecta todos os ciclos no grafo
 */
export function detectCycles(links) {
  // Constrói grafo de adjacência
  const graph = new Map();
  const allNodes = new Set();

  links.forEach(link => {
    const { source, target } = link;
    allNodes.add(source);
    allNodes.add(target);

    if (!graph.has(source)) {
      graph.set(source, []);
    }
    graph.get(source).push(target);
  });

  // Procura ciclos
  const visited = new Set();
  const cycles = [];

  for (const node of allNodes) {
    if (!visited.has(node)) {
      const recStack = new Set();
      if (hasCycleFromNode(node, graph, visited, recStack)) {
        cycles.push(Array.from(recStack));
      }
    }
  }

  return cycles;
}

/**
 * Remove links que causam ciclos, mantendo a estrutura mais forte
 */
export function removeCyclicLinks(links) {
  console.log('🔍 Verificando ciclos em', links.length, 'links');

  // Primeiro, remove auto-loops óbvios
  let cleanLinks = links.filter(link => {
    if (link.source === link.target) {
      console.warn('🔴 Auto-loop removido:', link.source, '→', link.target);
      return false;
    }
    return true;
  });

  // Constrói grafo para detectar ciclos mais complexos
  const linkMap = new Map();
  cleanLinks.forEach((link, index) => {
    linkMap.set(`${link.source}→${link.target}`, { link, index });
  });

  // Tenta detectar ciclos simples A→B→A
  const nodePairs = new Map();
  const linksToRemove = new Set();

  cleanLinks.forEach((link, index) => {
    const forward = `${link.source}→${link.target}`;
    const backward = `${link.target}→${link.source}`;

    if (nodePairs.has(backward)) {
      // Encontrou ciclo A→B e B→A
      console.warn('🔴 Ciclo detectado:', link.source, '⇄', link.target);

      // Remove o link com menor valor (menos importante)
      const backwardIndex = nodePairs.get(backward);
      const backwardLink = cleanLinks[backwardIndex];

      if (link.value < backwardLink.value) {
        linksToRemove.add(index);
        console.warn('  → Removendo:', link.source, '→', link.target, `(value: ${link.value})`);
      } else {
        linksToRemove.add(backwardIndex);
        console.warn('  → Removendo:', backwardLink.source, '→', backwardLink.target, `(value: ${backwardLink.value})`);
      }
    }

    nodePairs.set(forward, index);
  });

  // Remove links marcados
  cleanLinks = cleanLinks.filter((_, index) => !linksToRemove.has(index));

  console.log('✅ Links limpos:', cleanLinks.length, '(removidos:', links.length - cleanLinks.length, ')');

  return cleanLinks;
}

/**
 * Valida se o grafo é um DAG (Directed Acyclic Graph)
 */
export function isDAG(links) {
  const cycles = detectCycles(links);
  return cycles.length === 0;
}
