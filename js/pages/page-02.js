/**
 * 02 — The DIME Ecosystem
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['02'] = {
  id: '02',
  title: '02 \u2014 The DIME Ecosystem',
  file: 'content/02-the-dime-ecosystem.md',
  hotspots: [
    {
      id: 'zenith-tier',
      startLine: 19, startCol: 26, endLine: 27, endCol: 68,
      label: 'DIME Zenith \u2014 Cloud Command Center',
      panel: {
        title: 'DIME Zenith (Cloud)',
        body:
          '<p><strong>DIME Zenith</strong> is the centralized cloud-based command and control layer for the entire DIME fleet.</p>' +
          '<ul>' +
          '<li><strong>Fleet Management</strong> \u2014 Manages hundreds of Horizon gateways across all sites from a single pane of glass</li>' +
          '<li><strong>MongoDB-Backed</strong> \u2014 All configuration, firmware, and fleet state stored in MongoDB for durability and queryability</li>' +
          '<li><strong>Web Dashboard + REST API</strong> \u2014 Browser-based management console plus a full REST API for automation and integration</li>' +
          '<li><strong>Push Configuration</strong> \u2014 Deploy connector configs, firmware updates, and commands to any Horizon \u2014 Horizon pulls them on next check-in</li>' +
          '</ul>' +
          '<p>Zenith is the single source of truth for your entire data collection infrastructure.</p>',
        related: [
          { page: '02', hotspot: 'horizon-tier', label: '02 \u2014 Horizon: the site gateway' },
          { page: '02', hotspot: 'scale', label: '02 \u2014 Enterprise scale capabilities' }
        ]
      }
    },
    {
      id: 'horizon-tier',
      startLine: 34, startCol: 26, endLine: 42, endCol: 68,
      label: 'DIME Horizon \u2014 Site Gateway',
      panel: {
        title: 'DIME Horizon (Gateway)',
        body:
          '<p><strong>DIME Horizon</strong> is the site-level gateway that bridges edge connectors to the cloud.</p>' +
          '<ul>' +
          '<li><strong>Site Management</strong> \u2014 Manages dozens of DIME Connectors running on the factory floor at a single site</li>' +
          '<li><strong>Pull-Based Architecture</strong> \u2014 Horizon initiates all communication to Zenith. It pulls config, updates, and commands on a regular check-in cycle. No inbound firewall rules needed.</li>' +
          '<li><strong>Edge-to-Cloud Bridge</strong> \u2014 Aggregates data and status from local Connectors and reports upstream to Zenith</li>' +
          '<li><strong>Local Autonomy</strong> \u2014 If cloud connectivity is lost, Connectors continue running with their last-known config</li>' +
          '</ul>' +
          '<p>The pull-based model means Horizon works behind corporate firewalls with zero network configuration changes.</p>',
        related: [
          { page: '02', hotspot: 'zenith-tier', label: '02 \u2014 Zenith: cloud command center' },
          { page: '02', hotspot: 'connector-tier', label: '02 \u2014 Connector: edge data collection' },
          { page: '02', hotspot: 'communication', label: '02 \u2014 Pull-based communication model' }
        ]
      }
    },
    {
      id: 'connector-tier',
      startLine: 48, startCol: 26, endLine: 56, endCol: 68,
      label: 'DIME Connector \u2014 Edge Data Collection',
      panel: {
        title: 'DIME Connector (Edge)',
        body:
          '<p><strong>DIME Connector</strong> is the edge runtime that collects data directly from factory-floor devices.</p>' +
          '<ul>' +
          '<li><strong>47+ Protocols</strong> \u2014 OPC-UA, Siemens S7, Modbus TCP, MQTT, EtherNet/IP, FANUC, and many more out of the box</li>' +
          '<li><strong>YAML Configuration</strong> \u2014 Define sources (devices to read) and sinks (destinations to write) in simple YAML files</li>' +
          '<li><strong>Disruptor Ring Buffer</strong> \u2014 Lock-free, sub-millisecond message routing at 1M+ messages per second</li>' +
          '<li><strong>Runs Anywhere</strong> \u2014 Windows Service, Linux daemon, or Docker container on x86, x64, or ARM64</li>' +
          '</ul>' +
          '<p>Each Connector instance is a self-contained data integration engine that operates independently on the factory floor.</p>',
        related: [
          { page: '01', hotspot: 'connectors', label: '01 \u2014 47+ connector types' },
          { page: '05', hotspot: 'big-picture', label: '05 \u2014 Architecture deep dive' },
          { page: '03', label: '03 \u2014 Installation & first run' }
        ]
      }
    },
    {
      id: 'desktop-apps',
      startLine: 22, startCol: 64, endLine: 56, endCol: 90,
      label: 'Desktop Applications \u2014 Connector UX & Zenith UX',
      panel: {
        title: 'DIME Desktop Applications',
        body:
          '<p>Two desktop applications provide visual management interfaces for the DIME platform:</p>' +
          '<ul>' +
          '<li><strong>Connector UX</strong> \u2014 Local management app for a single DIME Connector instance. Configure sources and sinks, monitor live data, view diagnostics, and manage the connector lifecycle \u2014 all from a desktop UI.</li>' +
          '<li><strong>Zenith UX</strong> \u2014 Fleet-wide monitoring and management app. View all Horizons and Connectors across every site, push configuration changes, monitor health, and manage firmware deployments from a single desktop interface.</li>' +
          '</ul>' +
          '<p>Both apps communicate with their respective DIME tier via REST API and WebSocket for real-time updates.</p>',
        related: [
          { page: '02', hotspot: 'connector-tier', label: '02 \u2014 Connector: edge data collection' },
          { page: '02', hotspot: 'zenith-tier', label: '02 \u2014 Zenith: cloud command center' }
        ]
      }
    },
    {
      id: 'communication',
      startLine: 60, startCol: 3, endLine: 75, endCol: 90,
      label: 'Pull-Based Communication Model',
      panel: {
        title: 'Communication Model \u2014 Pull From the Edge',
        body:
          '<p>All inter-tier communication in DIME follows a <strong>pull-based model</strong>:</p>' +
          '<ul>' +
          '<li><strong>Horizon pulls from Zenith</strong> \u2014 On a regular check-in cycle, Horizon connects outbound to Zenith to fetch new configs, firmware, and commands. Zenith never initiates connections to Horizon.</li>' +
          '<li><strong>Horizon pushes to Connectors</strong> \u2014 Within the local site network, Horizon delivers config and commands to its managed Connectors.</li>' +
          '</ul>' +
          '<p><strong>Key benefit:</strong> No inbound firewall rules are required at any tier. Horizon works behind NAT, corporate firewalls, and air-gapped networks with only standard outbound HTTPS.</p>' +
          '<p>This design makes DIME deployable in locked-down industrial environments where opening inbound ports is not permitted.</p>',
        related: [
          { page: '02', hotspot: 'horizon-tier', label: '02 \u2014 Horizon: pull-based architecture' },
          { page: '02', hotspot: 'scale', label: '02 \u2014 Enterprise scale capabilities' }
        ]
      }
    },
    {
      id: 'scale',
      startLine: 77, startCol: 3, endLine: 92, endCol: 90,
      label: 'Enterprise Scale',
      panel: {
        title: 'Enterprise Scale Capabilities',
        body:
          '<p>The DIME platform scales hierarchically:</p>' +
          '<ul>' +
          '<li><strong>1 Zenith instance</strong> manages <strong>hundreds of Horizons</strong> across all sites worldwide</li>' +
          '<li><strong>1 Horizon per site</strong> manages <strong>dozens of Connectors</strong> (typically 10\u201350 per site)</li>' +
          '<li><strong>Each Connector</strong> handles <strong>1M+ messages/sec</strong> with sub-millisecond latency</li>' +
          '</ul>' +
          '<p>A typical enterprise deployment: 1 Zenith in the cloud, 20 Horizons across 20 factories, each running 30 Connectors = <strong>600 Connectors managed from one place</strong>.</p>' +
          '<p>Adding a new site is as simple as installing a Horizon and pointing it at Zenith \u2014 it checks in, pulls its config, and starts managing its local Connectors automatically.</p>',
        related: [
          { page: '02', hotspot: 'zenith-tier', label: '02 \u2014 Zenith: fleet command center' },
          { page: '02', hotspot: 'communication', label: '02 \u2014 Pull-based communication' },
          { page: '01', hotspot: 'features', label: '01 \u2014 Why choose DIME?' }
        ]
      }
    }
  ]
};
