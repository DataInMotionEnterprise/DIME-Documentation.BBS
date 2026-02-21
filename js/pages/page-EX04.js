/**
 * EX04 — Siemens S7 PLC
 * Native S7 protocol for S7-1200/1500. Bool/word data types, I/O addressing.
 */
DIME_PAGES['EX04'] = {
  id: 'EX04',
  title: 'EX04 \u2014 Siemens S7 PLC',
  file: 'content/EX04-siemens-s7-plc.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex04-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Siemens S7 PLC \u2014 Overview',
        body:
          '<p>This example reads digital inputs and outputs directly from a Siemens S7-1200 PLC using the native S7comm protocol. It demonstrates:</p>' +
          '<ul>' +
          '<li><strong>SiemensS7 connector</strong> \u2014 Direct PLC communication on port 102 (ISO-TSAP), no OPC server required</li>' +
          '<li><strong>PLC type selection</strong> \u2014 The <code>type: S71200</code> field configures the protocol variant for the target PLC family</li>' +
          '<li><strong>I/O addressing</strong> \u2014 Items use S7 area-based addresses like <code>I0.0</code> (Input) and <code>Q0.0</code> (Output)</li>' +
          '<li><strong>System message filtering</strong> \u2014 The console sink uses <code>exclude_filter</code> to suppress <code>$SYSTEM</code> heartbeat messages</li>' +
          '</ul>' +
          '<p>This is the simplest industrial protocol example \u2014 two boolean tags from a real PLC, printed to console.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX03', label: 'EX03 \u2014 OPC-UA Client Reads' },
          { page: 'REF30', label: 'REF30 \u2014 Siemens S7' }
        ]
      }
    },
    {
      id: 'ex04-dataflow',
      startLine: 13, startCol: 2, endLine: 32, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'S7 PLC \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>Data flows from a Siemens S7 PLC to the console:</p>' +
          '<ul>' +
          '<li><strong>S7 Source</strong> \u2014 Connects to <code>192.168.1.90:102</code> using native S7comm. Reads two boolean I/O points every 500ms.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 With RBE enabled, only changed values are published. Boolean I/O typically changes infrequently, so RBE dramatically reduces traffic.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Prints value changes to stdout. The <code>exclude_filter</code> blocks <code>s7Source1/$SYSTEM</code> messages so only <code>input0</code> and <code>output0</code> appear.</li>' +
          '</ul>' +
          '<p>The S7 protocol connects directly to the PLC CPU \u2014 no middleware or OPC server sits between DIME and the controller.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex04-config',
      startLine: 34, startCol: 2, endLine: 96, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File S7 Configuration',
        body:
          '<p>Three YAML files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>s7Source1.yaml</strong> \u2014 S7 source with PLC type, IP address, rack/slot, and two boolean items</li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink with <code>exclude_filter</code> for system messages</li>' +
          '<li><strong>main.yaml</strong> \u2014 App settings and anchor references</li>' +
          '</ul>' +
          '<p><strong>Key S7 properties:</strong></p>' +
          '<ul>' +
          '<li><code>type: S71200</code> \u2014 PLC family (S71200 or S71500)</li>' +
          '<li><code>port: 102</code> \u2014 ISO-TSAP, the standard S7 communication port</li>' +
          '<li><code>rack/slot</code> \u2014 Physical CPU location; 0/0 for S7-1200 and S7-1500</li>' +
          '<li><code>address: I0.0</code> \u2014 Area-based: I=Input, Q=Output, DB=DataBlock</li>' +
          '</ul>',
        yaml:
          '# S7 item addressing:\n' +
          'items:\n' +
          '  - name: input0\n' +
          '    type: bool           # bool, int, word, real\n' +
          '    address: I0.0        # Input byte 0, bit 0\n' +
          '  - name: output0\n' +
          '    type: bool\n' +
          '    address: Q0.0        # Output byte 0, bit 0',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML Basics' },
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex04-keyconcepts',
      startLine: 98, startCol: 2, endLine: 121, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>S7 Protocol</strong> \u2014 The <code>SiemensS7</code> connector uses the native S7comm protocol over ISO-TSAP (port 102). It communicates directly with the PLC CPU without requiring an OPC server. Supports S7-1200 and S7-1500 PLCs via the <code>type</code> field.</p>' +
          '<p><strong>I/O Addressing</strong> \u2014 S7 uses area-based addressing: <code>I0.0</code> = Input area, byte 0, bit 0. <code>Q0.0</code> = Output area, byte 0, bit 0. For data blocks, use <code>DB1.DBX0.0</code> (bit), <code>DB1.DBW0</code> (word), or <code>DB1.DBD0</code> (double word). The <code>type</code> field (bool, int, word, real) tells DIME how to decode the raw bytes.</p>' +
          '<p><strong>Rack and Slot</strong> \u2014 These identify the physical CPU location in the PLC rack. For S7-1200 and S7-1500, use <code>rack: 0, slot: 0</code>. Older S7-300 may use <code>slot: 2</code>. Getting these wrong causes connection failure.</p>' +
          '<p><strong>Script Lifecycle Hooks</strong> \u2014 The four script hooks (<code>init_script</code>, <code>enter_script</code>, <code>exit_script</code>, <code>deinit_script</code>) are all shown as <code>~</code> (null). This documents the full lifecycle surface even when no scripting is needed. Use them for initialization, pre-scan setup, post-scan cleanup, or shutdown logic.</p>' +
          '<p><strong>$SYSTEM Filtering</strong> \u2014 Every source publishes heartbeat messages to <code>sourceName/$SYSTEM</code> with connection health data. The <code>exclude_filter</code> on the console sink blocks these so only real data items appear in output.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lifecycle Hooks)' },
          { page: 'CON20', label: 'CON20 \u2014 Report By Exception' }
        ]
      }
    }
  ]
};
