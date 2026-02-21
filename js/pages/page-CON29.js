/**
 * 29 — Performance Tuning & Ring Buffer
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON29'] = {
  id: 'CON29',
  title: 'CON29 \u2014 Performance Tuning',
  file: 'content/CON29-performance-tuning.md',
  hotspots: [
    {
      id: 'ring-buffer',
      startLine: 16, startCol: 3, endLine: 42, endCol: 87,
      label: 'Ring Buffer Sizing',
      panel: {
        title: 'Ring Buffer \u2014 Size It Right',
        body:
          '<p>The Disruptor ring buffer size is set via <code>app.ring_buffer</code> and <strong>must be a power of 2</strong>.</p>' +
          '<ul>' +
          '<li><strong>Why power of 2?</strong> \u2014 The Disruptor pattern uses bitwise AND for index wrapping: <code>index = sequence & (size - 1)</code>. This is faster than modulo.</li>' +
          '<li><strong>Default: 4096</strong> \u2014 Handles most workloads. Only increase if you see backpressure or have bursty data.</li>' +
          '<li><strong>Larger = more burst capacity</strong> \u2014 Absorbs spikes when sinks are temporarily slow. Costs more memory.</li>' +
          '<li><strong>Smaller = lower latency</strong> \u2014 Tighter loop, less memory. But backpressure arrives sooner under load.</li>' +
          '</ul>' +
          '<p>If unsure, start with 4096 and monitor <code>LastLoopMs</code> via <code>GET /status</code>.</p>',
        yaml:
          'app:\n' +
          '  ring_buffer: !!int 4096   # default\n' +
          '  # ring_buffer: !!int 16384  # high-throughput\n' +
          '  # ring_buffer: !!int 1024   # low-memory edge',
        related: [
          { page: 'CON05', hotspot: 'performance', label: 'CON05 \u2014 Performance by design' },
          { page: 'CON04', hotspot: 'app-section', label: 'CON04 \u2014 App configuration block' },
          { page: 'CON29', hotspot: 'backpressure', label: 'Backpressure and slow sinks' }
        ]
      }
    },
    {
      id: 'scan-interval',
      startLine: 50, startCol: 3, endLine: 75, endCol: 87,
      label: 'Scan Interval Tuning',
      panel: {
        title: 'scan_interval \u2014 Frequency vs. CPU',
        body:
          '<p><code>scan_interval</code> (in milliseconds) controls how often a source reads from its device.</p>' +
          '<ul>' +
          '<li><strong>100ms</strong> \u2014 Real-time dashboards, vibration monitoring. 10 reads/sec. High CPU.</li>' +
          '<li><strong>1000ms</strong> \u2014 Typical monitoring (default). Good balance of freshness and CPU.</li>' +
          '<li><strong>5000ms+</strong> \u2014 Slow-changing data like temperature, humidity, energy meters. Very low CPU.</li>' +
          '</ul>' +
          '<p>Combine with <code>execute_every</code> to run individual items at different effective rates without needing separate sources.</p>' +
          '<p><strong>Rule of thumb:</strong> Set scan_interval to the fastest item you need, then use execute_every to throttle slower items.</p>',
        yaml:
          'sources:\n' +
          '  - name: fast_plc\n' +
          '    scan_interval: !!int 100    # 10 Hz\n' +
          '  - name: slow_sensor\n' +
          '    scan_interval: !!int 5000   # every 5s',
        related: [
          { page: 'CON20', hotspot: 'execute-every', label: 'CON20 \u2014 every throttle' },
          { page: 'CON04', hotspot: 'source-anatomy', label: 'CON04 \u2014 Source configuration' },
          { page: 'CON29', hotspot: 'bottlenecks', label: 'Finding bottlenecks with $SYSTEM' }
        ]
      }
    },
    {
      id: 'double-buffer',
      startLine: 104, startCol: 3, endLine: 135, endCol: 87,
      label: 'Double-Buffer Pattern',
      panel: {
        title: 'Double-Buffer \u2014 Decoupling Read and Write Speeds',
        body:
          '<p>Each sink uses a <strong>double-buffer pattern</strong> to prevent slow writes from blocking the ring buffer:</p>' +
          '<ol>' +
          '<li><strong>Receive Buffer [A]</strong> \u2014 Messages from the ring buffer accumulate here continuously</li>' +
          '<li><strong>Atomic Swap</strong> \u2014 On each sink timer tick, buffers A and B are swapped in O(1) time (pointer exchange)</li>' +
          '<li><strong>Write Buffer [B]</strong> \u2014 The sink writes from this buffer to the destination (InfluxDB, MQTT, etc.)</li>' +
          '</ol>' +
          '<p><strong>Key benefits:</strong></p>' +
          '<ul>' +
          '<li>The ring buffer is never blocked by slow sinks \u2014 messages always flow to the receive buffer</li>' +
          '<li>Each sink has its own independent buffer pair \u2014 a slow InfluxDB sink does not affect a fast MQTT sink</li>' +
          '<li>Batch writes are natural \u2014 the write buffer contains all messages since the last swap</li>' +
          '</ul>',
        related: [
          { page: 'CON05', hotspot: 'performance', label: 'CON05 \u2014 Performance by design' },
          { page: 'CON29', hotspot: 'backpressure', label: 'What happens under backpressure' }
        ]
      }
    },
    {
      id: 'backpressure',
      startLine: 143, startCol: 3, endLine: 168, endCol: 87,
      label: 'Backpressure \u2014 Slow Sinks',
      panel: {
        title: 'Backpressure \u2014 When Sinks Cannot Keep Up',
        body:
          '<p>Backpressure occurs when a sink writes slower than the ring buffer fills its receive buffer.</p>' +
          '<p><strong>Symptoms:</strong></p>' +
          '<ul>' +
          '<li>Memory usage grows steadily over time</li>' +
          '<li><code>LastLoopMs</code> increases on the affected sink (via <code>GET /status</code>)</li>' +
          '<li>Destination data falls behind real-time</li>' +
          '</ul>' +
          '<p><strong>Solutions (in order of impact):</strong></p>' +
          '<ol>' +
          '<li>Enable RBE (<code>rbe: !!bool true</code>) \u2014 often reduces volume by 90%+</li>' +
          '<li>Add <code>include_filter</code> to the sink \u2014 only receive messages you actually need</li>' +
          '<li>Increase sink <code>scan_interval</code> \u2014 larger batches write more efficiently</li>' +
          '<li>Use <code>execute_every</code> to throttle low-priority items at the source</li>' +
          '<li>Check destination health \u2014 network latency, database load, disk I/O</li>' +
          '</ol>',
        related: [
          { page: 'CON20', label: 'CON20 \u2014 RBE reduces volume by 90%+' },
          { page: 'CON29', hotspot: 'ring-buffer', label: 'Ring buffer sizing' },
          { page: 'EX30', label: 'EX30 \u2014 Analytics Pipeline' }
        ]
      }
    },
    {
      id: 'bottlenecks',
      startLine: 176, startCol: 3, endLine: 211, endCol: 87,
      label: 'Finding Bottlenecks with /status',
      panel: {
        title: '/status Metrics \u2014 Built-In Performance Diagnostics',
        body:
          '<p>Every connector exposes timing and health metrics via the REST API at <code>GET /status</code>. Use these to pinpoint bottlenecks.</p>' +
          '<ul>' +
          '<li><strong>LastLoopMs</strong> \u2014 End-to-end time for one scan cycle. If this exceeds <code>scan_interval</code>, the source cannot keep up.</li>' +
          '<li><strong>LastScriptMs</strong> \u2014 Time spent in Lua/Python transforms. High values mean your script needs optimization.</li>' +
          '<li><strong>MinimumReadMs / MaximumReadMs</strong> \u2014 Fastest and slowest device reads. A large gap indicates intermittent device or network issues.</li>' +
          '<li><strong>MessagesAttempted vs. MessagesAccepted</strong> \u2014 Reveals RBE effectiveness. If Attempted >> Accepted, RBE is filtering well.</li>' +
          '</ul>' +
          '<p>Access via REST API at <code>GET /status</code> or in real time via the WebSocket at port 9998.</p>',
        yaml:
          '# Check via REST API:\n' +
          '$ curl http://localhost:9999/status\n' +
          '\n' +
          '# Key metrics per connector:\n' +
          '#   LastLoopMs      - full cycle time\n' +
          '#   LastScriptMs    - Lua/Python duration\n' +
          '#   MinimumReadMs   - fastest device read\n' +
          '#   MaximumReadMs   - slowest device read',
        related: [
          { page: 'CON18', label: 'CON18 \u2014 Health & fault tracking' },
          { page: 'CON16', label: 'CON16 \u2014 Admin API reference' },
          { page: 'CON30', label: 'CON30 \u2014 Troubleshooting guide' }
        ]
      }
    }
  ]
};
