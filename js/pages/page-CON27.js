/**
 * 27 — Zenith UX — Fleet Console
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON27'] = {
  id: 'CON27',
  title: 'CON27 \u2014 Zenith UX',
  file: 'content/CON27-zenith-ux.md',
  hotspots: [
    {
      id: 'fleet-tree',
      startLine: 20, startCol: 3, endLine: 48, endCol: 90,
      label: 'Fleet Tree View',
      panel: {
        title: 'Fleet Tree View \u2014 Hierarchical Navigation',
        body:
          '<p>The fleet tree is the primary navigation element in Zenith UX. It presents the entire enterprise as a collapsible hierarchy:</p>' +
          '<ul>' +
          '<li><strong>Zenith (root)</strong> \u2014 The top-level node showing the server address</li>' +
          '<li><strong>Horizons</strong> \u2014 One node per site (e.g., Factory Chicago, Plant Detroit). Shows online/stale status and last check-in time.</li>' +
          '<li><strong>Connectors</strong> \u2014 Individual DIME instances under each Horizon. Color-coded status indicators: green (connected), red (faulted), gray (offline).</li>' +
          '</ul>' +
          '<p>Click any node to open its detail panel on the right side. The tree supports keyboard navigation and search/filter for large fleets.</p>' +
          '<p>Expand or collapse branches to focus on specific sites. The tree updates in real time as check-ins arrive.</p>',
        related: [
          { page: 'CON27', hotspot: 'live-dashboard', label: 'Live dashboard metrics' },
          { page: 'CON27', hotspot: 'deep-dive', label: 'Deep-dive detail view' },
          { page: 'CON26', label: 'CON26 \u2014 Zenith Cloud' }
        ]
      }
    },
    {
      id: 'live-dashboard',
      startLine: 52, startCol: 3, endLine: 80, endCol: 90,
      label: 'Live Dashboard',
      panel: {
        title: 'Live Dashboard \u2014 Fleet-Wide Health at a Glance',
        body:
          '<p>The dashboard provides an instant overview of the entire fleet with four key metrics:</p>' +
          '<ul>' +
          '<li><strong>Connected</strong> (green) \u2014 Number of connectors currently online and operating normally</li>' +
          '<li><strong>Faulted</strong> (red) \u2014 Connectors in a fault state, requiring attention</li>' +
          '<li><strong>Offline</strong> (gray) \u2014 Connectors that are not responding or have been stopped</li>' +
          '<li><strong>Stale</strong> (amber) \u2014 Horizons that have missed their check-in window</li>' +
          '</ul>' +
          '<p>Below the summary cards, a Horizon status table shows each site with its online state, time since last check-in, and connector health ratio (e.g., 4/4 means all four connectors at that site are healthy).</p>' +
          '<p>Click any metric card or table row to drill down into the affected connectors. The dashboard uses configurable polling to balance freshness against network load.</p>',
        related: [
          { page: 'CON27', hotspot: 'fleet-tree', label: 'Fleet tree navigation' },
          { page: 'CON26', hotspot: 'stale-detection', label: 'CON26 \u2014 Stale detection' },
          { page: 'CON25', label: 'CON25 \u2014 Horizon Gateway' }
        ]
      }
    },
    {
      id: 'deep-dive',
      startLine: 84, startCol: 3, endLine: 116, endCol: 90,
      label: 'Deep-Dive Detail',
      panel: {
        title: 'Deep-Dive Detail \u2014 Full Connector Inspection',
        body:
          '<p>Click any connector in the fleet tree to open a multi-tab detail view:</p>' +
          '<ul>' +
          '<li><strong>Status Tab</strong> \u2014 Real-time health metrics: IsConnected, IsFaulted, FaultCount, ConnectCount, LoopTime, ReadTime, ScriptTime, and MessagesAccepted. Updated on each Horizon check-in.</li>' +
          '<li><strong>Config Tab</strong> \u2014 The full YAML configuration for this connector, displayed in a syntax-highlighted editor. Shows sources, sinks, items, filters, and all settings.</li>' +
          '<li><strong>Data Tab</strong> \u2014 Current data point snapshot. Shows every message path, its last known value, and timestamp. Useful for verifying that data is flowing correctly.</li>' +
          '</ul>' +
          '<p>Action buttons let you issue tasks directly from the detail view: refresh status, view/edit config, restart the connector. All actions flow through the Zenith \u2192 Horizon \u2192 Connector chain.</p>',
        related: [
          { page: 'CON27', hotspot: 'remote-config', label: 'Remote YAML editing' },
          { page: 'CON19', label: 'CON19 \u2014 Connector UX' },
          { page: 'CON18', label: 'CON18 \u2014 Health & Faults' }
        ]
      }
    },
    {
      id: 'remote-config',
      startLine: 120, startCol: 3, endLine: 145, endCol: 90,
      label: 'Remote YAML Editing',
      panel: {
        title: 'Remote YAML Editing \u2014 Push Chain',
        body:
          '<p>Zenith UX includes a built-in YAML editor for viewing and editing connector configurations remotely. The push chain works in six steps:</p>' +
          '<ol>' +
          '<li><strong>Edit</strong> \u2014 Operator edits the YAML in the built-in editor within Zenith UX</li>' +
          '<li><strong>Queue</strong> \u2014 Zenith creates a <code>set_connector_config</code> task and queues it for the target Horizon</li>' +
          '<li><strong>Pick Up</strong> \u2014 Horizon picks up the task on its next scheduled check-in</li>' +
          '<li><strong>Push</strong> \u2014 Horizon sends the new config to the Connector via <code>POST /config/yaml</code> on its local Admin API</li>' +
          '<li><strong>Hot Reload</strong> \u2014 The Connector parses the new YAML, diffs against the running config, and applies changes without restart</li>' +
          '<li><strong>Report</strong> \u2014 The result flows back through the chain: Connector \u2192 Horizon \u2192 Zenith \u2192 Zenith UX</li>' +
          '</ol>' +
          '<p>Zero downtime. The operator sees confirmation in the UI once the config has been applied at the edge.</p>',
        related: [
          { page: 'CON26', label: 'CON26 \u2014 Zenith Cloud' },
          { page: 'CON25', hotspot: 'tasks', label: 'CON25 \u2014 Supported tasks' },
          { page: 'CON16', label: 'CON16 \u2014 Admin REST API' },
          { page: 'CON28', label: 'CON28 \u2014 Edge to Cloud' }
        ]
      }
    },
    {
      id: 'task-mgmt',
      startLine: 149, startCol: 3, endLine: 182, endCol: 90,
      label: 'Task Management',
      panel: {
        title: 'Task Management \u2014 Issue and Track',
        body:
          '<p>The task management panel lets operators issue manual tasks and track their execution across the fleet:</p>' +
          '<ul>' +
          '<li><strong>Issue Tasks</strong> \u2014 Select a target Horizon, choose a task type (get_connector_status, set_connector_config, restart_connector, etc.), select scope (specific connector or all), and click Issue.</li>' +
          '<li><strong>Task History</strong> \u2014 A table showing all tasks with their status (completed, pending, failed), target Horizon, timestamp, and result summary.</li>' +
          '<li><strong>Real-Time Tracking</strong> \u2014 Pending tasks update to completed as Horizons check in and report results. No manual refresh needed.</li>' +
          '</ul>' +
          '<p>Tasks that target a stale Horizon will remain pending until that Horizon comes back online and checks in. Zenith guarantees delivery \u2014 tasks are never lost.</p>',
        related: [
          { page: 'CON25', hotspot: 'tasks', label: 'CON25 \u2014 Supported tasks' },
          { page: 'CON25', hotspot: 'checkin', label: 'CON25 \u2014 Check-in cycle' },
          { page: 'CON26', hotspot: 'stale-detection', label: 'CON26 \u2014 Stale detection' }
        ]
      }
    }
  ]
};
