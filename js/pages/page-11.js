/**
 * 11 — Templates & Output Formatting
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['11'] = {
  id: '11',
  title: '11 \u2014 Templates & Output Formatting',
  file: 'content/11-templates-formatting.md',
  hotspots: [
    {
      id: 'sink-transform',
      startLine: 26, startCol: 3, endLine: 41, endCol: 92,
      label: 'use_sink_transform Flag',
      panel: {
        title: 'Enabling Templates with use_sink_transform',
        body:
          '<p>By default, source-side transforms (Lua/Python scripts) do not run on the sink. Templates are a sink-side feature.</p>' +
          '<p>Set <code>use_sink_transform: !!bool true</code> on a sink to enable template processing.</p>' +
          '<p>When enabled, each message passing through the sink is run through the template engine before being sent to the destination.</p>' +
          '<ul>' +
          '<li>The template has access to <code>Message</code>, <code>Connector</code>, and <code>Configuration</code> objects</li>' +
          '<li>Output replaces the raw message data for that sink only</li>' +
          '<li>Other sinks receiving the same message are unaffected</li>' +
          '</ul>',
        yaml:
          'sinks:\n' +
          '  - name: my_sink\n' +
          '    connector: HttpClient\n' +
          '    use_sink_transform: !!bool true',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors Catalog' },
          { page: '09', label: '09 \u2014 Lua Scripting & Transforms' }
        ]
      }
    },
    {
      id: 'template-engines',
      startLine: 48, startCol: 3, endLine: 67, endCol: 92,
      label: 'Liquid & Scriban Engines',
      panel: {
        title: 'Template Engines: Liquid vs Scriban',
        body:
          '<p>DIME supports two template engines. Both use the same context variables and produce the same output.</p>' +
          '<ul>' +
          '<li><strong>Liquid</strong> \u2014 Ruby-inspired syntax, widely known from Shopify, Jekyll, and many web frameworks. Uses <code>{% if %} {% endif %}</code> block syntax.</li>' +
          '<li><strong>Scriban</strong> \u2014 .NET-native template engine with richer expression support. Uses <code>{{ if }} {{ end }}</code> block syntax. Supports math operations, function calls, and advanced formatting.</li>' +
          '</ul>' +
          '<p>Both engines use <code>{{ }}</code> for variable interpolation. Choose whichever syntax you prefer.</p>',
        related: [
          { page: '09', label: '09 \u2014 Lua Scripting (alternative to templates)' },
          { page: '07', label: '07 \u2014 Sink Connectors Catalog' }
        ]
      }
    },
    {
      id: 'context-vars',
      startLine: 74, startCol: 3, endLine: 89, endCol: 92,
      label: 'Template Context Variables',
      panel: {
        title: 'Template Context: Message, Connector, Configuration',
        body:
          '<p>Every template has access to three context objects:</p>' +
          '<ul>' +
          '<li><strong>Message.Path</strong> \u2014 The full source path, e.g. <code>"plc1/temperature"</code></li>' +
          '<li><strong>Message.Data</strong> \u2014 The raw value (number, string, JSON object)</li>' +
          '<li><strong>Message.Timestamp</strong> \u2014 Unix epoch timestamp of when the value was read</li>' +
          '<li><strong>Connector.Name</strong> \u2014 Name of the sink connector processing this message</li>' +
          '<li><strong>Connector.Type</strong> \u2014 Connector type, e.g. <code>"HttpClient"</code></li>' +
          '<li><strong>Configuration.Address</strong> \u2014 The sink\u2019s configured address/URL</li>' +
          '</ul>' +
          '<p>Use these variables in your template expressions to build dynamic output strings.</p>',
        related: [
          { page: '09', label: '09 \u2014 Lua Scripting: the msg object' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'json-reshape',
      startLine: 96, startCol: 3, endLine: 131, endCol: 92,
      label: 'JSON Reshaping Example',
      panel: {
        title: 'Reshaping Flat Data into Nested JSON',
        body:
          '<p>Templates excel at restructuring data for REST APIs and other sinks that expect specific JSON formats.</p>' +
          '<p>A flat DIME message with Path, Data, and Timestamp can be reshaped into any nested JSON structure using template expressions.</p>' +
          '<ul>' +
          '<li>Wrap values in custom field names for your API schema</li>' +
          '<li>Add static metadata like device IDs or units</li>' +
          '<li>Build nested objects and arrays</li>' +
          '</ul>' +
          '<p>The template output becomes the body sent to the sink destination.</p>',
        yaml:
          'template: |\n' +
          '  {\n' +
          '    "device": "{{ Message.Path }}",\n' +
          '    "value": {{ Message.Data }},\n' +
          '    "ts": {{ Message.Timestamp }}\n' +
          '  }',
        related: [
          { page: '07', label: '07 \u2014 Sink Connectors: HttpClient' },
          { page: '12', label: '12 \u2014 PLC to Dashboard Walkthrough' }
        ]
      }
    },
    {
      id: 'templates-vs-scripts',
      startLine: 139, startCol: 3, endLine: 162, endCol: 92,
      label: 'Templates vs Scripts',
      panel: {
        title: 'When to Use Templates vs Lua Scripts',
        body:
          '<p>Templates and Lua scripts serve different purposes and run at different stages:</p>' +
          '<ul>' +
          '<li><strong>Templates</strong> run on the <strong>sink side</strong>. They format output for a specific destination. No access to <code>cache()</code>, <code>emit()</code>, or logic APIs. Pure string formatting.</li>' +
          '<li><strong>Lua/Python scripts</strong> run on the <strong>source side</strong>. They transform, filter, enrich, and fork data. Full access to the cache API, emit, and all scripting functions.</li>' +
          '</ul>' +
          '<p><strong>Best practice:</strong> Use Lua scripts to transform and enrich data on the source side, then use templates on each sink to format the enriched data for that sink\u2019s specific protocol or API format.</p>' +
          '<p>They work together: scripts prepare the data, templates shape the output.</p>',
        related: [
          { page: '09', label: '09 \u2014 Lua Scripting & Transforms' },
          { page: '10', label: '10 \u2014 Cache API: cross-connector state' },
          { page: '12', label: '12 \u2014 PLC to Dashboard Walkthrough' }
        ]
      }
    }
  ]
};
