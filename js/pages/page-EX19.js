/**
 * EX19 — PostgreSQL Polling
 * SQL polling with dynamic {top} parameterization via Lua enter_script.
 */
DIME_PAGES['EX19'] = {
  id: 'EX19',
  title: 'EX19 \u2014 PostgreSQL Polling',
  file: 'content/EX19-postgresql-polling.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex19-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'PostgreSQL Polling \u2014 Overview',
        body:
          '<p>This example demonstrates <strong>SQL database polling</strong> with dynamic query parameterization. A PostgreSQL database is queried on a timer, and the SQL query is modified at runtime using Lua scripting.</p>' +
          '<ul>' +
          '<li><strong>Postgres Source</strong> \u2014 Executes SQL queries against a PostgreSQL database every 1000ms</li>' +
          '<li><strong>Dynamic Parameterization</strong> \u2014 The <code>{top}</code> placeholder in the query is replaced each scan cycle with a random number (1\u20139) using Lua <code>string.gsub()</code></li>' +
          '<li><strong>configuration() API</strong> \u2014 Lua directly modifies the connector\u2019s live SQL query via <code>configuration().CommandText</code></li>' +
          '<li><strong>Column Mapping</strong> \u2014 Each item\u2019s <code>address</code> field maps to a SQL column name</li>' +
          '</ul>' +
          '<p>This pattern is powerful for any scenario where queries need to change at runtime \u2014 pagination, date ranges, dynamic filters, etc.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: 'EX20', label: 'EX20 \u2014 SQL Server Reads' },
          { page: 'REF26', label: 'REF26 \u2014 Postgres' }
        ]
      }
    },
    {
      id: 'ex19-dataflow',
      startLine: 14, startCol: 2, endLine: 40, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'PostgreSQL \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>A simple source-to-sink pipeline with dynamic query logic:</p>' +
          '<ul>' +
          '<li><strong>Postgres Source</strong> \u2014 Connects to PostgreSQL at <code>172.16.10.43:5342</code>. The <code>command_text</code> query is modified before each scan by the <code>enter_script</code>.</li>' +
          '<li><strong>Dynamic {top}</strong> \u2014 Each scan cycle, Lua replaces <code>{top}</code> (or the previous random number) with a new random value between 1 and 9, changing the row limit.</li>' +
          '<li><strong>Result Mapping</strong> \u2014 Query results are mapped to items by column name: <code>package_tracking_number</code> \u2192 TrackingNumber, <code>ship_to_name</code> \u2192 ShipToName.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Displays results on stdout for verification.</li>' +
          '</ul>',
        related: [
          { page: '05', label: '05 \u2014 Architecture Overview' },
          { page: '09', label: '09 \u2014 Scripting Deep Dive' }
        ]
      }
    },
    {
      id: 'ex19-postgres-config',
      startLine: 45, startCol: 2, endLine: 79, endCol: 85,
      label: 'Postgres Source Configuration',
      panel: {
        title: 'Postgres Source \u2014 Dynamic SQL Queries',
        body:
          '<p>The Postgres source connector executes SQL queries on a timer:</p>' +
          '<ul>' +
          '<li><strong>connector: Postgres</strong> \u2014 Native PostgreSQL source connector</li>' +
          '<li><strong>connection_string</strong> \u2014 Standard PostgreSQL connection parameters (Host, Port, Username, Password, Database)</li>' +
          '<li><strong>command_text</strong> \u2014 SQL query with <code>{top}</code> placeholder for dynamic row limits</li>' +
          '</ul>' +
          '<p><strong>Script pipeline:</strong></p>' +
          '<ul>' +
          '<li><code>init_script</code> \u2014 Stores the <code>{top}</code> string as a Lua variable for later <code>gsub</code> matching</li>' +
          '<li><code>enter_script</code> \u2014 Runs before each scan: reads <code>configuration().CommandText</code>, replaces the previous number with a new random, writes back to <code>configuration().CommandText</code></li>' +
          '<li>Item scripts \u2014 Process the query result: <code>result[0]</code> for first row, <code>result</code> for full column data</li>' +
          '</ul>',
        yaml:
          '# The dynamic parameterization pattern:\n' +
          'init_script: |\n' +
          '  top = "{top}"             # Store placeholder\n' +
          'enter_script: |\n' +
          '  local conn = configuration().CommandText;\n' +
          '  next_num = math.random(1, 9);\n' +
          '  conn = string.gsub(conn, top, next_num);\n' +
          '  top = next_num;\n' +
          '  configuration().CommandText = conn;',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '06', label: '06 \u2014 Source Connectors' }
        ]
      }
    },
    {
      id: 'ex19-keyconcepts',
      startLine: 104, startCol: 2, endLine: 129, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Postgres Connector</strong> \u2014 DIME includes a native PostgreSQL source connector that executes <code>command_text</code> as a SQL query each scan cycle. Each item\u2019s <code>address</code> field maps to a column name in the result set.</p>' +
          '<p><strong>Dynamic Query Parameterization</strong> \u2014 The <code>{top}</code> placeholder is replaced at runtime using Lua\u2019s <code>string.gsub()</code> in the <code>enter_script</code>. The <code>init_script</code> stores the original pattern, and <code>enter_script</code> swaps it before each scan. This enables fully dynamic queries without restarting DIME.</p>' +
          '<p><strong>configuration() API</strong> \u2014 Lua\u2019s <code>configuration()</code> function returns the connector\u2019s live configuration object. Modifying <code>configuration().CommandText</code> directly changes the SQL query for the next scan cycle. This is a powerful mechanism for runtime query adaptation.</p>' +
          '<p><strong>enter_script vs init_script</strong> \u2014 <code>init_script</code> runs once at startup (one-time setup). <code>enter_script</code> runs before every scan cycle (per-cycle logic). This separation enables patterns like storing a pattern once and applying it repeatedly.</p>' +
          '<p><strong>Column-to-Item Mapping</strong> \u2014 Each item\u2019s <code>address</code> corresponds to a SQL column name. The script then processes the result array (e.g., <code>result[0]</code> for the first row\u2019s value).</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: 'EX20', label: 'EX20 \u2014 SQL Server Reads' }
        ]
      }
    }
  ]
};
