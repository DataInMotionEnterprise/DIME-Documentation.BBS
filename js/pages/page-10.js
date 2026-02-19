/**
 * 10 — Cache API
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['10'] = {
  id: '10',
  title: '10 \u2014 Cache API',
  file: 'content/10-cache-api.md',
  hotspots: [
    {
      id: 'cache-read',
      startLine: 38, startCol: 3, endLine: 56, endCol: 92,
      label: 'cache() \u2014 Read Cached Values',
      panel: {
        title: 'Reading Cached Values with cache()',
        body:
          '<p><code>cache(path, default)</code> reads the last known value for any message path in the system.</p>' +
          '<p>Every value that passes through the ring buffer is automatically cached. Any script \u2014 in any connector \u2014 can read any cached value at any time.</p>' +
          '<ul>' +
          '<li><strong>path</strong> \u2014 The full message path, e.g. <code>"plc1/temperature"</code></li>' +
          '<li><strong>default</strong> \u2014 Value returned if the path has never been seen (avoids nil errors)</li>' +
          '</ul>' +
          '<p>Returns the raw value: number, string, or whatever the source produced.</p>',
        yaml:
          'script: |\n' +
          '  local temp = cache(\'plc1/temperature\', 0)\n' +
          '  local pressure = cache(\'plc1/pressure\', 0)\n' +
          '  return temp * pressure',
        related: [
          { page: '09', label: '09 \u2014 Lua Scripting & Transforms' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'cache-write',
      startLine: 65, startCol: 3, endLine: 81, endCol: 92,
      label: 'set() \u2014 Write to Cache',
      panel: {
        title: 'Writing Custom Values with set()',
        body:
          '<p><code>set(path, value)</code> writes a custom value into the user cache.</p>' +
          '<p>Unlike <code>emit()</code>, <code>set()</code> does <strong>not</strong> publish to the ring buffer. It silently stores a value that other scripts can later read with <code>cache()</code>.</p>' +
          '<p>Use cases:</p>' +
          '<ul>' +
          '<li>Persistent counters that survive across scan cycles</li>' +
          '<li>State machine values (<code>set(\'machine/state\', \'RUNNING\')</code>)</li>' +
          '<li>Computed results like running averages</li>' +
          '<li>Flags and thresholds for cross-connector coordination</li>' +
          '</ul>' +
          '<p><strong>cache() vs emit():</strong> <code>cache/set</code> = silent storage. <code>emit</code> = publish to ring buffer for all sinks.</p>',
        yaml:
          'script: |\n' +
          '  local count = cache(\'my_counter\', 0)\n' +
          '  set(\'my_counter\', count + 1)\n' +
          '  return count + 1',
        related: [
          { page: '09', label: '09 \u2014 Lua Scripting: emit() function' },
          { page: '11', label: '11 \u2014 Templates & Output Formatting' }
        ]
      }
    },
    {
      id: 'cache-ts',
      startLine: 47, startCol: 3, endLine: 55, endCol: 92,
      label: 'cache_ts() \u2014 Value + Timestamp',
      panel: {
        title: 'Checking Data Freshness with cache_ts()',
        body:
          '<p><code>cache_ts(path, default)</code> returns <strong>two values</strong>: the cached data and its timestamp.</p>' +
          '<p>Use this when you need to verify that cached data is still fresh before using it:</p>' +
          '<ul>' +
          '<li>Check if a value is older than N seconds and treat it as stale</li>' +
          '<li>Compare timestamps across sources to correlate events</li>' +
          '<li>Detect when a source has stopped producing data</li>' +
          '</ul>' +
          '<p>The timestamp is a Unix epoch value matching the original message timestamp from the source.</p>',
        related: [
          { page: '09', label: '09 \u2014 Lua Scripting & Transforms' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'cross-connector',
      startLine: 87, startCol: 3, endLine: 119, endCol: 92,
      label: 'Cross-Connector Access',
      panel: {
        title: 'Cross-Connector Cache Access',
        body:
          '<p>Any script in any connector can read any path from any other connector\u2019s cached data.</p>' +
          '<p>This is the key power of the cache API: it breaks the isolation between independently running sources.</p>' +
          '<ul>' +
          '<li>A Script source can read PLC values with <code>cache(\'plc1/temperature\', 0)</code></li>' +
          '<li>A Script source can read weather data with <code>cache(\'wx/humidity\', 0)</code></li>' +
          '<li>Custom values written with <code>set()</code> are also available to all connectors</li>' +
          '</ul>' +
          '<p>The cache store is global and in-memory. All paths from all sources are accessible to all scripts.</p>',
        related: [
          { page: '09', label: '09 \u2014 Lua Scripting & Transforms' },
          { page: '11', label: '11 \u2014 Templates & Output Formatting' }
        ]
      }
    },
    {
      id: 'wait-for',
      startLine: 153, startCol: 3, endLine: 191, endCol: 92,
      label: 'wait_for_connectors',
      panel: {
        title: 'Dependency Ordering with wait_for_connectors',
        body:
          '<p>When a Script source reads cache values from other sources, those sources must have connected and produced data first.</p>' +
          '<p><code>wait_for_connectors</code> delays a source\u2019s startup until all listed dependencies have connected.</p>' +
          '<ul>' +
          '<li>List the names of connectors that must connect before this source starts</li>' +
          '<li>Prevents cache reads from returning defaults on the first cycle</li>' +
          '<li>Works with any source type, not just Script connectors</li>' +
          '</ul>' +
          '<p>Without this, a fast-starting Script connector might run before slower OPC-UA or HTTP sources have connected.</p>',
        yaml:
          'sources:\n' +
          '  - name: enricher\n' +
          '    connector: Script\n' +
          '    wait_for_connectors:\n' +
          '      - plc1\n' +
          '      - weather',
        related: [
          { page: '09', label: '09 \u2014 Lua Scripting & Transforms' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' },
          { page: '11', label: '11 \u2014 Templates & Output Formatting' }
        ]
      }
    }
  ]
};
