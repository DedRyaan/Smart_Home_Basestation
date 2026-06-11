# Smart Home Laptop Basestation

An Electron-based desktop basestation application designed to communicate with the ESP32-based Matter smart home device. It provides an intuitive, high-performance interface for local device monitoring, diagnostics, state synchronization, and remote commands (including IR-based AC control).

This basestation acts as the client controller/companion app to the firmware repository.

🔗 **Smart Home ESP32 Node Firmware Repository**: [Smart_Home](https://github.com/DedRyaan/Smart_Home)

## Features

- **Matter Protocol Integration**: Integrates `@project-chip/matter.js` for secure local session commissioning, pairing, and real-time attribute subscriptions.
- **Real-Time Control Panel**:
  - **Light Switches**: Monitor and toggle on/off state for physical lights.
  - **Fan Control**: Switch fan state on and off.
  - **Croma AC Control**: Adjust temperature, toggle power, and switch operating modes via IR transmitter commands.
- **Automatic State Recovery**: Stores and recovers device states seamlessly on reconnection or power cycles.
- **Dependency & Architecture Visualization**: Integrated with `graphify` to generate dependency graphs and static audit reports of the code structure.

## Tech Stack

- **Frontend**: Vite + React, Vanilla CSS for responsive and rich dark-mode aesthetics.
- **Backend/Desktop wrapper**: Electron.
- **Protocol Client**: `@project-chip/matter.js`.

## Setup & Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- The ESP32 Matter device commissioned and online on your local network.

### Installation

1. Clone the repository and navigate to the project root:
   ```bash
   git clone https://github.com/DedRyaan/Smart_Home_Basestation.git
   cd Smart_Home_Basestation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To run the application in development mode with hot-reloading for both Electron and Vite:

```bash
npm run electron:dev
```

This command launches the Vite frontend dev server and boots up the Electron window.

## Code Graph & Documentation

The codebase architecture, abstractions, and relationships can be inspected under the generated [graphify-out](./graphify-out) directory:
- [Graph Report](./graphify-out/GRAPH_REPORT.md): Visual overview of node/file communities and identified code blocks.
- [Graph Data](./graphify-out/graph.json): Full directed relationship mapping (calls, contains, etc.) of source components.
