/**
 * EX09 — Fanuc Robot
 * Fanuc industrial robot: joint positions, cartesian coords, I/O, system variables.
 */

DIME_PAGES['EX09'] = {
  id: 'EX09',
  title: 'EX09 \u2014 Fanuc Robot',
  file: 'content/EX09-fanuc-robot.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex09-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Fanuc Robot \u2014 Overview',
        body:
          '<p>Connect to a Fanuc industrial robot controller over Ethernet and read real-time operational data:</p>' +
          '<ul>' +
          '<li><strong>Digital I/O</strong> \u2014 User Output bits (UO.0\u20132) for system ready, program run, and pause states</li>' +
          '<li><strong>Derived state</strong> \u2014 Lua script combines cached I/O bits into a human-readable Execution state (ACTIVE, READY, STOPPED, OPTIONAL_STOP)</li>' +
          '<li><strong>Position data</strong> \u2014 Cartesian coordinates (X) and joint angles (J1) from position registers and world coordinates</li>' +
          '<li><strong>System variables</strong> \u2014 Deep robot internals: program name, program ID, line number, joint torque</li>' +
          '</ul>' +
          '<p>This demonstrates the full spectrum of Fanuc data access through a single DIME connector, using Lua to transform raw signals into meaningful operational metrics.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'CON10', label: 'CON10 \u2014 Cache API' },
          { page: 'REF08', label: 'REF08 \u2014 Fanuc Robot' }
        ]
      }
    },
    {
      id: 'ex09-dataflow',
      startLine: 13, startCol: 2, endLine: 43, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Fanuc Robot \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>The Fanuc connector uses the SRTP (Service Request Transport Protocol) over Ethernet to communicate with the robot controller at 10.1.1.200.</p>' +
          '<p><strong>Data categories read every 1 second:</strong></p>' +
          '<ul>' +
          '<li><strong>Digital I/O (UO.0\u20134)</strong> \u2014 Binary signals indicating system readiness, program execution, and pause state</li>' +
          '<li><strong>Position Registers</strong> \u2014 Structured objects containing both Cartesian (X/Y/Z) and Joint (J1\u2013J6) positions</li>' +
          '<li><strong>System Variables</strong> \u2014 Internal Fanuc variables like <code>$MOR_GRP[1].$cur_prog_id</code> for program tracking</li>' +
          '<li><strong>World Coordinates</strong> \u2014 Current world-frame Cartesian position and joint positions</li>' +
          '</ul>' +
          '<p>The console sink uses <code>exclude_filter: fanuc1/$SYSTEM</code> to hide DIME system messages and show only robot data.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON08', label: 'CON08 \u2014 Filtering' }
        ]
      }
    },
    {
      id: 'ex09-config',
      startLine: 45, startCol: 2, endLine: 160, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File YAML \u2014 3 Files',
        body:
          '<p>Three files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>main.yaml</strong> \u2014 Wires the Fanuc source to the console sink</li>' +
          '<li><strong>fanuc1.yaml</strong> \u2014 Full Fanuc robot source with 15+ items covering I/O, positions, registers, and system variables</li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink with <code>use_sink_transform: true</code> and system message filtering</li>' +
          '</ul>' +
          '<p><strong>Key patterns in the Fanuc config:</strong></p>' +
          '<ul>' +
          '<li><strong>Cache-and-derive</strong> \u2014 UO0\u2013UO2 items cache raw I/O with <code>set()</code> + <code>return nil</code>, then the Execution item reads cached values with <code>cache()</code> to compute state</li>' +
          '<li><strong>Structured access</strong> \u2014 <code>result.CartesianPosition.X</code> extracts fields from complex position register objects</li>' +
          '<li><strong>sink.transform.template: Message.Data</strong> \u2014 Strips the MessageBoxMessage envelope so sinks receive only the data value</li>' +
          '</ul>',
        related: [
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua)' }
        ]
      }
    },
    {
      id: 'ex09-cache-derive',
      startLine: 80, startCol: 2, endLine: 113, endCol: 85,
      label: 'Cache-and-Derive Pattern',
      panel: {
        title: 'Cache-and-Derive \u2014 Combining Signals',
        body:
          '<p>A powerful DIME pattern for combining multiple raw signals into a single derived value:</p>' +
          '<ol>' +
          '<li><strong>Cache raw signals</strong> \u2014 Items UO0, UO1, UO2 each read a digital I/O bit and store it with <code>set(\'./SysReady\', result)</code>. The <code>return nil</code> suppresses publishing the raw bit to the ring buffer.</li>' +
          '<li><strong>Derive from cache</strong> \u2014 The Execution item has no hardware address. It reads cached values with <code>cache(\'./SysReady\', 0)</code> (0 as default) and uses Lua logic to return a state string.</li>' +
          '</ol>' +
          '<p><strong>State machine logic:</strong></p>' +
          '<ul>' +
          '<li>SysReady=1, PgmRun=1, PgmPause=0 \u2192 <code>"ACTIVE"</code></li>' +
          '<li>SysReady=1, PgmRun=1, PgmPause=1 \u2192 <code>"OPTIONAL_STOP"</code></li>' +
          '<li>SysReady=1, else \u2192 <code>"READY"</code></li>' +
          '<li>SysReady=0 \u2192 <code>"STOPPED"</code></li>' +
          '</ul>' +
          '<p>This pattern applies to any scenario where you need to combine multiple raw data points into a single meaningful metric.</p>',
        related: [
          { page: 'CON10', label: 'CON10 \u2014 Cache API (set/cache)' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting Deep Dive' }
        ]
      }
    },
    {
      id: 'ex09-keyconcepts',
      startLine: 161, startCol: 2, endLine: 186, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Fanuc Address Types</strong> \u2014 The connector supports multiple register families: <code>UO</code> (User Outputs), <code>PositionRegisters</code>, <code>StringRegisters</code>, <code>IntegerSystemVariables</code>, <code>StringSystemVariables</code>, <code>worldCartesianPosition</code>, <code>worldJointPosition</code>. Each uses dot notation like <code>UO.0</code> or <code>worldCartesianPosition.X</code>.</p>' +
          '<p><strong>Structured Results</strong> \u2014 Position registers return complex .NET objects. Lua scripts extract fields directly: <code>result.CartesianPosition.X</code> and <code>result.JointsPosition.J1</code>. This works because NLua provides seamless interop with .NET objects.</p>' +
          '<p><strong>System Variables</strong> \u2014 Fanuc\u2019s internal variables use <code>$</code> prefix paths like <code>$MOR_GRP[1].$cur_prog_id</code>. These expose deep robot internals: currently running program, line number, and joint torques.</p>' +
          '<p><strong>Sink Transform</strong> \u2014 The source defines <code>sink.transform.template: Message.Data</code> which tells sinks to extract only the data payload (not the full <code>MessageBoxMessage</code> envelope). The console sets <code>use_sink_transform: true</code> to apply this transform.</p>',
        related: [
          { page: 'CON10', label: 'CON10 \u2014 Cache API' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua & Python)' },
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' }
        ]
      }
    }
  ]
};
