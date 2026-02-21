/**
 * 25 — DIME Horizon — Site Gateway
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON25'] = {
  id: 'CON25',
  title: 'CON25 \u2014 Horizon Gateway',
  file: 'content/CON25-horizon-gateway.md',
  hotspots: [
    {
      id: 'pull-based',
      startLine: 20, startCol: 3, endLine: 49, endCol: 90,
      label: 'Pull-Based Architecture',
      panel: {
        title: 'Pull-Based Architecture \u2014 No Inbound Firewall Rules',
        body:
          '<p>Horizon always initiates communication <strong>outward</strong> to Zenith. Zenith never reaches into the factory network.</p>' +
          '<ul>' +
          '<li><strong>No inbound firewall rules</strong> \u2014 IT/OT security teams love this. Zero ports to open on the factory side.</li>' +
          '<li><strong>HTTPS only</strong> \u2014 All communication uses standard outbound HTTPS, which is already permitted in most corporate firewalls.</li>' +
          '<li><strong>Responses inline</strong> \u2014 Zenith returns pending tasks in the HTTP response to the check-in POST. No callback, no webhook, no open port.</li>' +
          '</ul>' +
          '<p>This pull-based model means you can deploy Horizon behind the strictest firewalls without any network changes. Horizon calls Zenith on a timer; Zenith never initiates a connection to Horizon.</p>',
        related: [
          { page: 'CON26', label: 'CON26 \u2014 Zenith Cloud' },
          { page: 'CON28', label: 'CON28 \u2014 Edge to Cloud' },
          { page: 'CON02', label: 'CON02 \u2014 The DIME Ecosystem' }
        ]
      }
    },
    {
      id: 'config',
      startLine: 53, startCol: 3, endLine: 75, endCol: 90,
      label: 'Horizon Configuration',
      panel: {
        title: 'Horizon Configuration \u2014 YAML',
        body:
          '<p>Horizon is configured with a simple YAML file that defines two sections:</p>' +
          '<ul>' +
          '<li><strong>zenith</strong> \u2014 The Zenith server URI, a unique authentication key (GUID), and the check-in interval in milliseconds.</li>' +
          '<li><strong>connector</strong> \u2014 A list of local DIME Connector instances, each identified by a friendly <code>id</code>, an <code>admin_http_uri</code> (REST API), and an <code>admin_ws_uri</code> (WebSocket).</li>' +
          '</ul>' +
          '<p>Multiple DIME instances on the same machine use different port pairs (e.g., 9999/9998, 9997/9996). Horizon discovers each instance through its Admin API address.</p>',
        yaml:
          'zenith:\n' +
          '  uri: https://zenith.example.com\n' +
          '  key: c1041c3a-a114-40c6-9c01-ee8e3b83596a\n' +
          '  checkin_interval: !!int 10000\n' +
          '\n' +
          'connector:\n' +
          '  - id: plc_collector\n' +
          '    admin_http_uri: http://localhost:9999\n' +
          '    admin_ws_uri: ws://localhost:9998',
        related: [
          { page: 'CON26', label: 'CON26 \u2014 Zenith Cloud' },
          { page: 'CON22', label: 'CON22 \u2014 Instance Chaining' },
          { page: 'CON02', label: 'CON02 \u2014 The DIME Ecosystem' }
        ]
      }
    },
    {
      id: 'checkin',
      startLine: 79, startCol: 3, endLine: 105, endCol: 90,
      label: 'Check-In Cycle',
      panel: {
        title: 'Check-In Cycle \u2014 5 Steps',
        body:
          '<p>Every <code>checkin_interval</code> milliseconds, Horizon executes this cycle:</p>' +
          '<ol>' +
          '<li><strong>Contact Zenith</strong> \u2014 Horizon sends a POST request to <code>/horizon/{key}/checkin</code></li>' +
          '<li><strong>Send Status</strong> \u2014 The request body includes a summary of all local connector health: connection state, fault info, metrics, and current data</li>' +
          '<li><strong>Receive Tasks</strong> \u2014 Zenith responds with a list of pending tasks queued for this Horizon (e.g., get config, push config, restart)</li>' +
          '<li><strong>Execute Locally</strong> \u2014 Horizon executes each task by calling the target Connector\'s Admin REST API on localhost</li>' +
          '<li><strong>Report Results</strong> \u2014 Horizon posts each task result back to Zenith via <code>POST /horizon/{key}/task/{id}</code></li>' +
          '</ol>' +
          '<p>If a check-in is missed (network outage, Zenith maintenance), the next successful check-in picks up all queued tasks. Nothing is lost.</p>',
        related: [
          { page: 'CON26', label: 'CON26 \u2014 Zenith Cloud' },
          { page: 'CON25', hotspot: 'tasks', label: 'Supported task types' },
          { page: 'CON16', label: 'CON16 \u2014 Admin REST API' }
        ]
      }
    },
    {
      id: 'tasks',
      startLine: 111, startCol: 3, endLine: 148, endCol: 90,
      label: 'Supported Tasks',
      panel: {
        title: 'Supported Task Types',
        body:
          '<p>Zenith queues tasks for Horizon to execute. Two categories:</p>' +
          '<p><strong>Connector Tasks</strong> (executed via the Connector\'s Admin REST API):</p>' +
          '<ul>' +
          '<li><strong>get_connector_status</strong> \u2014 Retrieve health, metrics, and fault information</li>' +
          '<li><strong>get_connector_config</strong> \u2014 Retrieve the current running YAML configuration</li>' +
          '<li><strong>set_connector_config</strong> \u2014 Push a new YAML configuration (triggers hot reload)</li>' +
          '<li><strong>restart_connector</strong> \u2014 Restart the DIME Connector service</li>' +
          '<li><strong>get_connector_data</strong> \u2014 Retrieve a snapshot of current data values</li>' +
          '</ul>' +
          '<p><strong>Horizon Self-Management Tasks:</strong></p>' +
          '<ul>' +
          '<li><strong>get_horizon_config</strong> \u2014 Retrieve Horizon\'s own YAML configuration</li>' +
          '<li><strong>set_horizon_config</strong> \u2014 Update Horizon\'s configuration remotely</li>' +
          '<li><strong>restart_horizon</strong> \u2014 Restart the Horizon gateway service itself</li>' +
          '</ul>',
        related: [
          { page: 'CON26', label: 'CON26 \u2014 Zenith Cloud' },
          { page: 'CON25', hotspot: 'checkin', label: 'Check-in cycle' },
          { page: 'CON16', label: 'CON16 \u2014 Admin REST API' }
        ]
      }
    },
    {
      id: 'deployment',
      startLine: 152, startCol: 3, endLine: 170, endCol: 90,
      label: 'Deployment Options',
      panel: {
        title: 'Horizon Deployment Options',
        body:
          '<p>Horizon can be deployed on the same platforms as DIME Connector:</p>' +
          '<ul>' +
          '<li><strong>Windows Service</strong> \u2014 Install with <code>Horizon.exe install</code>, manage with <code>net start/stop</code>. Runs alongside DIME Connectors on the same machine.</li>' +
          '<li><strong>Linux systemd</strong> \u2014 Install via the provided script, manage with <code>systemctl start/stop horizon</code>. Ideal for headless gateway appliances.</li>' +
          '<li><strong>Docker Container</strong> \u2014 Run with <code>docker run</code> and mount the config directory as a volume. Works with Docker Compose alongside DIME containers.</li>' +
          '</ul>' +
          '<p>Horizon requires only two types of network access: outbound HTTPS to Zenith, and local HTTP to each Connector\'s Admin API (typically localhost).</p>',
        related: [
          { page: 'CON23', label: 'CON23 \u2014 Service Deployment' },
          { page: 'CON24', label: 'CON24 \u2014 Docker Deployment' },
          { page: 'CON28', label: 'CON28 \u2014 Edge to Cloud' }
        ]
      }
    }
  ]
};
