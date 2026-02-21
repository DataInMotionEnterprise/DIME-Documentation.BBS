/**
 * 11 — Templates & Output Formatting
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON11'] = {
  id: 'CON11',
  title: 'CON11 \u2014 Templates & Output Formatting',
  file: 'content/CON11-templates-formatting.md',
  hotspots: [
    {
      id: 'sink-transform',
      startLine: 26, startCol: 3, endLine: 61, endCol: 92,
      label: 'How Templates Work',
      panel: {
        title: 'Templates: Defined on Source, Rendered by Sink',
        body:
          '<p>Templates are defined on the <strong>source</strong> connector under <code>sink.transform</code>. Each sink independently decides whether to render the template by setting <code>use_sink_transform: !!bool true</code>.</p>' +
          '<p>The template travels with each message through the ring buffer via <code>ConnectorItemRef</code>. When a sink with <code>use_sink_transform: true</code> receives the message, it renders the template.</p>' +
          '<ul>' +
          '<li>Template definition lives on the <strong>source</strong> (connector-level or item-level)</li>' +
          '<li><code>use_sink_transform</code> toggle lives on the <strong>sink</strong></li>' +
          '<li>Each sink renders independently \u2014 other sinks are unaffected</li>' +
          '</ul>',
        yaml:
          '# On the SOURCE:\n' +
          'sources:\n' +
          '  - name: my_source\n' +
          '    sink:\n' +
          '      transform:\n' +
          '        type: scriban\n' +
          '        template: |\n' +
          '          { "value": {{ Message.Data }} }\n\n' +
          '# On the SINK:\n' +
          'sinks:\n' +
          '  - name: my_sink\n' +
          '    connector: HttpClient\n' +
          '    use_sink_transform: !!bool true',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors Catalog' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting & transforms' }
        ]
      }
    },
    {
      id: 'template-engines',
      startLine: 63, startCol: 3, endLine: 87, endCol: 92,
      label: 'Three Template Modes',
      panel: {
        title: 'Template Modes: script, scriban, liquid',
        body:
          '<p>DIME supports three template modes, all powered by the <strong>Scriban</strong> library. Set the mode via <code>sink.transform.type</code> on the source.</p>' +
          '<ul>' +
          '<li><strong>script</strong> \u2014 Expression evaluation. Simplest mode. Example: <code>Message.Data</code>. Also provides <code>print()</code> and <code>type()</code> helper functions.</li>' +
          '<li><strong>scriban</strong> \u2014 Full Scriban template syntax with loops, conditionals, math, and formatting. Uses <code>{{ if }} {{ end }}</code> blocks.</li>' +
          '<li><strong>liquid</strong> \u2014 Liquid-compatible mode (Shopify/Jekyll syntax). Uses <code>{% if %} {% endif %}</code> blocks.</li>' +
          '</ul>' +
          '<p>All three modes use the same context variables: <code>Message</code>, <code>Connector</code>, <code>Configuration</code>.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting (alternative to templates)' },
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors Catalog' },
          { page: 'EX27', label: 'EX27 \u2014 Liquid Templates' }
        ]
      }
    },
    {
      id: 'context-vars',
      startLine: 89, startCol: 3, endLine: 114, endCol: 92,
      label: 'Template Context Variables',
      panel: {
        title: 'Template Context: Message, Connector, Configuration',
        body:
          '<p>Every template has access to these context objects (from the rendering sink):</p>' +
          '<ul>' +
          '<li><strong>Message.Path</strong> \u2014 The full source path, e.g. <code>"plc1/temperature"</code></li>' +
          '<li><strong>Message.Data</strong> \u2014 The raw value (number, string, JSON object)</li>' +
          '<li><strong>Message.Timestamp</strong> \u2014 Unix epoch timestamp of when the value was read</li>' +
          '<li><strong>Connector.Name</strong> \u2014 Name of the rendering <em>sink</em> connector</li>' +
          '<li><strong>Connector.Type</strong> \u2014 Sink connector type, e.g. <code>"HttpClient"</code></li>' +
          '<li><strong>Configuration.Address</strong> \u2014 The sink\u2019s configured address/URL</li>' +
          '<li><strong>print()</strong> / <strong>type()</strong> \u2014 Helper functions (script mode only)</li>' +
          '</ul>' +
          '<p>Properties are PascalCase. Use these variables in template expressions to build dynamic output.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting: the msg object' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' }
        ]
      }
    },
    {
      id: 'json-reshape',
      startLine: 114, startCol: 3, endLine: 152, endCol: 92,
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
          '# Defined on the source connector:\n' +
          'sink:\n' +
          '  transform:\n' +
          '    type: scriban\n' +
          '    template: |\n' +
          '      {\n' +
          '        "device": "{{ Message.Path }}",\n' +
          '        "value": {{ Message.Data }},\n' +
          '        "ts": {{ Message.Timestamp }}\n' +
          '      }',
        related: [
          { page: 'CON07', label: 'CON07 \u2014 Sink Connectors: HttpClient' },
          { page: 'EX24', label: 'EX24 \u2014 HTTP Client POST (Scriban)' }
        ]
      }
    },
    {
      id: 'templates-vs-scripts',
      startLine: 167, startCol: 3, endLine: 194, endCol: 92,
      label: 'Templates vs Scripts',
      panel: {
        title: 'When to Use Templates vs Lua Scripts',
        body:
          '<p>Templates and Lua scripts serve different purposes and are configured at different stages:</p>' +
          '<ul>' +
          '<li><strong>Templates</strong> are <strong>defined on the source</strong> (under <code>sink.transform</code>) but <strong>rendered by each sink</strong> that has <code>use_sink_transform: true</code>. They format output for a specific destination. No access to <code>cache()</code>, <code>emit()</code>, or logic APIs. Pure string formatting.</li>' +
          '<li><strong>Lua/Python scripts</strong> run on the <strong>source side</strong>. They transform, filter, enrich, and fork data. Full access to the cache API, emit, and all scripting functions.</li>' +
          '</ul>' +
          '<p><strong>Best practice:</strong> Use Lua scripts to transform and enrich data on the source, then define templates on the source to format the enriched data. Enable <code>use_sink_transform</code> on each sink that needs formatted output.</p>' +
          '<p>They work together: scripts prepare the data, templates shape the output.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting & transforms' },
          { page: 'CON10', label: 'CON10 \u2014 Cache API: cross-connector state' },
          { page: 'CON12', label: 'CON12 \u2014 PLC to Dashboard Walkthrough' }
        ]
      }
    }
  ]
};
