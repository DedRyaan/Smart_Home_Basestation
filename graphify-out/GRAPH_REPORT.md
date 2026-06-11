# Graph Report - .  (2026-06-11)

## Corpus Check
- 7 files · ~4,335 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 18 nodes · 20 edges · 7 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]

## God Nodes (most connected - your core abstractions)
1. `connectToPairedNode()` - 6 edges
2. `sendLog()` - 4 edges
3. `sendStateUpdate()` - 4 edges
4. `initMatter()` - 4 edges
5. `mapNodeAttributes()` - 4 edges
6. `subscribeNodeAttributes()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.57
Nodes (8): main.js, connectToPairedNode(), createWindow(), initMatter(), mapNodeAttributes(), sendLog(), sendStateUpdate(), subscribeNodeAttributes()

### Community 1 - "Community 1"
Cohesion: 1.0
Nodes (2): App(), App.jsx

### Community 2 - "Community 2"
Cohesion: 1.0
Nodes (2): CircularSlider(), CircularSlider.jsx

### Community 3 - "Community 3"
Cohesion: 1.0
Nodes (2): Commissioning(), Commissioning.jsx

### Community 4 - "Community 4"
Cohesion: 1.0
Nodes (2): Dashboard(), Dashboard.jsx

### Community 5 - "Community 5"
Cohesion: 1.0
Nodes (1): vite.config.js

### Community 6 - "Community 6"
Cohesion: 1.0
Nodes (1): main.jsx

## Knowledge Gaps
- **Thin community `Community 1`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 2`** (2 nodes): `CircularSlider()`, `CircularSlider.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (2 nodes): `Commissioning()`, `Commissioning.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 4`** (2 nodes): `Dashboard()`, `Dashboard.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 5`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 6`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._