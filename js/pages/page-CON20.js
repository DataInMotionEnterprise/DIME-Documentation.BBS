/**
 * 20 — Report By Exception
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON20'] = {
  id: 'CON20',
  title: 'CON20 \u2014 Report By Exception',
  file: 'content/CON20-report-by-exception.md',
  hotspots: [
    {
      id: 'before-after',
      startLine: 17, startCol: 3, endLine: 61, endCol: 86,
      label: 'Before & After RBE',
      panel: {
        title: 'Report By Exception \u2014 98% Data Reduction',
        body:
          '<p><strong>RBE</strong> is the single most impactful optimization in DIME. It eliminates duplicate values before they ever reach the ring buffer.</p>' +
          '<p><strong>Concrete example:</strong></p>' +
          '<ul>' +
          '<li>1 sensor, 1-second scan, 1 hour = <strong>3,600 messages</strong> without RBE</li>' +
          '<li>If the value changes once per minute on average = <strong>60 messages</strong> with RBE</li>' +
          '<li>Reduction: <strong>98.3%</strong></li>' +
          '</ul>' +
          '<p>Scale that to 10 sensors over 24 hours:</p>' +
          '<ul>' +
          '<li>Without RBE: <strong>864,000 messages/day</strong></li>' +
          '<li>With RBE: <strong>~14,400 messages/day</strong></li>' +
          '</ul>' +
          '<p>Less network traffic, less database storage, less CPU on the sink side. The downstream systems only process meaningful changes.</p>',
        related: [
          { page: 'CON29', hotspot: 'backpressure', label: 'CON29 \u2014 Backpressure & slow sinks' },
          { page: 'EX35', label: 'EX35 \u2014 Streaming (rbe: false)' }
        ]
      }
    },
    {
      id: 'connector-rbe',
      startLine: 94, startCol: 3, endLine: 109, endCol: 86,
      label: 'Connector-Level RBE',
      panel: {
        title: 'Connector-Level RBE \u2014 One Flag, All Items',
        body:
          '<p>Set <code>rbe: !!bool true</code> on the source connector to enable RBE for <strong>every item</strong> on that source.</p>' +
          '<p>This is the most common pattern. One line of config eliminates the vast majority of duplicate messages.</p>' +
          '<p>Each item maintains its own last-value cache independently. A change in <code>temperature</code> does not affect whether <code>pressure</code> is published.</p>' +
          '<p>The RBE check happens <strong>after</strong> any Lua script transformation, so your script sees every raw reading but only changed results are published.</p>',
        yaml:
          'sources:\n' +
          '  - name: plc1\n' +
          '    connector: OpcUa\n' +
          '    rbe: !!bool true        # all items use RBE\n' +
          '    scan_interval: !!int 1000',
        related: [
          { page: 'CON20', hotspot: 'item-rbe', label: 'CON20 \u2014 Item-level override' },
          { page: 'CON06', hotspot: 'source-types', label: 'CON06 \u2014 Source connector types' }
        ]
      }
    },
    {
      id: 'item-rbe',
      startLine: 118, startCol: 3, endLine: 136, endCol: 86,
      label: 'Item-Level RBE Override',
      panel: {
        title: 'Item-Level RBE \u2014 Per-Item Control',
        body:
          '<p>Override RBE on individual items when some data needs every reading.</p>' +
          '<p>The item-level <code>rbe</code> setting <strong>overrides</strong> the source-level setting. This lets you:</p>' +
          '<ul>' +
          '<li>Enable RBE on the source, then disable it for specific items (alarms, counters)</li>' +
          '<li>Disable RBE on the source, then enable it for specific noisy items</li>' +
          '</ul>' +
          '<p>Common pattern: source-level <code>rbe: true</code> with <code>rbe: false</code> on alarm and event items.</p>',
        yaml:
          '    items:\n' +
          '      - name: temperature\n' +
          '        rbe: !!bool true     # changes only\n' +
          '      - name: alarm_count\n' +
          '        rbe: !!bool false    # every reading',
        related: [
          { page: 'CON20', hotspot: 'connector-rbe', label: 'CON20 \u2014 Connector-level RBE' },
          { page: 'CON04', hotspot: 'item-anatomy', label: 'CON04 \u2014 Configuring items' }
        ]
      }
    },
    {
      id: 'force-emit',
      startLine: 145, startCol: 3, endLine: 161, endCol: 86,
      label: 'Force Emit (Bypass RBE)',
      panel: {
        title: 'emit(path, value, true) \u2014 Force Publish',
        body:
          '<p>In a Lua script, the third argument to <code>emit()</code> is the <strong>force flag</strong>.</p>' +
          '<ul>' +
          '<li><code>emit(path, value)</code> \u2014 Normal publish. RBE applies, duplicates suppressed.</li>' +
          '<li><code>emit(path, value, true)</code> \u2014 <strong>Force publish</strong>. Bypasses RBE, always sends.</li>' +
          '</ul>' +
          '<p>Use cases for force emit:</p>' +
          '<ul>' +
          '<li><strong>Heartbeats</strong> \u2014 Periodic "I am alive" signals that must always arrive</li>' +
          '<li><strong>Critical alarms</strong> \u2014 The same alarm firing twice is two events, not a duplicate</li>' +
          '<li><strong>Watchdog timers</strong> \u2014 Downstream expects regular updates regardless of value</li>' +
          '</ul>' +
          '<p>The force flag only affects that single emit call. Other items and subsequent calls still use normal RBE.</p>',
        yaml:
          'script: |\n' +
          '  -- Force publish even if unchanged\n' +
          '  emit(\'critical/alarm\', result, true)',
        related: [
          { page: 'CON20', hotspot: 'connector-rbe', label: 'CON20 \u2014 Connector-level RBE' },
          { page: 'CON10', hotspot: 'cache-read', label: 'CON10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'execute-every',
      startLine: 169, startCol: 3, endLine: 189, endCol: 86,
      label: 'every Throttle',
      panel: {
        title: 'every \u2014 Skip Scan Cycles',
        body:
          '<p><code>every</code> is a complementary throttle to RBE. Instead of suppressing duplicate <em>values</em>, it skips entire <em>scan cycles</em> for an item.</p>' +
          '<p>With <code>scan_interval: 1000</code> and <code>every: 10</code>, the item is only read on every 10th cycle \u2014 effectively once every 10 seconds.</p>' +
          '<p><strong>RBE vs every:</strong></p>' +
          '<ul>' +
          '<li><strong>RBE</strong> \u2014 Reads every cycle, compares, publishes only changes. Device is still polled.</li>' +
          '<li><strong>every</strong> \u2014 Skips the read entirely. Device is not polled on skipped cycles. Saves device I/O.</li>' +
          '</ul>' +
          '<p>Combine both for maximum reduction: read every Nth cycle, then suppress if unchanged.</p>' +
          '<p>Other items on the same source are unaffected \u2014 each item has its own <code>every</code> counter.</p>',
        yaml:
          '    items:\n' +
          '      - name: slow_sensor\n' +
          '        every: !!int 10  # every 10th cycle',
        related: [
          { page: 'CON20', hotspot: 'before-after', label: 'CON20 \u2014 RBE data reduction' },
          { page: 'CON05', hotspot: 'performance', label: 'CON05 \u2014 Performance design' }
        ]
      }
    }
  ]
};
