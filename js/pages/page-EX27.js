/**
 * EX27 — Sliding Window Analytics
 * Windowed moving average, spike detection, Liquid template transforms.
 */
DIME_PAGES['EX27'] = {
  id: 'EX27',
  title: 'EX27 \u2014 Sliding Window Analytics',
  file: 'content/EX27-sliding-window-analytics.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex27-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Sliding Window Analytics \u2014 Overview',
        body:
          '<p>This example demonstrates real-time analytics using the <code>sliding_window</code> Lua module:</p>' +
          '<ul>' +
          '<li><strong>Simulated sensor</strong> \u2014 Generates temperature readings around 25\u00b0C with random noise</li>' +
          '<li><strong>Moving average</strong> \u2014 A 5-sample sliding window smooths out noise via <code>window:average()</code></li>' +
          '<li><strong>Spike detection</strong> \u2014 Compares min/max within the window; flags spikes when deviation exceeds 3\u00b0C</li>' +
          '<li><strong>Liquid templates</strong> \u2014 Formats output as structured JSON using DotLiquid\u2019s <code>{{Message.Data}}</code> syntax</li>' +
          '</ul>' +
          '<p>The single-file config shows how Lua modules, the cache API, and template transforms work together for real-time analytics.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting Deep Dive' },
          { page: '11', label: '11 \u2014 Templates & Formatting' }
        ]
      }
    },
    {
      id: 'ex27-dataflow',
      startLine: 13, startCol: 2, endLine: 36, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Sensor \u2192 Sliding Windows \u2192 Console',
        body:
          '<p>Three items work together in a pipeline within a single source connector:</p>' +
          '<ol>' +
          '<li><strong>Temperature</strong> \u2014 Generates a random value: <code>25.0 + random(-2.0, +2.0)</code>. Published to the ring buffer and cached.</li>' +
          '<li><strong>TemperatureMovingAvg</strong> \u2014 Reads Temperature from cache, pushes into <code>window1</code> (size 5), returns <code>window1:average()</code>. A Liquid template wraps it as JSON with value, timestamp, and unit.</li>' +
          '<li><strong>TemperatureSpike</strong> \u2014 Reads Temperature from cache, pushes into <code>window2</code> (size 5), computes <code>max - min</code>. If deviation > 3.0, <code>is_spike = true</code>. A Liquid template formats the spike data as JSON.</li>' +
          '</ol>' +
          '<p>Items are evaluated in order, so Temperature\u2019s value is cached before the analytics items read it. The Console sink applies Liquid templates via <code>use_sink_transform: true</code>.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '10', label: '10 \u2014 Cache API (cross-item reads)' }
        ]
      }
    },
    {
      id: 'ex27-config',
      startLine: 38, startCol: 2, endLine: 124, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Single-File Config with Sliding Window',
        body:
          '<p>The entire configuration is in one file, with two YAML anchors:</p>' +
          '<ul>' +
          '<li><strong>&amp;console</strong> \u2014 Console sink with <code>use_sink_transform: true</code> to apply per-item Liquid templates. Uses regex <code>/\\$SYSTEM</code> to filter all system messages.</li>' +
          '<li><strong>&amp;sliding_window_script</strong> \u2014 Script source with <code>init_script</code> loading the <code>sliding_window</code> module and creating two window instances of size 5.</li>' +
          '</ul>' +
          '<p><strong>Per-item Liquid templates:</strong></p>' +
          '<ul>' +
          '<li><code>TemperatureMovingAvg</code> \u2014 Formats as <code>{"value": ..., "timestamp": ..., "unit": "C"}</code></li>' +
          '<li><code>TemperatureSpike</code> \u2014 Formats as <code>{"is_spike": ..., "deviation": ..., "max": ..., "min": ...}</code></li>' +
          '</ul>' +
          '<p>Each item can have its own <code>sink.transform</code> template, allowing different JSON structures from the same source.</p>',
        yaml:
          '# Sliding window init:\n' +
          'init_script: |\n' +
          '  local wm = require(\'sliding_window\')\n' +
          '  window1 = wm.create(5)\n' +
          '\n' +
          '# Moving average item:\n' +
          '- name: TemperatureMovingAvg\n' +
          '  script: |\n' +
          '    local t = cache("src/Temperature", 0)\n' +
          '    window1:add(t)\n' +
          '    return window1:average()',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '11', label: '11 \u2014 Templates & Formatting' }
        ]
      }
    },
    {
      id: 'ex27-keyconcepts',
      startLine: 126, startCol: 2, endLine: 154, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Sliding Window Module</strong> \u2014 The <code>sliding_window</code> Lua module (in DIME\u2019s Lua/ directory) provides a circular buffer for time-series analytics. Create with <code>window_module.create(size)</code>. Methods include <code>add()</code>, <code>average()</code>, <code>sum()</code>, <code>min()</code>, <code>max()</code>, <code>count()</code>, <code>full()</code>, and <code>clear()</code>. Old values are automatically evicted when the window is full.</p>' +
          '<p><strong>Moving Average</strong> \u2014 Push each new reading into the window with <code>window:add(value)</code>, then call <code>window:average()</code>. With a window size of 5, the average always reflects the last 5 readings, smoothing out random noise. Larger windows produce smoother but more delayed results.</p>' +
          '<p><strong>Spike Detection</strong> \u2014 Compute <code>window:max() - window:min()</code> to get the range within the window. If this deviation exceeds a threshold (3.0\u00b0C here), flag it as a spike. This detects sudden changes without comparing individual values to static thresholds.</p>' +
          '<p><strong>Liquid Templates</strong> \u2014 DotLiquid templates (<code>sink.transform.type: liquid</code>) format output as structured JSON. Access data with <code>{{Message.Data}}</code>, <code>{{Message.Data.field}}</code>, and <code>{{Message.Timestamp}}</code>. Each item can have its own template for different output shapes.</p>' +
          '<p><strong>Cross-Item Cache Reads</strong> \u2014 <code>cache("sliding_window/Temperature", 0)</code> reads another item\u2019s cached value using the absolute path <code>sourceName/itemName</code>. The second argument is the default when the cache entry doesn\u2019t exist yet. Items evaluate in order, so Temperature runs before its dependents.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua modules)' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '11', label: '11 \u2014 Templates & Formatting' },
          { page: '20', label: '20 \u2014 Report By Exception' }
        ]
      }
    }
  ]
};
