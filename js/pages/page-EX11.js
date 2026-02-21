/**
 * EX11 — MQTT to WebSocket Bridge
 * Bridge MQTT topics to WebSocket clients with Lua JSON parsing.
 */
DIME_PAGES['EX11'] = {
  id: 'EX11',
  title: 'EX11 \u2014 MQTT to WebSocket Bridge',
  file: 'content/EX11-mqtt-to-websocket.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex11-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'MQTT to WebSocket Bridge \u2014 Overview',
        body:
          '<p>Bridge MQTT messages to WebSocket clients in real time. This is a common IoT pattern where factory-floor devices publish MQTT and browser dashboards consume WebSocket:</p>' +
          '<ul>' +
          '<li><strong>MQTT source</strong> \u2014 Subscribes to wildcard topics (<code>sharc/+/evt/#</code>) on a public broker</li>' +
          '<li><strong>Lua JSON parsing</strong> \u2014 <code>item_script</code> converts raw JSON payloads into structured objects using <code>from_json()</code></li>' +
          '<li><strong>WebSocket sink</strong> \u2014 Pushes parsed data to connected browser clients at <code>ws://127.0.0.1:8082</code></li>' +
          '<li><strong>Console sink</strong> \u2014 Debug output of incoming messages</li>' +
          '</ul>' +
          '<p>DIME acts as the protocol bridge: no custom code needed, just YAML configuration.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX12', label: 'EX12 \u2014 Secure MQTT (TLS)' },
          { page: 'REF18', label: 'REF18 \u2014 MQTT' },
          { page: 'REF39', label: 'REF39 \u2014 WebsocketServer' }
        ]
      }
    },
    {
      id: 'ex11-dataflow',
      startLine: 13, startCol: 2, endLine: 34, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'MQTT Broker \u2192 Ring Buffer \u2192 WebSocket + Console',
        body:
          '<p>Data flows from an MQTT broker to browser clients:</p>' +
          '<ul>' +
          '<li><strong>MQTT Source</strong> \u2014 Connects to <code>wss.sharc.tech:1883</code> and subscribes to <code>sharc/+/evt/#</code>. The <code>+</code> wildcard matches any single topic level (device ID), and <code>#</code> matches all remaining levels (event types).</li>' +
          '<li><strong>JSON Transform</strong> \u2014 The <code>item_script</code> runs <code>from_json(result)</code> on every incoming message, converting JSON strings to structured Lua tables.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Parsed objects enter the 4096-slot Disruptor buffer.</li>' +
          '<li><strong>WebSocket Server</strong> \u2014 Pushes updates to connected clients at <code>ws://127.0.0.1:8082</code>.</li>' +
          '<li><strong>Console</strong> \u2014 Prints messages to stdout for debugging.</li>' +
          '</ul>' +
          '<p>With <code>itemized_read: false</code>, the MQTT connector operates in queuing (event-driven) mode rather than polling.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors' }
        ]
      }
    },
    {
      id: 'ex11-config',
      startLine: 36, startCol: 2, endLine: 100, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File YAML \u2014 4 Files',
        body:
          '<p>Four files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>main.yaml</strong> \u2014 Wires the MQTT source to console and WebSocket sinks</li>' +
          '<li><strong>mqttSource1.yaml</strong> \u2014 MQTT source with wildcard subscription and JSON parsing</li>' +
          '<li><strong>consoleSink1.yaml</strong> \u2014 Simple console debug output</li>' +
          '<li><strong>wsServerSink.yaml</strong> \u2014 WebSocket server sink on port 8082</li>' +
          '</ul>' +
          '<p><strong>Key MQTT properties:</strong></p>' +
          '<ul>' +
          '<li><code>itemized_read: false</code> \u2014 Event-driven queuing mode for asynchronous MQTT messages</li>' +
          '<li><code>qos: 0</code> \u2014 At-most-once delivery (fire and forget)</li>' +
          '<li><code>item_script</code> \u2014 Shared transform applied to ALL items in the source (vs per-item <code>script</code>)</li>' +
          '<li><code>address: sharc/+/evt/#</code> \u2014 MQTT wildcard subscription pattern</li>' +
          '</ul>',
        related: [
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua)' }
        ]
      }
    },
    {
      id: 'ex11-keyconcepts',
      startLine: 101, startCol: 2, endLine: 125, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>MQTT Wildcards</strong> \u2014 The topic <code>sharc/+/evt/#</code> uses two MQTT wildcard types. <code>+</code> matches exactly one topic level (any device ID). <code>#</code> matches zero or more remaining levels. Together they subscribe to all events from all SHARC devices.</p>' +
          '<p><strong>itemized_read: false</strong> \u2014 Switches the MQTT connector to queuing mode. Messages arrive asynchronously from the broker and are queued internally. The <code>scan_interval</code> controls how often DIME drains the queue and publishes to the ring buffer.</p>' +
          '<p><strong>item_script vs script</strong> \u2014 <code>item_script</code> is defined at the source level and runs for ALL items (shared transform). Per-item <code>script</code> runs only for that specific item. Use <code>item_script</code> when all items need the same processing, like JSON parsing.</p>' +
          '<p><strong>JSON Parsing</strong> \u2014 The <code>init_script</code> loads the JSON library once with <code>json = require(\'json\')</code>. The <code>item_script</code> then calls <code>from_json(result)</code> on every message. The parsed Lua table becomes the item\u2019s value in the ring buffer.</p>' +
          '<p><strong>Protocol Bridge</strong> \u2014 MQTT (pub/sub) to WebSocket (push) is a fundamental IoT gateway pattern. DIME handles the protocol translation, JSON parsing, and fan-out to multiple consumers without any custom code.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua & Python)' },
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX12', label: 'EX12 \u2014 Secure MQTT (TLS)' }
        ]
      }
    }
  ]
};
