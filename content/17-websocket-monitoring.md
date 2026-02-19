```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        17 — WebSocket Monitoring                      │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Real-time data streaming.                      │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Build live dashboards.                         │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   ADMIN WEBSOCKET — BUILT-IN MONITORING STREAM                                                   │
│   ─────────────────────────────────────────────                                                  │
│                                                                                                  │
│   Every DIME instance streams live telemetry over WebSocket. Always on. No config.               │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Default endpoint:    ws://localhost:9998/                                              │   │
│   │                                                                                          │   │
│   │   What streams over this WebSocket:                                                      │   │
│   │                                                                                          │   │
│   │     ┌─────────────────────────────────────────────────────────────────────────────┐      │   │
│   │     │                                                                             │      │   │
│   │     │   Connector status    ── isConnected, isFaulted changes in real time        │      │   │
│   │     │   Performance metrics ── totalLoopTime, deviceReadTime, scriptExecTime      │      │   │
│   │     │   Fault notifications ── immediate alert when a connector errors            │      │   │
│   │     │   Live data values    ── current values flowing through ring buffer         │      │   │
│   │     │   $SYSTEM paths       ── all $SYSTEM metadata for every connector           │      │   │
│   │     │                                                                             │      │   │
│   │     └─────────────────────────────────────────────────────────────────────────────┘      │   │
│   │                                                                                          │   │
│   │   ┌─────────────┐         ┌──────────────┐         ┌──────────────────────────┐         │    │
│   │   │             │  data   │              │   WS    │                          │         │    │
│   │   │   Sources   │───────▶ │  Ring Buffer │───────▶ │   Admin WS :9998         │         │    │
│   │   │             │         │              │         │                          │         │    │
│   │   └─────────────┘         └──────────────┘         │   ┌───────────────────┐  │         │    │
│   │                                                     │   │ Connected clients │  │         │   │
│   │                                                     │   │   Browser         │  │         │   │
│   │                                                     │   │   Dashboard       │  │         │   │
│   │                                                     │   │   Monitoring app  │  │         │   │
│   │                                                     │   └───────────────────┘  │         │   │
│   │                                                     └──────────────────────────┘         │   │
│   │                                                                                          │   │
│   │   This is how DIME-Connector.UX (the built-in web dashboard) gets live data.             │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   WEBSOCKET SERVER SINK — PUSH DATA TO EXTERNAL CONSUMERS                                        │
│   ────────────────────────────────────────────────────────                                       │
│                                                                                                  │
│   A sink connector that opens a WebSocket server. External clients connect and                   │
│   receive live data filtered by include/exclude patterns.                                        │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   sinks:                                                                                 │   │
│   │     - name: live_feed                                                                    │   │
│   │       connector: WebSocketServer                                                         │   │
│   │       port: !!int 8092                                                                   │   │
│   │       include_filter:                                                                    │   │
│   │         - "plc1/.*"                                                                      │   │
│   │         - "robot1/.*"                                                                    │   │
│   │                                                                                          │   │
│   │   ┌──────────┐      ┌──────────────┐      ┌───────────────────┐      ┌────────────┐     │    │
│   │   │ plc1     │      │              │      │  WebSocketServer  │      │ External   │     │    │
│   │   │ robot1   │─────▶│  Ring Buffer │─────▶│  Sink :8092       │─────▶│ Clients    │     │    │
│   │   │ mqtt     │      │              │      │                   │      │            │     │    │
│   │   └──────────┘      └──────────────┘      │  Only plc1/* and  │      │ Dashboard  │     │    │
│   │                                            │  robot1/* pass    │      │ Mobile app │     │   │
│   │                                            └───────────────────┘      │ Custom UI  │     │   │
│   │                                                                       └────────────┘     │   │
│   │                                                                                          │   │
│   │   Unlike the admin WS (:9998), this is a configurable SINK — you choose the port,        │   │
│   │   the data filter, and can run multiple WebSocket servers on different ports.            │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   HTTP SERVER SINK — SERVE STATIC FILES                                                          │
│   ──────────────────────────────────────                                                         │
│                                                                                                  │
│   Host HTML, CSS, JS files directly from DIME. No separate web server needed.                    │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   sinks:                                                                                 │   │
│   │     - name: web_ui                                                                       │   │
│   │       connector: HttpServer                                                              │   │
│   │       port: !!int 8080                                                                   │   │
│   │       path: ./www                              ◀── folder with your HTML/CSS/JS          │   │
│   │                                                                                          │   │
│   │   ┌──────────────────────┐                                                               │   │
│   │   │  ./www/              │          ┌───────────────────────────────────────┐             │  │
│   │   │  ├── index.html      │          │                                       │             │  │
│   │   │  ├── style.css       │────────▶ │   HttpServer Sink :8080               │             │  │
│   │   │  ├── app.js          │          │                                       │             │  │
│   │   │  └── chart.js        │          │   Serves static files at              │             │  │
│   │   │                      │          │   http://localhost:8080/              │             │  │
│   │   └──────────────────────┘          └───────────────────────────────────────┘             │  │
│   │                                                                                          │   │
│   │   Your dashboard HTML/JS files connect to a WebSocket sink for live data.                │   │
│   │   The HttpServer sink serves those files — everything runs from DIME.                    │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   BUILDING A LIVE DASHBOARD                                                                      │
│   ──────────────────────────                                                                     │
│                                                                                                  │
│   Connect your web app to a WebSocket Server sink for live charts and gauges.                    │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   Browser JavaScript:                                                                    │   │
│   │                                                                                          │   │
│   │   ┌────────────────────────────────────────────────────────────────────────────────┐     │   │
│   │   │                                                                                │     │   │
│   │   │   const ws = new WebSocket("ws://localhost:8092");                             │     │   │
│   │   │                                                                                │     │   │
│   │   │   ws.onmessage = (event) => {                                                  │     │   │
│   │   │     const msg = JSON.parse(event.data);                                        │     │   │
│   │   │                                                                                │     │   │
│   │   │     // msg.path  = "plc1/temperature"                                          │     │   │
│   │   │     // msg.data  = 72.5                                                        │     │   │
│   │   │     // msg.timestamp = 1708300800000                                           │     │   │
│   │   │                                                                                │     │   │
│   │   │     updateGauge(msg.path, msg.data);                                           │     │   │
│   │   │     updateChart(msg.path, msg.data, msg.timestamp);                            │     │   │
│   │   │   };                                                                           │     │   │
│   │   │                                                                                │     │   │
│   │   └────────────────────────────────────────────────────────────────────────────────┘     │   │
│   │                                                                                          │   │
│   │   ┌─────────────────────────── Browser Dashboard ──────────────────────────────┐        │    │
│   │   │                                                                            │        │    │
│   │   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │        │     │
│   │   │   │ Temperature  │  │ Pressure     │  │ Cycle Time   │  │ Fault Count  │  │        │     │
│   │   │   │              │  │              │  │              │  │              │  │        │     │
│   │   │   │    72.5 F    │  │   34.2 psi   │  │    23 ms     │  │      0       │  │        │     │
│   │   │   │   ┌──────┐   │  │   ┌──────┐   │  │   ┌──────┐   │  │   ┌──────┐   │  │        │     │
│   │   │   │   │ ▓▓▓░ │   │  │   │ ▓▓░░ │   │  │   │ ▓░░░ │   │  │   │ ░░░░ │   │  │        │     │
│   │   │   │   └──────┘   │  │   └──────┘   │  │   └──────┘   │  │   └──────┘   │  │        │     │
│   │   │   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │        │     │
│   │   │                                                                            │        │    │
│   │   │   ┌────────────────────────────────────────────────────────────────────┐   │        │    │
│   │   │   │  Live Trend  ╱╲    ╱╲                                              │   │        │    │
│   │   │   │            ╱╱  ╲╱╱  ╲╲     ╱╲                                      │   │        │    │
│   │   │   │          ╱╱          ╲╲  ╱╱  ╲╲                                    │   │        │    │
│   │   │   │        ╱╱              ╲╱      ╲───                                │   │        │    │
│   │   │   └────────────────────────────────────────────────────────────────────┘   │        │    │
│   │   │                                                                            │        │    │
│   │   └────────────────────────────────────────────────────────────────────────────┘        │    │
│   │                                                                                          │   │
│   │   Every message arrives as JSON with path, data, and timestamp.                          │   │
│   │   Route by path to update the correct gauge or chart.                                    │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SELF-CONTAINED DASHBOARD — HTTP + WEBSOCKET                                                    │
│   ────────────────────────────────────────────                                                   │
│                                                                                                  │
│   Combine HttpServer (static files) + WebSocketServer (live data) for a complete                 │
│   dashboard with zero external dependencies. Everything runs inside DIME.                        │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                                                                          │   │
│   │   sinks:                                                                                 │   │
│   │     - name: web_ui                              - name: live_feed                        │   │
│   │       connector: HttpServer                       connector: WebSocketServer             │   │
│   │       port: !!int 8080                            port: !!int 8092                       │   │
│   │       path: ./www                                 include_filter:                        │   │
│   │                                                     - "plc1/.*"                          │   │
│   │                                                                                          │   │
│   │                        ┌─────────────────────────────────────────────┐                   │   │
│   │                        │            DIME Instance                    │                   │   │
│   │                        │                                             │                   │   │
│   │   ┌──────────┐  data   │  ┌────────────┐    ┌────────────────────┐   │                   │   │
│   │   │  Sources │────────▶│  │ Ring       │───▶│ WebSocketServer    │   │                   │   │
│   │   │  plc1    │         │  │ Buffer     │    │ :8092 (live data)  │   │                   │   │
│   │   │  mqtt    │         │  └────────────┘    └─────────┬──────────┘   │                   │   │
│   │   └──────────┘         │                              │  ws://       │                   │   │
│   │                        │  ┌────────────────────┐      │              │                   │   │
│   │                        │  │ HttpServer         │      │              │                   │   │
│   │                        │  │ :8080 (static)     │      │              │                   │   │
│   │                        │  │ ./www/index.html   │      │              │                   │   │
│   │                        │  └─────────┬──────────┘      │              │                   │   │
│   │                        │            │  http://        │              │                   │   │
│   │                        └────────────┼─────────────────┼──────────────┘                   │   │
│   │                                     │                 │                                   │  │
│   │                                     ▼                 ▼                                   │  │
│   │                        ┌────────────────────────────────────────────┐                    │   │
│   │                        │              Browser                       │                    │   │
│   │                        │                                            │                    │   │
│   │                        │  http://localhost:8080  ── loads HTML/JS   │                    │   │
│   │                        │  ws://localhost:8092    ── receives data   │                    │   │
│   │                        │                                            │                    │   │
│   │                        │  Complete dashboard. No nginx. No node.    │                    │   │
│   │                        │  Just DIME + a folder of HTML files.       │                    │   │
│   │                        └────────────────────────────────────────────┘                    │   │
│   │                                                                                          │   │
│   └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                  │
│   Open http://localhost:8080 in a browser. The page loads from HttpServer,                       │
│   connects to WebSocketServer, and you have a live dashboard — nothing else needed.              │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
