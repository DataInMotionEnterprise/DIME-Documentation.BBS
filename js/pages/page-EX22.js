/**
 * EX22 — JSON Web Scraper
 * JSONWebScraper source: REST API polling, JSON path queries, MTConnect sinks.
 */
DIME_PAGES['EX22'] = {
  id: 'EX22',
  title: 'EX22 \u2014 JSON Web Scraper',
  file: 'content/EX22-json-web-scraper.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex22-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'JSON Web Scraper \u2014 Overview',
        body:
          '<p>This example scrapes a public JSON REST API and feeds the extracted data into three MTConnect-oriented sinks. It demonstrates the full pipeline from HTTP fetch to industrial protocol output.</p>' +
          '<ul>' +
          '<li><strong>JSONWebScraper source</strong> \u2014 Polls a GitHub-hosted JSON file every 5 seconds</li>' +
          '<li><strong>JSON path addressing</strong> \u2014 Uses <code>$.catalog.manifestID</code> to navigate nested JSON</li>' +
          '<li><strong>Lua post-processing</strong> \u2014 Decodes and extracts the first array element</li>' +
          '<li><strong>3 sinks</strong> \u2014 Console for debugging, MTConnect Agent for XML, SHDR for pipe-delimited adapter output</li>' +
          '</ul>' +
          '<p>The multi-file config (5 YAML files) shows the standard modular pattern for production deployments.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: 'EX23', label: 'EX23 \u2014 Weather API (another HTTP source)' },
          { page: 'REF14', label: 'REF14 \u2014 JSONWebScraper' },
          { page: 'REF20', label: 'REF20 \u2014 MTConnect Agent' },
          { page: 'REF22', label: 'REF22 \u2014 MTConnect SHDR' }
        ]
      }
    },
    {
      id: 'ex22-dataflow',
      startLine: 13, startCol: 2, endLine: 31, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'REST API \u2192 Ring Buffer \u2192 3 Sinks',
        body:
          '<p>Data flows from the JSONWebScraper through the ring buffer to three sinks:</p>' +
          '<ul>' +
          '<li><strong>JSONWebScraper Source</strong> \u2014 Fetches JSON from the configured <code>uri</code> every 5 seconds. The <code>address</code> field on each item uses JSON path syntax to extract nested values.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Prints raw values to stdout for debugging.</li>' +
          '<li><strong>MTConnect Agent</strong> \u2014 Serves an MTConnect XML document on port 5000. The <code>sink.mtconnect</code> property on items maps data into the MTConnect information model.</li>' +
          '<li><strong>MTConnect SHDR</strong> \u2014 Listens on TCP port 7878 for agent connections. Outputs pipe-delimited SHDR format with heartbeat keep-alive.</li>' +
          '</ul>' +
          '<p>Each sink operates independently via its own ring buffer event handler. The SHDR and Agent sinks both apply <code>use_sink_transform: true</code> to format output according to the source\u2019s transform template.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '07', label: '07 \u2014 Sink Connectors' }
        ]
      }
    },
    {
      id: 'ex22-config',
      startLine: 33, startCol: 2, endLine: 130, endCol: 85,
      label: 'Multi-File YAML Configuration',
      panel: {
        title: '5-File Configuration with JSON Path & MTConnect',
        body:
          '<p>Five YAML files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>json1.yaml</strong> \u2014 The JSONWebScraper source. Sets <code>uri</code> to target URL, uses <code>address: $.catalog.manifestID</code> for JSON path extraction, and includes a Lua script to decode the result.</li>' +
          '<li><strong>agent.yaml</strong> \u2014 MTConnect Agent sink on port 5000. Serves XML conforming to the MTConnect standard.</li>' +
          '<li><strong>shdr.yaml</strong> \u2014 MTConnect SHDR adapter on port 7878. Outputs pipe-delimited data with <code>heartbeat_interval</code> for TCP keep-alive.</li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink for stdout debugging.</li>' +
          '<li><strong>main.yaml</strong> \u2014 Composes all anchors into the final config with <code>app</code>, <code>sources</code>, and <code>sinks</code> arrays.</li>' +
          '</ul>' +
          '<p><strong>Key property:</strong> <code>sink.mtconnect</code> on each item maps the scraped value to an MTConnect data item path like <code>Device[name=device1]/Controller/Load[category=Sample]</code>.</p>',
        yaml:
          '# JSON path query on each item:\n' +
          'items:\n' +
          '  - name: node1\n' +
          '    address: $.catalog.manifestID\n' +
          '    script: |\n' +
          '      return json.decode(result)[1];\n' +
          '    sink:\n' +
          '      mtconnect: Device[name=device1]/\n' +
          '        Controller/Load[category=Sample]',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '21', label: '21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex22-keyconcepts',
      startLine: 132, startCol: 2, endLine: 157, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>JSONWebScraper Connector</strong> \u2014 A polling source that fetches JSON from any HTTP endpoint. The <code>uri</code> is the target URL. Each item\u2019s <code>address</code> uses JSON path syntax (<code>$.path.to.field</code>) to extract specific values from the response. The <code>result</code> variable in scripts contains the extracted value.</p>' +
          '<p><strong>JSON Path Queries</strong> \u2014 JSON path uses <code>$</code> for the root, dot notation for objects, and brackets for arrays. The query <code>$.catalog.manifestID</code> navigates two levels deep. When the result is an array, Lua\u2019s <code>json.decode(result)[1]</code> extracts the first element.</p>' +
          '<p><strong>MTConnect Sink Mapping</strong> \u2014 The <code>sink.mtconnect</code> property on items maps data to the MTConnect information model. The Agent sink (port 5000) serves XML; the SHDR sink (port 7878) produces pipe-delimited adapter output for external agents.</p>' +
          '<p><strong>Lua JSON Library</strong> \u2014 Load once in <code>init_script</code> with <code>json = require(\'json\')</code>. Use <code>json.decode()</code> to parse strings and <code>json.encode()</code> to serialize tables. Always load libraries in <code>init_script</code>, not in per-item scripts.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '07', label: '07 \u2014 Sink Connectors' }
        ]
      }
    }
  ]
};
