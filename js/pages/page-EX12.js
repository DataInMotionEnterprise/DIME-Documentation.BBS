/**
 * EX12 — Secure MQTT (TLS)
 * TLS + client certificates for encrypted MQTT. Source and sink on same broker.
 */
DIME_PAGES['EX12'] = {
  id: 'EX12',
  title: 'EX12 \u2014 Secure MQTT (TLS)',
  file: 'content/EX12-mqtt-secure-tls.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex12-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Secure MQTT (TLS) \u2014 Overview',
        body:
          '<p>Encrypted MQTT communication using TLS and client certificate authentication:</p>' +
          '<ul>' +
          '<li><strong>MQTT source (TLS)</strong> \u2014 Subscribes to all topics (<code>#</code>) on localhost:8883 using MQTTS</li>' +
          '<li><strong>MQTT sink (TLS)</strong> \u2014 Republishes messages under a <code>base_topic</code> prefix with <code>retain: true</code></li>' +
          '<li><strong>Client certificates</strong> \u2014 Both source and sink use a PKCS#12 (.pfx) client certificate and CA cert for mutual TLS authentication</li>' +
          '<li><strong>Console sink</strong> \u2014 Debug output with Message.Data transform</li>' +
          '</ul>' +
          '<p>This demonstrates secure MQTT communication with certificate-based mutual authentication, commonly required in enterprise and regulated industrial environments.</p>',
        related: [
          { page: 'EX11', label: 'EX11 \u2014 MQTT to WebSocket (plaintext)' },
          { page: '06', label: '06 \u2014 Source Connectors' }
        ]
      }
    },
    {
      id: 'ex12-dataflow',
      startLine: 13, startCol: 2, endLine: 34, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'MQTTS Source \u2192 Ring Buffer \u2192 MQTTS Sink + Console',
        body:
          '<p>Both source and sink connect to the same MQTT broker using TLS encryption:</p>' +
          '<ul>' +
          '<li><strong>MQTT Source</strong> \u2014 Connects to <code>localhost:8883</code> with TLS enabled, client certificate (.pfx), and CA certificate. Subscribes to <code>#</code> (all topics).</li>' +
          '<li><strong>Ring Buffer</strong> \u2014 Incoming messages enter the 4096-slot Disruptor buffer.</li>' +
          '<li><strong>MQTT Sink</strong> \u2014 Republishes messages under the <code>MqttSecure1/</code> base topic with <code>retain: true</code>, using the same TLS configuration.</li>' +
          '<li><strong>Console Sink</strong> \u2014 Applies <code>Message.Data</code> transform to show only the data payload.</li>' +
          '</ul>' +
          '<p>This creates a secure message relay: DIME sits between producers and consumers with TLS encryption on both sides and the ability to transform, filter, or route messages in between.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '07', label: '07 \u2014 Sink Connectors' }
        ]
      }
    },
    {
      id: 'ex12-config',
      startLine: 36, startCol: 2, endLine: 117, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Multi-File YAML \u2014 4 Files',
        body:
          '<p>Four files compose this configuration:</p>' +
          '<ul>' +
          '<li><strong>main.yaml</strong> \u2014 Wires the MQTT source to console and MQTT sinks</li>' +
          '<li><strong>mqttSource1.yaml</strong> \u2014 TLS-enabled MQTT source with client cert and CA cert</li>' +
          '<li><strong>mqttSink1.yaml</strong> \u2014 TLS-enabled MQTT sink with base_topic and retain</li>' +
          '<li><strong>consoleSink1.yaml</strong> \u2014 Console output with Message.Data transform</li>' +
          '</ul>' +
          '<p><strong>TLS properties (shared by source and sink):</strong></p>' +
          '<ul>' +
          '<li><code>tls: true</code> \u2014 Enable TLS encryption</li>' +
          '<li><code>port: 8883</code> \u2014 Standard MQTTS port</li>' +
          '<li><code>client_cert_path</code> \u2014 Path to PKCS#12 (.pfx) client certificate file</li>' +
          '<li><code>client_cert_password</code> \u2014 Password to unlock the .pfx file</li>' +
          '<li><code>ca_cert_path</code> \u2014 CA certificate for trust chain validation</li>' +
          '<li><code>tls_insecure: true</code> \u2014 Skip hostname validation (dev only; set false in production)</li>' +
          '</ul>',
        related: [
          { page: '21', label: '21 \u2014 Multi-File Configs' },
          { page: '04', label: '04 \u2014 YAML Basics' }
        ]
      }
    },
    {
      id: 'ex12-keyconcepts',
      startLine: 118, startCol: 2, endLine: 145, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>TLS Encryption</strong> \u2014 <code>tls: true</code> enables encrypted transport on port 8883 (MQTTS). All data between DIME and the broker is encrypted in transit, preventing eavesdropping on the wire.</p>' +
          '<p><strong>Client Certificates</strong> \u2014 <code>client_cert_path</code> points to a PKCS#12 (.pfx) file containing the client\u2019s private key and certificate. This enables mutual TLS: the broker verifies the client, and the client verifies the broker using the CA cert.</p>' +
          '<p><strong>tls_insecure</strong> \u2014 When <code>true</code>, skips server certificate hostname validation. Necessary for development with self-signed certificates. In production, set to <code>false</code> and ensure the CA cert properly validates the broker\u2019s certificate.</p>' +
          '<p><strong>MQTT Source + Sink</strong> \u2014 Both connect to the same broker. The source subscribes to all topics (<code>#</code>), and the sink republishes under <code>base_topic: MqttSecure1</code>. This creates a relay where DIME can transform or filter messages between subscribe and publish.</p>' +
          '<p><strong>Retain Flag</strong> \u2014 <code>retain: true</code> on the sink tells the broker to keep the last message for each topic. New subscribers immediately get the latest value without waiting for the next publish.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '07', label: '07 \u2014 Sink Connectors' },
          { page: 'EX11', label: 'EX11 \u2014 MQTT to WebSocket Bridge' }
        ]
      }
    }
  ]
};
