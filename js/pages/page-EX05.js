/**
 * EX05 — Modbus TCP Registers
 * Modbus holding registers with Lua struct library for binary decode.
 */
DIME_PAGES['EX05'] = {
  id: 'EX05',
  title: 'EX05 \u2014 Modbus TCP Registers',
  file: 'content/EX05-modbus-tcp-registers.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex05-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Modbus TCP Registers \u2014 Overview',
        body:
          '<p>This example reads holding registers from a Banner Engineering device over Modbus TCP. It demonstrates:</p>' +
          '<ul>' +
          '<li><strong>ModbusTCP connector</strong> \u2014 Polls Modbus slave devices on port 502 using standard function codes</li>' +
          '<li><strong>Register-type addressing</strong> \u2014 Each item specifies a function code (type), starting address, and register count</li>' +
          '<li><strong>Multi-register reads</strong> \u2014 Reading 2 consecutive 16-bit registers for 32-bit values</li>' +
          '<li><strong>Lua struct library</strong> \u2014 Loaded in <code>init_script</code> for binary decoding of raw register data</li>' +
          '</ul>' +
          '<p>Modbus is the most widely deployed industrial protocol. Nearly every sensor, VFD, power meter, and gateway speaks it.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: 'EX04', label: 'EX04 \u2014 Siemens S7 PLC' },
          { page: 'REF16', label: 'REF16 \u2014 ModbusTCP' }
        ]
      }
    },
    {
      id: 'ex05-dataflow',
      startLine: 14, startCol: 2, endLine: 35, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Modbus Device \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>Data flows from a Modbus TCP device to the console:</p>' +
          '<ul>' +
          '<li><strong>Modbus Source</strong> \u2014 Connects to <code>192.168.111.215:502</code> with slave ID 199. Reads holding registers (FC 03) every 1000ms.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Register values are published as arrays. Single-register items return a scalar via <code>result[0]</code>; multi-register items return the full array.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Prints register values to stdout. System messages are filtered out.</li>' +
          '</ul>' +
          '<p>The <code>init_script</code> loads the Lua <code>struct</code> library once at startup, making it available to all item scripts for binary decoding of multi-register values.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '09', label: '09 \u2014 Scripting (init_script)' }
        ]
      }
    },
    {
      id: 'ex05-config',
      startLine: 37, startCol: 2, endLine: 124, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File Modbus Configuration',
        body:
          '<p>Three YAML files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>modbusSource1.yaml</strong> \u2014 Modbus source with device address, slave ID, struct library init, and 5 register items</li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink with system message filtering</li>' +
          '<li><strong>main.yaml</strong> \u2014 App settings and anchor references</li>' +
          '</ul>' +
          '<p><strong>Key Modbus properties:</strong></p>' +
          '<ul>' +
          '<li><code>slave: 199</code> \u2014 Modbus unit/slave ID for the target device</li>' +
          '<li><code>type: 3</code> \u2014 Function code 03 (Read Holding Registers)</li>' +
          '<li><code>address: 10011</code> \u2014 Starting register number</li>' +
          '<li><code>count: 2</code> \u2014 Number of 16-bit registers to read (2 = 32 bits)</li>' +
          '</ul>',
        yaml:
          '# Modbus register addressing:\n' +
          'items:\n' +
          '  - name: ResyncTimer\n' +
          '    type: !!int 3          # FC 03 = Holding Register\n' +
          '    address: !!int 10011   # Start register\n' +
          '    count: !!int 1         # 1 register = 16 bits\n' +
          '    script: |\n' +
          '      return result[0]     # Extract scalar',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '21', label: '21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex05-keyconcepts',
      startLine: 126, startCol: 2, endLine: 151, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Modbus Function Codes</strong> \u2014 The <code>type</code> field maps directly to Modbus function codes: 1=Coils (FC 01), 2=Discrete Inputs (FC 02), 3=Holding Registers (FC 03), 4=Input Registers (FC 04). Holding registers (type 3) are the most common for reading process data.</p>' +
          '<p><strong>Multi-Register Reads</strong> \u2014 Modbus registers are 16-bit. For 32-bit values (floats, DINTs), set <code>count: 2</code> to read two consecutive registers. The <code>result</code> is an array indexed from 0. Use the Lua <code>struct</code> library to decode: <code>struct.unpack(\'>f\', bytes)</code> for big-endian float.</p>' +
          '<p><strong>Lua struct Library</strong> \u2014 Loaded once in <code>init_script</code> with <code>struct = require(\'struct\')</code>. Provides <code>struct.pack()</code> and <code>struct.unpack()</code> for converting between raw bytes and typed values. Essential for decoding multi-register Modbus data into usable numbers.</p>' +
          '<p><strong>Slave/Unit ID</strong> \u2014 Every Modbus TCP device has a unit ID. For standalone devices it is typically 1 or 255. Gateways that bridge to serial Modbus RTU devices use the unit ID to route requests to downstream slaves. This Banner device uses ID 199.</p>' +
          '<p><strong>init_script Pattern</strong> \u2014 Use <code>init_script</code> to load Lua libraries once at startup rather than in every item script. This avoids redundant <code>require()</code> calls on each scan cycle and keeps item scripts focused on data transformation.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '09', label: '09 \u2014 Scripting (Lua Libraries)' },
          { page: '20', label: '20 \u2014 Report By Exception' }
        ]
      }
    }
  ]
};
