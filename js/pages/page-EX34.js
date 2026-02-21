/**
 * EX34 — UDP Binary Protocol
 * UDP server: Lua struct library for binary parsing, deadzone filtering.
 */
DIME_PAGES['EX34'] = {
  id: 'EX34',
  title: 'EX34 \u2014 UDP Binary Protocol',
  file: 'content/EX34-udp-binary-protocol.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex34-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'UDP Binary Protocol \u2014 Overview',
        body:
          '<p>This example parses <strong>binary UDP packets</strong> from an industrial overhead crane controller using Lua bitwise operations:</p>' +
          '<ul>' +
          '<li><strong>30-byte binary messages</strong> \u2014 Encodes microspeed, anti-sway, crane status, 3-axis motion data, motor current/frequency, and hoist load cell readings</li>' +
          '<li><strong>Lua bitwise parsing</strong> \u2014 Big-endian uint16 extraction using <code>(result[22] &lt;&lt; 8) + result[23]</code> with division for fixed-point scaling</li>' +
          '<li><strong>Deadzone filtering</strong> \u2014 Custom <code>filter()</code> function suppresses analog value changes within configurable thresholds (0.5A for current, 1Hz for frequency)</li>' +
          '<li><strong>emit() fan-out</strong> \u2014 One UDP packet produces 20+ observations for 3 axes (X/Y/Z), each with Current, Frequency, State, Direction, Velocity, and Condition</li>' +
          '</ul>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '12', label: '12 \u2014 emit() Function' },
          { page: 'REF38', label: 'REF38 \u2014 UDP Server' }
        ]
      }
    },
    {
      id: 'ex34-dataflow',
      startLine: 14, startCol: 2, endLine: 46, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'UDP Packets \u2192 Binary Parse \u2192 emit() Fan-Out',
        body:
          '<p>One UDP packet is transformed into 20+ structured observations:</p>' +
          '<ol>' +
          '<li><strong>UDP Server</strong> \u2014 Listens on port 2232 with 100ms scan interval for responsive crane monitoring. The <code>result</code> variable is a byte array</li>' +
          '<li><strong>Binary Parsing</strong> \u2014 Lua reads individual bytes for discrete values and combines byte pairs for 16-bit values: <code>((result[22] &lt;&lt; 8) + result[23]) / 10</code> for trolley current in amps</li>' +
          '<li><strong>Deadzone Filter</strong> \u2014 Before emitting analog values, the <code>filter()</code> function checks if the change exceeds a deadzone. Current uses 0.5A, frequency uses 1Hz, mass uses 10kg, load uses 3%</li>' +
          '<li><strong>emit() Fan-Out</strong> \u2014 Each axis gets 6+ items: Current, Frequency, State (STOPPED/TRAVEL), Direction (POSITIVE/NEGATIVE/NONE), Velocity, Condition (NORMAL/FAULT). The hoist adds Mass and Load</li>' +
          '</ol>' +
          '<p>The script returns <code>nil</code> \u2014 all output goes through <code>emit()</code>.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '09', label: '09 \u2014 Scripting' }
        ]
      }
    },
    {
      id: 'ex34-config',
      startLine: 46, startCol: 2, endLine: 135, endCol: 85,
      label: 'YAML Configuration & Binary Format',
      panel: {
        title: 'UdpServer + Binary Parsing Configuration',
        body:
          '<p>A minimal 3-file configuration with substantial Lua logic in the item script:</p>' +
          '<ul>' +
          '<li><strong>udp.yaml</strong> \u2014 UdpServer connector on port 2232, 100ms scan, deadzone filter function in <code>init_script</code>, and a single <code>message</code> item with ~120 lines of binary parsing and emit() calls</li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink with <code>exclude_filter: 2232/$SYSTEM</code></li>' +
          '<li><strong>main.yaml</strong> \u2014 Standard composition</li>' +
          '</ul>' +
          '<p>The binary message format maps 30 bytes to crane state: bytes 0-9 for status/mode, bytes 10-15 for 3-axis speed commands, bytes 16-27 for motor current/frequency pairs, bytes 28-29 for hoist load cell.</p>',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '12', label: '12 \u2014 emit() Function' }
        ]
      }
    },
    {
      id: 'ex34-keyconcepts',
      startLine: 170, startCol: 2, endLine: 196, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Binary Parsing in Lua</strong> \u2014 The <code>result</code> variable is a byte array. Lua\u2019s bitwise shift operators combine big-endian uint16 values: <code>((result[22] &lt;&lt; 8) + result[23]) / 10</code> extracts trolley current. Load cell weight is converted from lbs to kg with <code>/ 2.205</code>.</p>' +
          '<p><strong>Deadzone Filtering</strong> \u2014 The <code>filter()</code> function stores previous values in Lua global variables (<code>_G[name]</code>). If the absolute change is less than the deadzone threshold, the emit is suppressed. This dramatically reduces message traffic from noisy analog sensors without losing significant changes.</p>' +
          '<p><strong>emit() Fan-Out</strong> \u2014 One UDP packet produces 20+ observations. Each axis gets State, Direction, Velocity, Current, Frequency, and Condition. The hoist adds Mass and Load. Returning <code>nil</code> suppresses the raw packet.</p>' +
          '<p><strong>Fault Code Mapping</strong> \u2014 The fault byte (<code>result[8]</code>) maps to specific drive faults. <code>moses.include({4}, result[8])</code> checks if the fault code is trolley-specific (code 4). Different fault codes map to different axis Condition items.</p>' +
          '<p><strong>UdpServer Connector</strong> \u2014 DIME listens as a UDP server on the configured port. The 100ms scan provides responsive crane monitoring. UDP is connectionless, so no handshake overhead per message.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting Deep Dive' },
          { page: '12', label: '12 \u2014 emit() Function' },
          { page: '06', label: '06 \u2014 Source Connectors' }
        ]
      }
    }
  ]
};
