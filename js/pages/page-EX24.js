/**
 * EX24 — HTTP Client POST
 * HTTPClient sink: custom headers, Authorization, Scriban template formatting.
 */
DIME_PAGES['EX24'] = {
  id: 'EX24',
  title: 'EX24 \u2014 HTTP Client POST',
  file: 'content/EX24-http-client-post.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex24-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'HTTP Client POST \u2014 Overview',
        body:
          '<p>This example posts data to an external HTTP endpoint using the HTTPClient sink. It demonstrates the outbound data push pattern:</p>' +
          '<ul>' +
          '<li><strong>Script source</strong> \u2014 Simulates a machine press with Execution state, SystemCondition, and Position data</li>' +
          '<li><strong>Cache-based state assembly</strong> \u2014 Individual items use <code>set()</code> + <code>return nil</code> to cache values, then a ModelInstance item assembles them into one payload</li>' +
          '<li><strong>Scriban template</strong> \u2014 Formats the Lua table into a custom text payload before POSTing</li>' +
          '<li><strong>Custom HTTP headers</strong> \u2014 Content-Type and Authorization headers on every request</li>' +
          '</ul>' +
          '<p>The 3-file config separates the source, sink, and main orchestration.</p>',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: '11', label: '11 \u2014 Templates & Formatting' },
          { page: 'REF10', label: 'REF10 \u2014 HTTP Client' }
        ]
      }
    },
    {
      id: 'ex24-dataflow',
      startLine: 14, startCol: 2, endLine: 33, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Script Source \u2192 Ring Buffer \u2192 HTTP POST',
        body:
          '<p>The data flow uses a cache-and-assemble pattern:</p>' +
          '<ol>' +
          '<li><strong>Execution, SystemCondition, Position</strong> \u2014 Each item generates a random value, stores it via <code>set()</code>, and returns <code>nil</code> (suppressing direct output)</li>' +
          '<li><strong>ModelInstance</strong> \u2014 Reads all cached values with <code>cache()</code> and returns a combined Lua table</li>' +
          '<li><strong>Scriban template</strong> \u2014 Formats the table into a text payload using <code>{{Message.Data["key"]}}</code> syntax</li>' +
          '<li><strong>HTTPClient sink</strong> \u2014 POSTs the formatted payload to the webhook URL with custom headers</li>' +
          '</ol>' +
          '<p>Only the ModelInstance item produces output (the others return nil). This ensures one combined POST per scan cycle instead of four separate requests.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '10', label: '10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'ex24-config',
      startLine: 35, startCol: 2, endLine: 123, endCol: 85,
      label: 'Multi-File YAML Configuration',
      panel: {
        title: '3-File Config: Source, Sink, Main',
        body:
          '<p>Three YAML files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>mtInstance1.yaml</strong> \u2014 The Script source named "press1". Four items: three use <code>set()</code>/<code>return nil</code> to cache state, the fourth (ModelInstance) assembles all cached values and applies a Scriban template.</li>' +
          '<li><strong>httpClientSink1.yaml</strong> \u2014 The HTTPClient sink. Configures <code>uri</code>, <code>headers</code> (Content-Type, Authorization), and <code>exclude_filter</code> for system messages.</li>' +
          '<li><strong>main.yaml</strong> \u2014 Composes both connectors into the final pipeline.</li>' +
          '</ul>' +
          '<p><strong>Key settings:</strong></p>' +
          '<ul>' +
          '<li><code>headers</code> map \u2014 Adds custom HTTP headers to every POST request</li>' +
          '<li><code>sink.transform.type: scriban</code> \u2014 Enables Scriban template engine for payload formatting</li>' +
          '<li><code>configuration().Name</code> \u2014 Lua API to read the connector\u2019s own name from config</li>' +
          '</ul>',
        yaml:
          '# HTTPClient sink with headers:\n' +
          'httpClientSink1: &httpClientSink1\n' +
          '  connector: HTTPClient\n' +
          '  uri: https://webhook-test.com/...\n' +
          '  headers:\n' +
          '    Content-Type: text/plain\n' +
          '    Authorization: Bearer <token>',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '21', label: '21 \u2014 Multi-File Configs' },
          { page: '11', label: '11 \u2014 Templates & Formatting' }
        ]
      }
    },
    {
      id: 'ex24-keyconcepts',
      startLine: 125, startCol: 2, endLine: 151, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>HTTPClient Sink</strong> \u2014 Unlike HTTPServer (which listens for requests), HTTPClient actively POSTs data to an external endpoint. Set <code>uri</code> to any REST API, webhook, or gateway URL. Each ring buffer message triggers a POST.</p>' +
          '<p><strong>Custom Headers</strong> \u2014 The <code>headers</code> map adds HTTP headers to every outbound request. Use <code>Content-Type</code> to control payload format and <code>Authorization</code> for Bearer tokens, API keys, or any auth scheme.</p>' +
          '<p><strong>Scriban Templates</strong> \u2014 The Scriban engine (<code>sink.transform.type: scriban</code>) formats payloads before sending. Access data with <code>{{Message.Data["key"]}}</code>, loop with <code>{{for o in Message.Data}}</code>, and use <code>{{- for whitespace trimming. Scriban is more powerful than Liquid for complex formatting.</p>' +
          '<p><strong>Cache-Based State Assembly</strong> \u2014 Items use <code>set("key", value)</code> to store values and <code>return nil</code> to suppress output. A final "assembler" item reads all cached values with <code>cache("./key", default)</code> and returns a combined table. This produces one message per scan cycle from multiple data points.</p>' +
          '<p><strong>configuration() API</strong> \u2014 <code>configuration().Name</code> returns the connector\u2019s name from YAML config. Scripts can adapt to their runtime context without hardcoding values.</p>',
        related: [
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '11', label: '11 \u2014 Templates & Formatting' },
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '07', label: '07 \u2014 Sink Connectors' }
        ]
      }
    }
  ]
};
