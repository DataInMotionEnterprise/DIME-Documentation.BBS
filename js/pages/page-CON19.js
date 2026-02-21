/**
 * 19 — Connector UX
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON19'] = {
  id: 'CON19',
  title: 'CON19 \u2014 Connector UX',
  file: 'content/CON19-connector-ux.md',
  hotspots: [
    {
      id: 'multi-instance',
      startLine: 39, startCol: 3, endLine: 72, endCol: 92,
      label: 'Multi-Instance Management',
      panel: {
        title: 'Multi-Instance Management',
        body:
          '<p>Connect to <strong>multiple DIME instances</strong> simultaneously from a single Connector UX window.</p>' +
          '<p>Each instance is reached via its Admin API endpoint. Add a new instance by entering its address (e.g., <code>http://10.0.0.50:9999</code>).</p>' +
          '<ul>' +
          '<li><strong>Tabbed interface</strong> \u2014 Switch between instances with one click</li>' +
          '<li><strong>Connection status</strong> \u2014 Green indicator for connected, hollow for disconnected</li>' +
          '<li><strong>Auto-reconnect</strong> \u2014 If a DIME instance goes offline, Connector UX will reconnect when it returns</li>' +
          '<li><strong>Instance grouping</strong> \u2014 Organize instances by location, environment, or function</li>' +
          '</ul>' +
          '<p>Typical setup: one Connector UX app managing production floor, QA, and development DIME instances side by side.</p>',
        related: [
          { page: 'CON16', label: 'CON16 \u2014 REST API' },
          { page: 'CON17', label: 'CON17 \u2014 WebSocket' },
          { page: 'CON19', hotspot: 'live-dashboard', label: 'CON19 \u2014 Live Dashboard' }
        ]
      }
    },
    {
      id: 'live-dashboard',
      startLine: 78, startCol: 3, endLine: 95, endCol: 32,
      label: 'Live Dashboard',
      panel: {
        title: 'Live Dashboard \u2014 Real-Time Health Cards',
        body:
          '<p>The dashboard shows a <strong>real-time status card</strong> for every connector in the selected DIME instance.</p>' +
          '<p>Each card displays:</p>' +
          '<ul>' +
          '<li><strong>Connection state</strong> \u2014 Connected, Faulted, or Disconnected with color-coded indicators</li>' +
          '<li><strong>Read time</strong> \u2014 Last device read time in milliseconds</li>' +
          '<li><strong>Loop time</strong> \u2014 Total loop cycle time</li>' +
          '<li><strong>Fault count</strong> \u2014 Cumulative faults since startup</li>' +
          '<li><strong>Throughput</strong> \u2014 Messages per second, attempted vs accepted</li>' +
          '</ul>' +
          '<p>Cards update in real time via the WebSocket stream (port 9998). No polling, no refresh button \u2014 changes appear instantly.</p>' +
          '<p>Click any card to drill into detailed metrics and event history for that connector.</p>',
        related: [
          { page: 'CON18', label: 'CON18 \u2014 Health & Faults' },
          { page: 'CON18', hotspot: 'metrics', label: 'CON18 \u2014 Performance metrics' },
          { page: 'CON17', label: 'CON17 \u2014 WebSocket' }
        ]
      }
    },
    {
      id: 'yaml-editor',
      startLine: 78, startCol: 33, endLine: 95, endCol: 63,
      label: 'Monaco YAML Editor',
      panel: {
        title: 'Configuration Editor \u2014 Monaco YAML',
        body:
          '<p>Full-featured YAML editor powered by <strong>Monaco</strong> (the same editor engine as VS Code).</p>' +
          '<ul>' +
          '<li><strong>Syntax highlighting</strong> \u2014 Color-coded YAML with proper indentation guides</li>' +
          '<li><strong>Inline validation</strong> \u2014 Errors highlighted as you type, validated against the DIME config JSON schema</li>' +
          '<li><strong>Auto-complete</strong> \u2014 Suggestions for connector types, property names, and enum values from the schema</li>' +
          '<li><strong>Schema tooltips</strong> \u2014 Hover over any field to see its type, default value, and description</li>' +
          '<li><strong>Push to instance</strong> \u2014 Apply configuration changes to a running DIME instance via the REST API</li>' +
          '</ul>' +
          '<p>The schema browser panel works alongside the editor, letting you explore every available configuration option interactively.</p>',
        related: [
          { page: 'CON16', label: 'CON16 \u2014 REST API (config endpoints)' },
          { page: 'CON27', label: 'CON27 \u2014 Zenith UX' },
          { page: 'CON18', hotspot: 'system-msgs', label: 'CON18 \u2014 $SYSTEM messages' }
        ]
      }
    },
    {
      id: 'data-stream',
      startLine: 97, startCol: 3, endLine: 114, endCol: 32,
      label: 'Live Data Stream',
      panel: {
        title: 'Live Data Stream \u2014 Real-Time Message Viewer',
        body:
          '<p>Watch messages flowing through the ring buffer in <strong>real time</strong>.</p>' +
          '<ul>' +
          '<li><strong>Path column</strong> \u2014 Full message path (source/item)</li>' +
          '<li><strong>Value column</strong> \u2014 Current value with type-aware formatting</li>' +
          '<li><strong>Timestamp column</strong> \u2014 When the value was read from the device</li>' +
          '</ul>' +
          '<p>Features:</p>' +
          '<ul>' +
          '<li><strong>Path filtering</strong> \u2014 Subscribe to specific paths or patterns</li>' +
          '<li><strong>Pause/resume</strong> \u2014 Freeze the stream to inspect values</li>' +
          '<li><strong>Value highlighting</strong> \u2014 Changed values flash to show updates</li>' +
          '<li><strong>Export</strong> \u2014 Capture a snapshot to CSV or JSON</li>' +
          '</ul>' +
          '<p>The data stream connects via WebSocket (port 9998) and receives every message published to the ring buffer, subject to any path filters you set.</p>',
        related: [
          { page: 'CON17', label: 'CON17 \u2014 WebSocket' },
          { page: 'CON18', hotspot: 'metrics', label: 'CON18 \u2014 Performance metrics' },
          { page: 'CON27', label: 'CON27 \u2014 Zenith UX' }
        ]
      }
    },
    {
      id: 'platforms',
      startLine: 17, startCol: 3, endLine: 35, endCol: 92,
      label: 'Platform Support',
      panel: {
        title: 'Cross-Platform via Tauri v2',
        body:
          '<p>Connector UX is built with <strong>Tauri v2</strong> and <strong>React</strong>, delivering native performance on every platform:</p>' +
          '<ul>' +
          '<li><strong>Windows</strong> \u2014 .msi installer, runs as a standard desktop app</li>' +
          '<li><strong>macOS</strong> \u2014 .dmg package, universal binary (Intel + Apple Silicon)</li>' +
          '<li><strong>Linux</strong> \u2014 .deb / .AppImage, supports X11 and Wayland</li>' +
          '<li><strong>Android</strong> \u2014 APK via Tauri v2 mobile support</li>' +
          '<li><strong>iOS</strong> \u2014 IPA via Tauri v2 mobile support</li>' +
          '</ul>' +
          '<p>Tauri v2 uses the OS native webview instead of bundling Chromium, resulting in:</p>' +
          '<ul>' +
          '<li>~5 MB installer (vs ~150 MB for Electron)</li>' +
          '<li>~30 MB RAM usage (vs ~300 MB for Electron)</li>' +
          '<li>Native look and feel on each platform</li>' +
          '</ul>',
        related: [
          { page: 'CON27', label: 'CON27 \u2014 Zenith UX' },
          { page: 'CON16', label: 'CON16 \u2014 REST API' },
          { page: 'CON18', label: 'CON18 \u2014 Health & Faults' }
        ]
      }
    }
  ]
};
