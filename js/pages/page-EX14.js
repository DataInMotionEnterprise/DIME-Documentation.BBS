/**
 * EX14 — ActiveMQ Enterprise Broker
 * Apache ActiveMQ Artemis with topics and queues. Enterprise messaging.
 */
DIME_PAGES['EX14'] = {
  id: 'EX14',
  title: 'EX14 \u2014 ActiveMQ Enterprise Broker',
  file: 'content/EX14-activemq-enterprise.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex14-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'ActiveMQ Enterprise Broker \u2014 Overview',
        body:
          '<p>Connect to Apache ActiveMQ Artemis for enterprise-grade messaging. This example demonstrates the two fundamental messaging patterns available in ActiveMQ:</p>' +
          '<ul>' +
          '<li><strong>Topic subscription</strong> \u2014 <code>topic://FOO.BAR</code> \u2014 Pub/sub broadcast: all subscribers receive every message</li>' +
          '<li><strong>Queue subscription</strong> \u2014 <code>queue://BAR.FOO</code> \u2014 Point-to-point: only one consumer gets each message (load balanced)</li>' +
          '<li><strong>OpenWire protocol</strong> \u2014 Uses Apache\u2019s native binary protocol via <code>activemq:tcp://</code> prefix</li>' +
          '<li><strong>Console sink</strong> \u2014 Debug output with filter toggle for raw messages</li>' +
          '</ul>' +
          '<p>ActiveMQ Artemis supports persistence, clustering, transactions, and dead-letter queues \u2014 making it suitable for enterprise integration scenarios where MQTT may not be sufficient.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX11', label: 'EX11 \u2014 MQTT Bridge (lighter weight)' },
          { page: 'REF01', label: 'REF01 \u2014 ActiveMQ' }
        ]
      }
    },
    {
      id: 'ex14-dataflow',
      startLine: 13, startCol: 2, endLine: 35, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'ActiveMQ Broker \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>Data flows from an ActiveMQ Artemis broker to the console:</p>' +
          '<ul>' +
          '<li><strong>ActiveMQ Source</strong> \u2014 Connects via OpenWire protocol to <code>tcp://172.24.56.104:61616</code>. Subscribes to both a topic (<code>FOO.BAR</code>) and a queue (<code>BAR.FOO</code>) simultaneously.</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Messages from both subscriptions enter the shared 4096-slot buffer.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Currently filters out all ActiveMQ messages via <code>exclude_filter</code>. Remove the <code>activemq</code> entry to see raw messages for debugging.</li>' +
          '</ul>' +
          '<p>With <code>itemized_read: false</code>, the connector operates in event-driven queuing mode. Messages arrive asynchronously and are drained every 500ms.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON08', label: 'CON08 \u2014 Filtering' }
        ]
      }
    },
    {
      id: 'ex14-config',
      startLine: 37, startCol: 2, endLine: 92, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File YAML \u2014 3 Files',
        body:
          '<p>Three files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>main.yaml</strong> \u2014 Wires the ActiveMQ source to the console sink</li>' +
          '<li><strong>activemq.yaml</strong> \u2014 ActiveMQ source with topic and queue subscriptions</li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink with debug filter toggle</li>' +
          '</ul>' +
          '<p><strong>Key ActiveMQ properties:</strong></p>' +
          '<ul>' +
          '<li><code>connector: ActiveMQ</code> \u2014 Selects the Apache ActiveMQ connector</li>' +
          '<li><code>address: activemq:tcp://host:61616</code> \u2014 OpenWire protocol URI with <code>activemq:</code> prefix</li>' +
          '<li><code>address: topic://FOO.BAR</code> \u2014 Item-level topic subscription (pub/sub)</li>' +
          '<li><code>address: queue://BAR.FOO</code> \u2014 Item-level queue subscription (point-to-point)</li>' +
          '<li><code>itemized_read: false</code> \u2014 Event-driven mode for async broker messages</li>' +
          '</ul>',
        related: [
          { page: 'CON21', label: 'CON21 \u2014 Multi-File Configs' },
          { page: 'CON04', label: 'CON04 \u2014 YAML Basics' }
        ]
      }
    },
    {
      id: 'ex14-keyconcepts',
      startLine: 93, startCol: 2, endLine: 118, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Topics vs Queues</strong> \u2014 ActiveMQ supports two messaging patterns in the same connector. <code>topic://</code> is pub/sub: all subscribers receive every message. <code>queue://</code> is point-to-point: the broker load-balances messages across consumers so each message is delivered to exactly one consumer.</p>' +
          '<p><strong>OpenWire Protocol</strong> \u2014 The address uses the <code>activemq:tcp://</code> prefix for Apache\u2019s native OpenWire binary protocol on port 61616. This is the default protocol for both Artemis and Classic ActiveMQ, offering better performance than AMQP or STOMP alternatives.</p>' +
          '<p><strong>Event-Driven Mode</strong> \u2014 <code>itemized_read: false</code> switches to queuing mode where messages arrive asynchronously from the broker. The <code>scan_interval: 500</code> controls how often DIME drains the internal queue and publishes to the ring buffer.</p>' +
          '<p><strong>Console Filter as Debug Toggle</strong> \u2014 The <code>exclude_filter</code> includes both <code>activemq/$SYSTEM</code> (system messages) and <code>activemq</code> (all source data). Removing the <code>activemq</code> entry instantly enables raw message display for debugging. This is a useful pattern for development.</p>' +
          '<p><strong>Enterprise Messaging</strong> \u2014 ActiveMQ Artemis supports message persistence, clustering, transactions, and dead-letter queues. DIME acts as a lightweight consumer that bridges enterprise broker messages into the ring buffer for further routing to any DIME sink.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'CON08', label: 'CON08 \u2014 Message Paths & Filtering' },
          { page: 'EX11', label: 'EX11 \u2014 MQTT to WebSocket Bridge' }
        ]
      }
    }
  ]
};
