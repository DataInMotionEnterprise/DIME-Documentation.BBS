/**
 * 28 — Edge to Cloud: Three-Tier Architecture
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['28'] = {
  id: '28',
  title: '28 \u2014 Edge to Cloud',
  file: 'content/28-edge-to-cloud.md',
  hotspots: [
    {
      id: 'edge-tier',
      startLine: 59, startCol: 3, endLine: 82, endCol: 90,
      label: 'Tier 1 \u2014 Edge (DIME Connector)',
      panel: {
        title: 'Edge Tier \u2014 Factory Floor Data Collection',
        body:
          '<p><strong>DIME Connector</strong> runs directly on the factory floor, collecting data from machines via 50+ industrial protocols.</p>' +
          '<ul>' +
          '<li><strong>50+ Protocols</strong> \u2014 OPC-UA, Siemens S7, Modbus TCP, EtherNet/IP, FANUC, MQTT, SparkplugB, Beckhoff ADS, HTTP, SNMP, and many more</li>' +
          '<li><strong>Lua Normalization</strong> \u2014 Scripts reshape, filter, and enrich raw device data before forwarding</li>' +
          '<li><strong>Multiple Outputs</strong> \u2014 Forward data via MQTT, SHDR (MTConnect), HTTP, or any configured sink</li>' +
          '<li><strong>Cross-Platform</strong> \u2014 Runs on Windows, Linux, ARM64, and Docker containers</li>' +
          '<li><strong>Self-Contained</strong> \u2014 Each Connector is an independent data integration engine with its own ring buffer and admin API</li>' +
          '</ul>' +
          '<p>At enterprise scale: ~500 Connectors collecting ~50,000 data points across all sites.</p>',
        related: [
          { page: '02', hotspot: 'connector-tier', label: '02 \u2014 Connector overview' },
          { page: '05', hotspot: 'big-picture', label: '05 \u2014 Architecture deep dive' },
          { page: '22', label: '22 \u2014 Instance chaining' }
        ]
      }
    },
    {
      id: 'gateway-tier',
      startLine: 40, startCol: 3, endLine: 55, endCol: 90,
      label: 'Tier 2 \u2014 Gateway (DIME Horizon)',
      panel: {
        title: 'Gateway Tier \u2014 Site Management & Cloud Bridge',
        body:
          '<p><strong>DIME Horizon</strong> is the site-level gateway \u2014 one per factory, plant, or warehouse.</p>' +
          '<ul>' +
          '<li><strong>Connector Management</strong> \u2014 Manages all DIME Connectors at a single site (typically 10\u201350 per site)</li>' +
          '<li><strong>Pull-Based Bridge</strong> \u2014 Horizon initiates all communication to Zenith. No inbound firewall rules required. Works behind NAT and corporate firewalls.</li>' +
          '<li><strong>Remote Task Execution</strong> \u2014 Receives and executes tasks from Zenith: config updates, firmware deployments, start/stop commands</li>' +
          '<li><strong>Health Aggregation</strong> \u2014 Collects status from all local Connectors and reports upstream to Zenith</li>' +
          '<li><strong>Local Autonomy</strong> \u2014 If cloud connectivity is lost, Connectors continue running with last-known config</li>' +
          '</ul>' +
          '<p>At enterprise scale: ~50 Horizons, one per physical site worldwide.</p>',
        related: [
          { page: '02', hotspot: 'horizon-tier', label: '02 \u2014 Horizon overview' },
          { page: '02', hotspot: 'communication', label: '02 \u2014 Pull-based communication model' }
        ]
      }
    },
    {
      id: 'cloud-tier',
      startLine: 19, startCol: 3, endLine: 35, endCol: 90,
      label: 'Tier 3 \u2014 Cloud (DIME Zenith + Zenith UX)',
      panel: {
        title: 'Cloud Tier \u2014 Fleet Command Center',
        body:
          '<p><strong>DIME Zenith</strong> is the centralized fleet management layer, backed by MongoDB.</p>' +
          '<ul>' +
          '<li><strong>Fleet Management</strong> \u2014 Manages hundreds of Horizons and thousands of Connectors from a single pane of glass</li>' +
          '<li><strong>MongoDB-Backed</strong> \u2014 All configuration, firmware images, and fleet state stored durably in MongoDB</li>' +
          '<li><strong>Health Monitoring</strong> \u2014 Tracks Horizon check-in times, detects stale/offline sites, alerts on connector faults</li>' +
          '<li><strong>Zenith UX</strong> \u2014 Desktop application for operators. Fleet-wide dashboard, push config changes, manage firmware, view health across all sites.</li>' +
          '<li><strong>REST API + Web Dashboard</strong> \u2014 Full API for automation and integration, plus a browser-based console</li>' +
          '</ul>' +
          '<p>A single Zenith instance manages the entire global fleet.</p>',
        related: [
          { page: '02', hotspot: 'zenith-tier', label: '02 \u2014 Zenith overview' },
          { page: '02', hotspot: 'scale', label: '02 \u2014 Enterprise scale' }
        ]
      }
    },
    {
      id: 'data-up',
      startLine: 90, startCol: 4, endLine: 101, endCol: 90,
      label: 'Data Flows Up \u2014 Device to Cloud',
      panel: {
        title: 'Upward Data Flow \u2014 Device to Dashboard',
        body:
          '<p>Every data point travels the same path from physical device to cloud dashboard:</p>' +
          '<ol>' +
          '<li><strong>Device</strong> \u2014 PLC, sensor, or robot provides raw data via industrial protocol (OPC-UA, S7, Modbus, etc.)</li>' +
          '<li><strong>Connector</strong> \u2014 Reads data on timer, runs Lua transform, publishes to ring buffer, forwards via MQTT/SHDR/HTTP</li>' +
          '<li><strong>Horizon</strong> \u2014 Aggregates data from all local Connectors, forwards upstream to Zenith</li>' +
          '<li><strong>Zenith</strong> \u2014 Stores in MongoDB, monitors health, detects stale data, triggers alerts</li>' +
          '<li><strong>Zenith UX</strong> \u2014 Operators see real-time dashboards, drill into any site, any connector, any data point</li>' +
          '</ol>' +
          '<p>Data is normalized by Lua scripts at the edge, so Zenith receives clean, consistent data regardless of the source protocol.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Detailed data flow' },
          { page: '22', label: '22 \u2014 Instance chaining patterns' }
        ]
      }
    },
    {
      id: 'commands-down',
      startLine: 109, startCol: 4, endLine: 121, endCol: 90,
      label: 'Commands Flow Down \u2014 Cloud to Edge',
      panel: {
        title: 'Downward Command Flow \u2014 Config Propagation',
        body:
          '<p>Configuration changes and operational commands propagate from cloud to edge:</p>' +
          '<ol>' +
          '<li><strong>Zenith UX</strong> \u2014 Operator publishes a new YAML config or triggers a task (firmware update, restart, etc.)</li>' +
          '<li><strong>Zenith</strong> \u2014 Queues the command in MongoDB, tagged for the target Horizon</li>' +
          '<li><strong>Horizon</strong> \u2014 Pulls the command on its next check-in cycle, applies locally, pushes to target Connectors</li>' +
          '<li><strong>Connector</strong> \u2014 Receives new config, restarts cleanly with updated settings</li>' +
          '</ol>' +
          '<p><strong>Key design:</strong> All communication is pull-based from the edge outward. Horizon pulls from Zenith; Zenith never initiates connections inward. This means zero inbound firewall rules at any tier.</p>',
        related: [
          { page: '02', hotspot: 'communication', label: '02 \u2014 Pull-based communication' },
          { page: '16', label: '16 \u2014 Admin API for runtime changes' }
        ]
      }
    }
  ]
};
