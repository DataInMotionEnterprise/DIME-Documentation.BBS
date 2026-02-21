/**
 * EX07 — Beckhoff ADS
 * TwinCAT ADS protocol. AMS Net ID addressing, typed PLC variables, multiple source instances.
 */
DIME_PAGES['EX07'] = {
  id: 'EX07',
  title: 'EX07 \u2014 Beckhoff ADS',
  file: 'content/EX07-beckhoff-ads.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex07-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Beckhoff ADS \u2014 Overview',
        body:
          '<p>This example reads PLC variables from a Beckhoff TwinCAT 3 runtime using the ADS (Automation Device Specification) protocol. It demonstrates:</p>' +
          '<ul>' +
          '<li><strong>BeckhoffADS connector</strong> \u2014 Native TwinCAT communication using AMS Net ID routing</li>' +
          '<li><strong>AMS Net ID addressing</strong> \u2014 6-octet addresses (e.g., <code>192.168.111.191.1.1</code>) that route messages between ADS devices</li>' +
          '<li><strong>Typed PLC variables</strong> \u2014 TwinCAT symbol paths like <code>MAIN.testBool1</code> with explicit type declarations</li>' +
          '<li><strong>Multiple source instances</strong> \u2014 Two independent ADS connections to the same controller, each with its own scan loop</li>' +
          '</ul>' +
          '<p>Two sources reading the same PLC demonstrates how DIME creates unique message paths (<code>adsSource1/bool1</code> vs <code>adsSource2/bool1</code>) for identical variables from different connections.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX04', label: 'EX04 \u2014 Siemens S7 PLC' },
          { page: 'REF03', label: 'REF03 \u2014 Beckhoff ADS' }
        ]
      }
    },
    {
      id: 'ex07-dataflow',
      startLine: 13, startCol: 2, endLine: 44, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: '2 ADS Sources \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>Two ADS source connections feed data into a shared ring buffer:</p>' +
          '<ul>' +
          '<li><strong>ADS Source 1</strong> \u2014 Connects to <code>192.168.111.191:851</code> (TwinCAT 3 Runtime 1). Reads <code>MAIN.testBool1</code> and <code>MAIN.testDint1</code> every 500ms.</li>' +
          '<li><strong>ADS Source 2</strong> \u2014 Identical connection and items, but with a different source name. Messages arrive as <code>adsSource2/bool1</code> instead of <code>adsSource1/bool1</code>.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Prints all data values. Uses <code>exclude_filter</code> with two entries to suppress <code>$SYSTEM</code> messages from both sources.</li>' +
          '</ul>' +
          '<p>The AMS Net ID <code>192.168.111.191.1.1</code> identifies the TwinCAT target. The <code>local_netid: 1.1.1.1.1.1</code> identifies the DIME host. Both must exist in the TwinCAT ADS routing table.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'ex07-config',
      startLine: 46, startCol: 2, endLine: 139, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File ADS Configuration',
        body:
          '<p>Four YAML files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>adsSource1.yaml</strong> \u2014 First ADS connection with AMS Net ID, port, and typed items</li>' +
          '<li><strong>adsSource2.yaml</strong> \u2014 Second ADS connection (identical config, different name)</li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink with dual <code>exclude_filter</code> entries</li>' +
          '<li><strong>main.yaml</strong> \u2014 App settings referencing all 3 anchors</li>' +
          '</ul>' +
          '<p><strong>Key ADS properties:</strong></p>' +
          '<ul>' +
          '<li><code>local_netid: 1.1.1.1.1.1</code> \u2014 AMS Net ID of the DIME host machine</li>' +
          '<li><code>target_ip</code> \u2014 TCP/IP address of the TwinCAT controller</li>' +
          '<li><code>address: 192.168.111.191.1.1</code> \u2014 Target AMS Net ID (6 octets)</li>' +
          '<li><code>port: 851</code> \u2014 ADS port for TwinCAT 3 Runtime 1</li>' +
          '</ul>',
        yaml:
          '# ADS item addressing:\n' +
          'items:\n' +
          '  - name: bool1\n' +
          '    type: bool              # PLC BOOL\n' +
          '    address: MAIN.testBool1 # TwinCAT symbol path\n' +
          '  - name: int1\n' +
          '    type: int               # PLC DINT\n' +
          '    address: MAIN.testDint1',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML Basics' },
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex07-keyconcepts',
      startLine: 141, startCol: 2, endLine: 166, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>ADS Protocol</strong> \u2014 Beckhoff ADS (Automation Device Specification) is TwinCAT\u2019s native communication layer. It uses AMS (Automation Message Specification) Net IDs \u2014 6-octet addresses like <code>192.168.111.191.1.1</code> \u2014 to route messages between devices. Both source and target must have matching ADS routes configured.</p>' +
          '<p><strong>AMS Net ID</strong> \u2014 The <code>address</code> field holds the target\u2019s AMS Net ID, and <code>local_netid</code> identifies the DIME host. The TwinCAT Route Manager on both machines must have entries for each other. The <code>target_ip</code> field provides the TCP/IP address for the underlying transport.</p>' +
          '<p><strong>ADS Port Numbers</strong> \u2014 Port 851 addresses TwinCAT 3 Runtime 1 (the first PLC instance). Port 852 = Runtime 2, and so on. TwinCAT 2 uses port 801 for Runtime 1. Each runtime is an independent PLC execution environment with its own symbol table.</p>' +
          '<p><strong>Symbol Addressing</strong> \u2014 Items use TwinCAT symbol paths: <code>MAIN.testBool1</code> accesses variable <code>testBool1</code> declared in program <code>MAIN</code>. The <code>type</code> field (<code>bool</code>, <code>int</code>) tells DIME how to interpret the raw PLC memory bytes.</p>' +
          '<p><strong>Multiple Source Instances</strong> \u2014 Creating two sources to the same PLC is useful for separating fast-scan and slow-scan variable groups, or for organizing tags by functional area. Each source has its own connection, scan loop, and message path prefix.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' },
          { page: 'CON20', label: 'CON20 \u2014 Report By Exception' }
        ]
      }
    }
  ]
};
