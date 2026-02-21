/**
 * 14 — Recipe: Database Logging
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['14'] = {
  id: '14',
  title: '14 \u2014 Database Logging',
  file: 'content/14-recipe-database.md',
  hotspots: [
    {
      id: 'influxdb',
      startLine: 47, startCol: 3, endLine: 74, endCol: 78,
      label: 'InfluxDB Time-Series Sink',
      panel: {
        title: 'InfluxDB Sink \u2014 Line Protocol',
        body:
          '<p>The <strong>InfluxLP</strong> connector writes to InfluxDB v2 using the native line protocol.</p>' +
          '<ul>' +
          '<li><strong>url</strong> \u2014 InfluxDB server address (e.g. http://influx.local:8086)</li>' +
          '<li><strong>bucket</strong> \u2014 Target InfluxDB bucket for storage</li>' +
          '<li><strong>org</strong> \u2014 InfluxDB organization name</li>' +
          '<li><strong>token</strong> \u2014 API authentication token</li>' +
          '</ul>' +
          '<p>DIME automatically converts each message into line-protocol format: the path becomes the measurement name, the value is the field, and timestamps are nanosecond precision.</p>' +
          '<p>Writes are batched for performance with automatic retry on transient failures.</p>',
        yaml:
          'sinks:\n' +
          '  - name: historian\n' +
          '    connector: InfluxLP\n' +
          '    url: http://influx.local:8086\n' +
          '    bucket: factory_data\n' +
          '    org: myorg\n' +
          '    token: my-influx-token',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: 'EX17', label: 'EX17 \u2014 InfluxDB Pipeline' }
        ]
      }
    },
    {
      id: 'sql-sink',
      startLine: 78, startCol: 3, endLine: 107, endCol: 78,
      label: 'SQL Server & PostgreSQL Sinks',
      panel: {
        title: 'Relational Database Sinks',
        body:
          '<p>DIME supports both <strong>SQL Server</strong> and <strong>PostgreSQL</strong> as sink destinations for relational storage.</p>' +
          '<ul>' +
          '<li><strong>connection_string</strong> \u2014 Standard ADO.NET / Npgsql connection string</li>' +
          '<li><strong>Table auto-mapping</strong> \u2014 Path-to-column mapping for structured inserts</li>' +
          '<li><strong>Batch inserts</strong> \u2014 Multiple rows buffered and written in one transaction</li>' +
          '<li><strong>Query templates</strong> \u2014 PostgreSQL supports parameterized query templates</li>' +
          '</ul>' +
          '<p>Both sinks support stored procedure calls and connection pooling for high throughput.</p>',
        yaml:
          'sinks:\n' +
          '  - name: sql_log\n' +
          '    connector: SqlServer\n' +
          '    connection_string: "Server=db.local;Database=dime;User Id=sa;Password=pass;"',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: '14', hotspot: 'db-as-source', label: 'Database as source' }
        ]
      }
    },
    {
      id: 'mongodb',
      startLine: 111, startCol: 3, endLine: 143, endCol: 78,
      label: 'MongoDB Document Sink',
      panel: {
        title: 'MongoDB Sink \u2014 Document Storage',
        body:
          '<p>The <strong>MongoDB</strong> connector stores each reading as a flexible BSON document.</p>' +
          '<ul>' +
          '<li><strong>connection_string</strong> \u2014 MongoDB connection URI</li>' +
          '<li><strong>database</strong> \u2014 Target database name</li>' +
          '<li><strong>collection</strong> \u2014 Target collection for documents</li>' +
          '</ul>' +
          '<p>Documents are auto-generated with path, value, timestamp, source, and item fields. No schema migration needed \u2014 MongoDB is schema-free.</p>' +
          '<p>Uses bulk write operations for performance. Ideal for nested or variable-structure data.</p>',
        yaml:
          'sinks:\n' +
          '  - name: mongo\n' +
          '    connector: MongoDB\n' +
          '    connection_string: "mongodb://mongo.local:27017"\n' +
          '    database: factory\n' +
          '    collection: readings',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: 'EX18', label: 'EX18 \u2014 MongoDB Pipeline' }
        ]
      }
    },
    {
      id: 'csv-logger',
      startLine: 147, startCol: 3, endLine: 179, endCol: 78,
      label: 'CSV Writer & Logger Sinks',
      panel: {
        title: 'File-Based Output \u2014 CSV & Logger',
        body:
          '<p>Two file-based sinks for simple, infrastructure-free output:</p>' +
          '<ul>' +
          '<li><strong>CsvWriter</strong> \u2014 Writes path, value, timestamp to a CSV file. Auto-generates headers. The <code>filter_duplicate_paths</code> option controls whether only the latest value per path is kept (true) or full history is appended (false).</li>' +
          '<li><strong>Logger</strong> \u2014 NLog-based structured logging. Supports rolling log files, configurable NLog targets, and structured JSON output. Ideal for audit trails and integration with log management systems.</li>' +
          '</ul>' +
          '<p>Both sinks work without any external database or service.</p>',
        yaml:
          'sinks:\n' +
          '  - name: csv_out\n' +
          '    connector: CsvWriter\n' +
          '    filename: readings.csv\n' +
          '    filter_duplicate_paths: !!bool false',
        related: [
          { page: '07', label: '07 \u2014 Sink connectors' },
          { page: '08', label: '08 \u2014 Filtering & routing' }
        ]
      }
    },
    {
      id: 'db-as-source',
      startLine: 183, startCol: 3, endLine: 211, endCol: 78,
      label: 'Database as Source (BatchPolling)',
      panel: {
        title: 'Reading FROM Databases \u2014 BatchPolling',
        body:
          '<p>DIME can read from databases using the <strong>BatchPollingSourceConnector</strong> pattern.</p>' +
          '<ul>' +
          '<li><strong>connector</strong> \u2014 SqlServer or PostgreSql (same connector name as the sink)</li>' +
          '<li><strong>connection_string</strong> \u2014 Database connection string</li>' +
          '<li><strong>query</strong> \u2014 SQL query to execute on each poll cycle</li>' +
          '<li><strong>scan_interval</strong> \u2014 How often to run the query</li>' +
          '</ul>' +
          '<p>On each timer tick the query executes, and each row is published as a separate message to the ring buffer. Column names become part of the message path: <code>sourceName/query1/column_name</code>.</p>' +
          '<p>Useful for pulling ERP data, work orders, or recipe parameters into the DIME data stream.</p>',
        yaml:
          'sources:\n' +
          '  - name: db_reader\n' +
          '    connector: SqlServer\n' +
          '    connection_string: "Server=db.local;Database=erp;"\n' +
          '    query: "SELECT id, value FROM sensors WHERE updated > @last_run"',
        related: [
          { page: '06', label: '06 \u2014 Source connectors' },
          { page: 'EX19', label: 'EX19 \u2014 PostgreSQL Source' },
          { page: 'EX20', label: 'EX20 \u2014 SQL Server Source' }
        ]
      }
    }
  ]
};
