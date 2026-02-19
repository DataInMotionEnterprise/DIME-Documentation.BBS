/**
 * 16 — Admin REST API
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['16'] = {
  id: '16',
  title: '16 \u2014 Admin REST API',
  file: 'content/16-admin-api.md',
  hotspots: [
    {
      id: 'status-endpoint',
      startLine: 57, startCol: 3, endLine: 89, endCol: 90,
      label: 'GET /status \u2014 Health & Metrics',
      panel: {
        title: 'GET /status \u2014 Full Instance Health',
        body:
          '<p>A single GET request returns the health and performance of <strong>every</strong> connector in the running instance \u2014 sources and sinks alike.</p>' +
          '<p>Key fields per connector:</p>' +
          '<ul>' +
          '<li><strong>isConnected</strong> \u2014 Is the connection to the device/destination alive?</li>' +
          '<li><strong>isFaulted</strong> \u2014 Is the connector in an error state?</li>' +
          '<li><strong>faultReason</strong> \u2014 The last error message (null if healthy)</li>' +
          '<li><strong>metrics.totalLoopTime</strong> \u2014 End-to-end cycle time in milliseconds</li>' +
          '<li><strong>metrics.deviceReadTime</strong> \u2014 How long the hardware took to respond</li>' +
          '<li><strong>metrics.scriptExecTime</strong> \u2014 Lua/Python transform time</li>' +
          '<li><strong>metrics.messagesAccepted</strong> \u2014 Cumulative messages processed</li>' +
          '<li><strong>metrics.faultCount</strong> \u2014 Cumulative fault count</li>' +
          '</ul>' +
          '<p>Use this for health checks, monitoring dashboards, or alerting systems.</p>',
        yaml:
          '$ curl http://localhost:9999/status\n\n' +
          '# Returns JSON with:\n' +
          '#   connectors[].name\n' +
          '#   connectors[].isConnected\n' +
          '#   connectors[].isFaulted\n' +
          '#   connectors[].faultReason\n' +
          '#   connectors[].metrics.totalLoopTime\n' +
          '#   connectors[].metrics.messagesAccepted',
        related: [
          { page: '17', hotspot: 'admin-ws', label: '17 \u2014 WebSocket live monitoring' },
          { page: '05', hotspot: 'admin-server', label: '05 \u2014 Admin server overview' }
        ]
      }
    },
    {
      id: 'config-endpoints',
      startLine: 93, startCol: 3, endLine: 119, endCol: 90,
      label: 'GET/POST /config/yaml \u2014 Configuration',
      panel: {
        title: 'Configuration Management via REST',
        body:
          '<p>Two endpoints for managing the running YAML configuration:</p>' +
          '<ul>' +
          '<li><strong>GET /config/yaml</strong> \u2014 Returns the full merged YAML currently driving the instance. Useful for debugging, backup, or auditing what is actually running.</li>' +
          '<li><strong>POST /config/yaml</strong> \u2014 Push a new YAML configuration. DIME will parse it, diff against the running config, and apply changes. Connectors are started or stopped as needed.</li>' +
          '</ul>' +
          '<p>This enables <strong>hot reload</strong> \u2014 change the entire configuration without restarting the service. Existing connections that have not changed remain untouched.</p>',
        related: [
          { page: '16', hotspot: 'hot-reconfig', label: '16 \u2014 Zero-downtime reconfiguration' },
          { page: '03', hotspot: 'verify', label: '03 \u2014 Verify installation' }
        ]
      }
    },
    {
      id: 'connector-control',
      startLine: 122, startCol: 3, endLine: 161, endCol: 90,
      label: 'Start / Stop / Add Connectors',
      panel: {
        title: 'Runtime Connector Management',
        body:
          '<p>Control individual connectors without affecting the rest of the instance:</p>' +
          '<ul>' +
          '<li><strong>POST /connector/stop/{name}</strong> \u2014 Gracefully disconnects and deinitializes the named connector. Other connectors are unaffected.</li>' +
          '<li><strong>POST /connector/start/{name}</strong> \u2014 Re-initializes and starts the named connector through the full lifecycle.</li>' +
          '<li><strong>POST /connector/add/source</strong> \u2014 Add a brand-new source connector at runtime. Pass the connector config as JSON.</li>' +
          '<li><strong>POST /connector/add/sink</strong> \u2014 Add a brand-new sink connector at runtime. It immediately begins receiving from the ring buffer.</li>' +
          '</ul>' +
          '<p>The stop/start cycle follows the standard connector lifecycle: Initialize \u2192 Create \u2192 Connect \u2192 Read/Write \u2192 Disconnect \u2192 Deinitialize.</p>',
        yaml:
          '# Stop a connector\n' +
          'curl -X POST http://localhost:9999/connector/stop/plc1\n\n' +
          '# Add a new sink at runtime\n' +
          'curl -X POST http://localhost:9999/connector/add/sink \\\n' +
          '  -H \'Content-Type: application/json\' \\\n' +
          '  -d \'{"name":"debug","connector":"Console"}\'',
        related: [
          { page: '05', hotspot: 'lifecycle', label: '05 \u2014 Connector lifecycle' },
          { page: '16', hotspot: 'hot-reconfig', label: '16 \u2014 Hot reconfiguration' }
        ]
      }
    },
    {
      id: 'swagger-ui',
      startLine: 164, startCol: 3, endLine: 204, endCol: 90,
      label: 'Swagger UI \u2014 Interactive Explorer',
      panel: {
        title: 'Swagger UI \u2014 Try It From the Browser',
        body:
          '<p>DIME includes a built-in <strong>Swagger UI</strong> at <code>/swagger</code> on the admin port.</p>' +
          '<p>Open <code>http://localhost:9999/swagger</code> in any browser to:</p>' +
          '<ul>' +
          '<li>Browse all available endpoints with descriptions</li>' +
          '<li>See request/response schemas and examples</li>' +
          '<li>Send real requests with the "Try it out" button</li>' +
          '<li>View responses inline \u2014 no curl or Postman needed</li>' +
          '</ul>' +
          '<p>Swagger is useful for exploring the API when you are getting started, for debugging, or for sharing the API surface with team members who prefer a visual tool.</p>',
        related: [
          { page: '16', hotspot: 'status-endpoint', label: '16 \u2014 GET /status details' },
          { page: '16', hotspot: 'connector-control', label: '16 \u2014 Connector control endpoints' }
        ]
      }
    },
    {
      id: 'hot-reconfig',
      startLine: 207, startCol: 3, endLine: 244, endCol: 90,
      label: 'Hot Reconfiguration \u2014 Zero Downtime',
      panel: {
        title: 'Zero-Downtime Reconfiguration',
        body:
          '<p>Add, remove, or restart connectors <strong>without stopping the service</strong>:</p>' +
          '<ul>' +
          '<li><strong>POST /connector/add/sink</strong> \u2014 New sink starts receiving immediately from the ring buffer</li>' +
          '<li><strong>POST /connector/add/source</strong> \u2014 New source begins publishing to the ring buffer</li>' +
          '<li><strong>POST /config/yaml</strong> \u2014 Full config hot-reload: DIME diffs and applies only the changes</li>' +
          '<li><strong>POST /service/restart</strong> \u2014 Full restart if needed (last resort)</li>' +
          '</ul>' +
          '<p>Existing connectors are completely unaffected by additions. The ring buffer continues to operate. No messages are lost during reconfiguration.</p>' +
          '<p>This is how production deployments evolve: start with sources, then add sinks as new consumers come online \u2014 all without downtime.</p>',
        related: [
          { page: '17', hotspot: 'ws-sink', label: '17 \u2014 Add WebSocket sink at runtime' },
          { page: '18', hotspot: 'health-check', label: '18 \u2014 Health checks' },
          { page: '05', hotspot: 'admin-server', label: '05 \u2014 Admin server overview' },
          { page: '03', hotspot: 'verify', label: '03 \u2014 Verify installation' }
        ]
      }
    }
  ]
};
