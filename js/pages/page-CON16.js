/**
 * 16 — Admin REST API
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON16'] = {
  id: 'CON16',
  title: 'CON16 \u2014 Admin REST API',
  file: 'content/CON16-admin-api.md',
  hotspots: [
    {
      id: 'status-endpoint',
      startLine: 63, startCol: 3, endLine: 97, endCol: 90,
      label: 'GET /status \u2014 Health & Metrics',
      panel: {
        title: 'GET /status \u2014 Full Instance Health',
        body:
          '<p>A single GET request returns the health and performance of <strong>every</strong> connector in the running instance \u2014 sources and sinks alike.</p>' +
          '<p>Key fields per connector:</p>' +
          '<ul>' +
          '<li><strong>name</strong> \u2014 Connector name from YAML</li>' +
          '<li><strong>direction</strong> \u2014 Source or Sink</li>' +
          '<li><strong>connectorType</strong> \u2014 The connector type (e.g. OpcUa, Mqtt)</li>' +
          '<li><strong>isRunning</strong> \u2014 Is the connector timer active?</li>' +
          '<li><strong>isConnected</strong> \u2014 Is the connection to the device/destination alive?</li>' +
          '<li><strong>isFaulted</strong> \u2014 Is the connector in an error state?</li>' +
          '<li><strong>faultMessage</strong> \u2014 The last error message (empty if healthy)</li>' +
          '<li><strong>lastLoopMs</strong> \u2014 Last end-to-end cycle time in milliseconds</li>' +
          '<li><strong>lastReadMs</strong> \u2014 Last device read time in milliseconds</li>' +
          '<li><strong>lastScriptMs</strong> \u2014 Last Lua/Python transform time</li>' +
          '<li><strong>messagesAttempted / messagesAccepted</strong> \u2014 Total reads vs. those that passed RBE</li>' +
          '<li><strong>connectCount / faultCount</strong> \u2014 Cumulative connection and fault counts</li>' +
          '</ul>' +
          '<p>Use this for health checks, monitoring dashboards, or alerting systems.</p>',
        yaml:
          '$ curl http://localhost:9999/status\n\n' +
          '# Returns JSON with:\n' +
          '#   connectors.{name}.isConnected\n' +
          '#   connectors.{name}.isFaulted\n' +
          '#   connectors.{name}.faultMessage\n' +
          '#   connectors.{name}.lastLoopMs\n' +
          '#   connectors.{name}.messagesAccepted',
        related: [
          { page: 'CON17', hotspot: 'admin-ws', label: 'CON17 \u2014 WebSocket live monitoring' },
          { page: 'CON05', hotspot: 'admin-server', label: 'CON05 \u2014 Admin server overview' }
        ]
      }
    },
    {
      id: 'config-endpoints',
      startLine: 99, startCol: 3, endLine: 135, endCol: 90,
      label: 'Configuration Management',
      panel: {
        title: 'Configuration Management via REST',
        body:
          '<p>Multiple endpoints for managing configuration:</p>' +
          '<ul>' +
          '<li><strong>GET /config/yaml</strong> \u2014 Returns the runtime YAML configuration (includes any unsaved API changes).</li>' +
          '<li><strong>GET /config/json</strong> \u2014 Returns the same configuration as JSON.</li>' +
          '<li><strong>POST /config/yaml</strong> \u2014 Write a new YAML configuration to disk. Does NOT reload running connectors. Call <code>POST /config/reload</code> to apply changes.</li>' +
          '<li><strong>POST /config/reload</strong> \u2014 Reload configuration from disk and restart all connectors.</li>' +
          '<li><strong>POST /config/save</strong> \u2014 Persist the current runtime configuration to disk (after add/edit/delete operations).</li>' +
          '</ul>' +
          '<p>The write-then-reload pattern gives you a safety checkpoint: write config to disk, verify it looks correct, then reload.</p>',
        related: [
          { page: 'CON16', hotspot: 'hot-reconfig', label: 'CON16 \u2014 Zero-downtime reconfiguration' },
          { page: 'CON03', hotspot: 'verify', label: 'CON03 \u2014 Verify installation' }
        ]
      }
    },
    {
      id: 'connector-control',
      startLine: 140, startCol: 3, endLine: 184, endCol: 90,
      label: 'Start / Stop / Add / Edit / Delete',
      panel: {
        title: 'Runtime Connector Management',
        body:
          '<p>Control individual connectors without affecting the rest of the instance. All connector endpoints follow the pattern <code>/connector/{action}/{type}/{name}</code> where type is <code>source</code> or <code>sink</code>:</p>' +
          '<ul>' +
          '<li><strong>POST /connector/stop/{type}/{name}</strong> \u2014 Gracefully stops the named connector. Other connectors are unaffected.</li>' +
          '<li><strong>POST /connector/start/{type}/{name}</strong> \u2014 Starts the named connector.</li>' +
          '<li><strong>POST /connector/add/{type}/{name}</strong> \u2014 Add a brand-new connector at runtime. Pass the connector YAML config as the request body.</li>' +
          '<li><strong>POST /connector/edit/{type}/{name}</strong> \u2014 Edit an existing connector by replacing its configuration.</li>' +
          '<li><strong>POST /connector/delete/{type}/{name}</strong> \u2014 Delete a connector.</li>' +
          '</ul>' +
          '<p>After add/edit/delete, call <code>POST /config/save</code> to persist changes to disk.</p>' +
          '<p>The stop/start cycle follows the standard connector lifecycle: Initialize \u2192 Create \u2192 Connect \u2192 Read/Write \u2192 Disconnect \u2192 Deinitialize.</p>',
        yaml:
          '# Stop a source connector\n' +
          'curl -X POST http://localhost:9999/connector/stop/source/plc1\n\n' +
          '# Add a new sink at runtime (YAML body)\n' +
          'curl -X POST http://localhost:9999/connector/add/sink/debug \\\n' +
          '  -H \'Content-Type: text/plain\' \\\n' +
          '  -d \'connector: Console\'',
        related: [
          { page: 'CON05', hotspot: 'lifecycle', label: 'CON05 \u2014 Connector lifecycle' },
          { page: 'CON16', hotspot: 'hot-reconfig', label: 'CON16 \u2014 Hot reconfiguration' }
        ]
      }
    },
    {
      id: 'swagger-ui',
      startLine: 189, startCol: 3, endLine: 220, endCol: 90,
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
          { page: 'CON16', hotspot: 'status-endpoint', label: 'CON16 \u2014 GET /status details' },
          { page: 'CON16', hotspot: 'connector-control', label: 'CON16 \u2014 Connector control endpoints' }
        ]
      }
    },
    {
      id: 'hot-reconfig',
      startLine: 227, startCol: 3, endLine: 253, endCol: 90,
      label: 'Hot Reconfiguration \u2014 Zero Downtime',
      panel: {
        title: 'Zero-Downtime Reconfiguration',
        body:
          '<p>Add, remove, or restart connectors <strong>without stopping the service</strong>:</p>' +
          '<ul>' +
          '<li><strong>POST /connector/add/sink/{name}</strong> \u2014 New sink starts receiving immediately from the ring buffer</li>' +
          '<li><strong>POST /connector/add/source/{name}</strong> \u2014 New source begins publishing to the ring buffer</li>' +
          '<li><strong>POST /config/yaml</strong> + <strong>POST /config/reload</strong> \u2014 Write new config to disk, then reload to apply changes</li>' +
          '</ul>' +
          '<p>After adding or editing connectors via the API, call <code>POST /config/save</code> to persist changes to disk.</p>' +
          '<p>Existing connectors are completely unaffected by additions. The ring buffer continues to operate. No messages are lost during reconfiguration.</p>' +
          '<p>This is how production deployments evolve: start with sources, then add sinks as new consumers come online \u2014 all without downtime.</p>',
        related: [
          { page: 'CON17', hotspot: 'ws-sink', label: 'CON17 \u2014 Add WebSocket sink at runtime' },
          { page: 'CON18', hotspot: 'health-check', label: 'CON18 \u2014 Health checks' },
          { page: 'CON05', hotspot: 'admin-server', label: 'CON05 \u2014 Admin server overview' },
          { page: 'CON03', hotspot: 'verify', label: 'CON03 \u2014 Verify installation' }
        ]
      }
    }
  ]
};
