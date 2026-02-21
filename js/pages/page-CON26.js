/**
 * 26 — DIME Zenith — Cloud Command Center
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON26'] = {
  id: 'CON26',
  title: 'CON26 \u2014 Zenith Cloud',
  file: 'content/CON26-zenith-cloud.md',
  hotspots: [
    {
      id: 'architecture',
      startLine: 20, startCol: 3, endLine: 58, endCol: 90,
      label: 'Zenith Architecture',
      panel: {
        title: 'Zenith Architecture \u2014 ASP.NET Core + MongoDB',
        body:
          '<p>Zenith is built on two proven technologies:</p>' +
          '<ul>' +
          '<li><strong>ASP.NET Core Minimal API</strong> \u2014 Lightweight, high-performance HTTP server. Handles hundreds of concurrent Horizon check-ins with minimal resource usage.</li>' +
          '<li><strong>MongoDB</strong> \u2014 Document database for fleet-wide persistent storage. Flexible schema adapts to different connector types and configurations without migrations.</li>' +
          '</ul>' +
          '<p>The architecture is intentionally simple: Zenith is a stateless API server backed by MongoDB. No message queues, no caches, no complex infrastructure. MongoDB handles persistence, and the check-in model handles distribution.</p>' +
          '<p>Zenith can be deployed on any cloud provider, on-premises, or in a Docker container.</p>',
        related: [
          { page: 'CON25', label: 'CON25 \u2014 Horizon Gateway' },
          { page: 'CON27', label: 'CON27 \u2014 Zenith UX' },
          { page: 'CON02', label: 'CON02 \u2014 The DIME Ecosystem' }
        ]
      }
    },
    {
      id: 'collections',
      startLine: 62, startCol: 3, endLine: 100, endCol: 90,
      label: 'MongoDB Collections',
      panel: {
        title: 'MongoDB Collections \u2014 Fleet State Store',
        body:
          '<p>Six MongoDB collections store the entire fleet state:</p>' +
          '<ul>' +
          '<li><strong>Horizons</strong> \u2014 One document per site. Contains metadata (name, location), the authentication key, last check-in timestamp, and Horizon software version.</li>' +
          '<li><strong>Connectors</strong> \u2014 One document per connector across all sites. Stores connector type, name, and the Horizon it belongs to.</li>' +
          '<li><strong>Connectors-Configuration</strong> \u2014 The full YAML configuration for each connector, stored centrally. Enables remote config viewing and editing through Zenith UX.</li>' +
          '<li><strong>Connectors-Status</strong> \u2014 Live health and performance metrics: IsConnected, IsFaulted, FaultCount, ReadTime, LoopTime, MessagesAccepted. Updated on every Horizon check-in.</li>' +
          '<li><strong>Connectors-Data</strong> \u2014 Current data point snapshots. The last known value for each data path, updated on check-in or via get_connector_data tasks.</li>' +
          '<li><strong>Tasks</strong> \u2014 The task queue. Each task has a target Horizon, a type, parameters, status (pending/executing/done), and the result once completed.</li>' +
          '</ul>',
        related: [
          { page: 'CON26', hotspot: 'api', label: 'API endpoints' },
          { page: 'CON26', hotspot: 'stale-detection', label: 'Stale detection' },
          { page: 'CON27', label: 'CON27 \u2014 Zenith UX' }
        ]
      }
    },
    {
      id: 'api',
      startLine: 104, startCol: 3, endLine: 137, endCol: 90,
      label: 'API Endpoints',
      panel: {
        title: 'Zenith API Endpoints',
        body:
          '<p>Zenith exposes just two API endpoints. Simplicity is intentional:</p>' +
          '<ul>' +
          '<li><strong>POST /horizon/{key}/checkin</strong> \u2014 The primary endpoint. Horizon sends its current status (all connector health, metrics, and data). Zenith updates its MongoDB collections and returns any pending tasks in the response body. This single round-trip handles both reporting and task distribution.</li>' +
          '<li><strong>POST /horizon/{key}/task/{id}</strong> \u2014 After executing a task locally, Horizon reports the result back. Zenith marks the task as complete and stores the result for display in Zenith UX.</li>' +
          '</ul>' +
          '<p>The <code>{key}</code> parameter is the Horizon\'s unique GUID, serving as both identification and authentication. No separate auth headers or tokens needed.</p>' +
          '<p>Both endpoints are idempotent and safe to retry on network failures.</p>',
        related: [
          { page: 'CON25', hotspot: 'checkin', label: 'CON25 \u2014 Check-in cycle' },
          { page: 'CON26', hotspot: 'auth', label: 'Key-based authentication' },
          { page: 'CON25', hotspot: 'tasks', label: 'CON25 \u2014 Supported tasks' }
        ]
      }
    },
    {
      id: 'stale-detection',
      startLine: 141, startCol: 3, endLine: 167, endCol: 90,
      label: 'Automatic Stale Detection',
      panel: {
        title: 'Automatic Stale Detection \u2014 Self-Healing Fleet View',
        body:
          '<p>Zenith tracks the last check-in timestamp for every Horizon. When a Horizon misses multiple consecutive check-ins, Zenith flags it as <strong>stale</strong>.</p>' +
          '<ul>' +
          '<li><strong>Online</strong> \u2014 Horizon checks in on schedule (e.g., every 10 seconds)</li>' +
          '<li><strong>Stale</strong> \u2014 No check-in received for 3x the configured interval</li>' +
          '</ul>' +
          '<p>When a stale Horizon comes back online, Zenith automatically queues data-refresh tasks:</p>' +
          '<ul>' +
          '<li><code>get_connector_status</code> \u2014 Refresh health for all connectors at that site</li>' +
          '<li><code>get_connector_config</code> \u2014 Refresh configurations in case of local changes during the outage</li>' +
          '<li><code>get_connector_data</code> \u2014 Refresh current data snapshots</li>' +
          '</ul>' +
          '<p>No manual intervention required. Zenith self-heals its view of the fleet after any network disruption.</p>',
        related: [
          { page: 'CON26', hotspot: 'collections', label: 'MongoDB collections' },
          { page: 'CON25', hotspot: 'checkin', label: 'CON25 \u2014 Check-in cycle' },
          { page: 'CON28', label: 'CON28 \u2014 Edge to Cloud' }
        ]
      }
    },
    {
      id: 'auth',
      startLine: 171, startCol: 3, endLine: 191, endCol: 90,
      label: 'Key-Based Authentication',
      panel: {
        title: 'Key-Based Authentication',
        body:
          '<p>Every Horizon is assigned a unique GUID key at provisioning time. This key serves as both identification and authentication.</p>' +
          '<ul>' +
          '<li><strong>No username/password management</strong> \u2014 No credentials to rotate, no password policies to enforce</li>' +
          '<li><strong>No token expiry</strong> \u2014 No OAuth flows, no refresh tokens, no session management</li>' +
          '<li><strong>One key per site</strong> \u2014 To revoke access, simply delete the Horizon record from MongoDB</li>' +
          '<li><strong>URL parameter</strong> \u2014 The key is part of the URL path (<code>/horizon/{key}/checkin</code>), not a header. It stays in the Horizon\'s local config file.</li>' +
          '</ul>' +
          '<p>The key is generated once during Horizon provisioning and configured in the Horizon\'s YAML file. It never changes unless explicitly rotated by an administrator.</p>',
        related: [
          { page: 'CON25', hotspot: 'config', label: 'CON25 \u2014 Horizon configuration' },
          { page: 'CON26', hotspot: 'api', label: 'API endpoints' },
          { page: 'CON02', label: 'CON02 \u2014 The DIME Ecosystem' }
        ]
      }
    }
  ]
};
