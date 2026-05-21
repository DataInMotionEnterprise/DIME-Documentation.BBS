/**
 * EX37 — Maximo Monitor
 * MTConnect Mazak data to IBM Maximo Monitor via the MaximoMonitor sink.
 */
DIME_PAGES['EX37'] = {
  id: 'EX37',
  title: 'EX37 — Maximo Monitor',
  file: 'content/EX37-maximo-monitor.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex37-overview',
      startLine: 6, startCol: 2, endLine: 13, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Maximo Monitor — Overview',
        body:
          '<p>Reads execution, e-stop and X/Y/Z axis data from an MTConnect agent and publishes it to an IBM Maximo Monitor (Watson IoT style) MQTT endpoint using the <code>MaximoMonitor</code> sink.</p>' +
          '<p>The sink builds the event payload itself: each scan cycle it merges newly received items into a running device snapshot and publishes a single flat JSON event. There is <strong>no Script connector</strong> — compare with EX16, which used a <code>dataFormatter</code> combiner to do the same job in Lua.</p>',
        related: [
          { page: 'REF43', label: 'REF43 — Maximo Monitor' },
          { page: 'REF20', label: 'REF20 — MTConnect Agent' },
          { page: 'EX16', label: 'EX16 — MTConnect Aggregation' }
        ]
      }
    },
    {
      id: 'ex37-source',
      startLine: 35, startCol: 2, endLine: 58, endCol: 85,
      label: 'MTConnect Agent Source',
      panel: {
        title: 'mazakSource — MTConnect Agent',
        body:
          '<p>The <code>MTConnectAgent</code> connector used as a source. With <code>itemized_read: true</code> each item is matched against the agent’s streaming data by its <code>address</code>.</p>' +
          '<p>Each item’s Lua script extracts the value from <code>result</code>, which is a 0-indexed list of observation values — so <code>result[0].Value</code> is correct (<code>result[1]</code> would be out of range).</p>' +
          '<p>String-state items (execution, estop, axis states) return the value directly; numeric items (loads, servo temps) wrap it in <code>tonumber()</code>.</p>',
        related: [
          { page: 'REF20', label: 'REF20 — MTConnect Agent' },
          { page: 'CON09', label: 'CON09 — Scripting' }
        ]
      }
    },
    {
      id: 'ex37-sink',
      startLine: 60, startCol: 2, endLine: 80, endCol: 85,
      label: 'MaximoMonitor Sink',
      panel: {
        title: 'maximoMonitorSink — Event Publishing',
        body:
          '<p>The <code>MaximoMonitor</code> sink owns the payload format and the IBM connection details:</p>' +
          '<ul>' +
          '<li><code>org_id</code> + <code>device_type</code> + <code>device_id</code> form the client id <code>d:{org}:{type}:{id}</code></li>' +
          '<li><code>auth_token</code> authenticates as user <code>use-token-auth</code></li>' +
          '<li><code>event_id</code> sets the publish topic <code>iot-2/evt/{event_id}/fmt/json</code></li>' +
          '<li><code>device</code> is emitted as the payload <code>device</code> field</li>' +
          '<li><code>include_filter</code> selects which source items become metrics</li>' +
          '</ul>' +
          '<p>Every <code>scan_interval</code> the sink emits one flat JSON event with <code>timestamp</code>, <code>device</code>, and one key per item.</p>',
        related: [
          { page: 'REF43', label: 'REF43 — Maximo Monitor' },
          { page: 'REF18', label: 'REF18 — MQTT' }
        ]
      }
    },
    {
      id: 'ex37-concepts',
      startLine: 107, startCol: 2, endLine: 128, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Per-Cycle Snapshot & No Script Connector',
        body:
          '<p><strong>Per-cycle snapshot</strong> — Items that did not change this cycle are retained from the previous cycle, so every event carries the full device state.</p>' +
          '<p><strong>No Script connector</strong> — The sink builds the payload itself, replacing the <code>dataFormatter</code> combiner pattern used in earlier examples.</p>' +
          '<p><strong>Client id composition</strong> — <code>org_id</code>, <code>device_type</code> and <code>device_id</code> assemble the IBM client id; <code>auth_token</code> supplies token authentication.</p>' +
          '<p><strong>Metric keys</strong> — Each source item name becomes one key in the payload; <code>timestamp</code> and <code>device</code> are added automatically.</p>',
        related: [
          { page: 'REF43', label: 'REF43 — Maximo Monitor' },
          { page: 'CON20', label: 'CON20 — Report By Exception' },
          { page: 'EX16', label: 'EX16 — MTConnect Aggregation' }
        ]
      }
    }
  ]
};
