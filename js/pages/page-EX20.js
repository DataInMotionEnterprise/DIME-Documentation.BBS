/**
 * EX20 — SQL Server Reads
 * Microsoft SQL Server polling with encrypted connections and column mapping.
 */
DIME_PAGES['EX20'] = {
  id: 'EX20',
  title: 'EX20 \u2014 SQL Server Reads',
  file: 'content/EX20-sql-server-reads.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex20-overview',
      startLine: 4, startCol: 2, endLine: 12, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'SQL Server Reads \u2014 Overview',
        body:
          '<p>This example polls a <strong>Microsoft SQL Server</strong> database for manufacturing order data. It demonstrates encrypted database connections and straightforward column-to-item mapping.</p>' +
          '<ul>' +
          '<li><strong>MSSQL Source</strong> \u2014 Queries SQL Server every 1000ms using ADO.NET</li>' +
          '<li><strong>Encrypted Connection</strong> \u2014 Uses <code>Encrypt=True</code> and <code>TrustServerCertificate=True</code> for TLS</li>' +
          '<li><strong>Column Mapping</strong> \u2014 Each item\u2019s <code>address</code> maps to a SQL column name</li>' +
          '<li><strong>Lifecycle Scripts</strong> \u2014 All set to <code>~</code> (null) for a clean, minimal configuration</li>' +
          '</ul>' +
          '<p>Compare with EX19 (PostgreSQL) which adds dynamic query parameterization. This example is intentionally minimal to show the simplest database polling pattern.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX19', label: 'EX19 \u2014 PostgreSQL Polling' },
          { page: 'REF19', label: 'REF19 \u2014 MSSQL' }
        ]
      }
    },
    {
      id: 'ex20-dataflow',
      startLine: 14, startCol: 2, endLine: 38, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'SQL Server \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>A straightforward database-to-console pipeline:</p>' +
          '<ul>' +
          '<li><strong>MSSQL Source</strong> \u2014 Connects to SQL Server at <code>172.16.10.5</code> with TLS encryption. Executes <code>SELECT TOP 5</code> from a manufacturing orders table every second.</li>' +
          '<li><strong>Result Mapping</strong> \u2014 Two items map to SQL columns: <code>ManufacturingOrderNumber</code> \u2192 OrderNumber, <code>OrderQuantity</code> \u2192 OrderQuantity. Each item script extracts the first row with <code>result[0]</code>.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Displays all messages including <code>$SYSTEM</code> health data (no filters applied in this minimal example).</li>' +
          '</ul>',
        related: [
          { page: 'CON05', label: 'CON05 \u2014 Architecture Overview' },
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' }
        ]
      }
    },
    {
      id: 'ex20-mssql-config',
      startLine: 43, startCol: 2, endLine: 76, endCol: 85,
      label: 'MSSQL Source Configuration',
      panel: {
        title: 'MSSQL Source \u2014 Encrypted SQL Server Connection',
        body:
          '<p>The MSSQL source connector uses ADO.NET to query SQL Server:</p>' +
          '<ul>' +
          '<li><strong>connector: MSSQL</strong> \u2014 Native Microsoft SQL Server source connector</li>' +
          '<li><strong>connection_string</strong> \u2014 Standard ADO.NET format with Server, Database, User Id, Password, and encryption settings</li>' +
          '<li><strong>command_text</strong> \u2014 Static SQL query executed each scan cycle</li>' +
          '<li><strong>rbe: true</strong> \u2014 Only publishes when result values change</li>' +
          '</ul>' +
          '<p><strong>Encryption settings:</strong></p>' +
          '<ul>' +
          '<li><code>Encrypt=True</code> \u2014 Enables TLS encryption for the database connection</li>' +
          '<li><code>TrustServerCertificate=True</code> \u2014 Accepts self-signed certificates (development only; use CA-signed certs in production)</li>' +
          '</ul>' +
          '<p><strong>Lifecycle scripts:</strong> All four scripts (<code>init</code>, <code>deinit</code>, <code>enter</code>, <code>exit</code>) are set to <code>~</code> (null). Compare with EX19 where <code>enter_script</code> dynamically modifies the query.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua & Python)' }
        ]
      }
    },
    {
      id: 'ex20-keyconcepts',
      startLine: 102, startCol: 2, endLine: 125, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>MSSQL Connector</strong> \u2014 DIME\u2019s native Microsoft SQL Server source connector uses ADO.NET under the hood. It supports the full range of connection string parameters. Each scan executes the <code>command_text</code> query and maps results to items by column name.</p>' +
          '<p><strong>Encrypted Connections</strong> \u2014 The connection string includes <code>Encrypt=True</code> for TLS and <code>TrustServerCertificate=True</code> to accept self-signed certificates. In production, use proper CA-signed certificates and remove the TrustServerCertificate option.</p>' +
          '<p><strong>Column-to-Item Mapping</strong> \u2014 Each item\u2019s <code>address</code> field corresponds to a SQL column name in the result set. The script <code>return result[0]</code> extracts the first row\u2019s value. For multiple rows, use <code>result[n]</code> to access the nth row.</p>' +
          '<p><strong>Null Lifecycle Scripts</strong> \u2014 Setting scripts to <code>~</code> (YAML null) explicitly declares that no custom logic runs at that lifecycle stage. This is cleaner than omitting them entirely, making the configuration self-documenting.</p>' +
          '<p><strong>Minimal Sink</strong> \u2014 The Console sink has no filters, so it receives all messages including <code>$SYSTEM</code> health data. For production, add <code>exclude_filter: [msSqlSource1/$SYSTEM]</code>.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua & Python)' },
          { page: 'EX19', label: 'EX19 \u2014 PostgreSQL Polling' }
        ]
      }
    }
  ]
};
