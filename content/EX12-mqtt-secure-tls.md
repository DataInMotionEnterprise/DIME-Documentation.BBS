```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX12 — SECURE MQTT (TLS)                                               DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Encrypted MQTT with TLS and client certificates. Both source and sink connect to       │
  │  the same broker over port 8883 (MQTTS). The source subscribes to all topics (#),      │
  │  while the sink republishes to a base topic. Demonstrates certificate-based mutual      │
  │  authentication — client PFX cert, CA cert, and TLS configuration for secure MQTT.     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

                                        ┌──────────────────┐
      ┌──────────────────────┐     ┌───▶│  Console Sink    │  stdout
      │   MQTT Source (TLS)   │     │    │  transform: true │
      │                       │     │    └──────────────────┘
      │  Broker: localhost    │     │
      │  Port:   8883 (MQTTS) │     │
      │  TLS:    true         ├─────┤
      │  Client cert: PFX    │     │
      │  CA cert: ca.crt      │     │    ┌──────────────────┐
      │                       │     └───▶│  MQTT Sink (TLS) │  localhost:8883
      │  Subscribe: #         │          │  base_topic:      │
      │  (all topics)         │          │  MqttSecure1      │
      │                       │          │  retain: true     │
      │  scan: 2000ms         │          └──────────────────┘
      │  RBE: true            │
      └──────────────────────┘
             SOURCE                      RING BUFFER              SINKS
       (MQTTS subscriber)             (4096 slots)          (2 destinations)

  CONFIGURATION — 4 files                                                         [multi-file]
  ───────────────────────

  ── main.yaml ──────────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sinks:                                                                                │
  │    - *consoleSink1                                # Debug output                       │
  │    - *mqttSink1                                   # Republish to MQTT                  │
  │  sources:                                                                              │
  │    - *mqttSource1                                 # Secure MQTT subscription           │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── mqttSource1.yaml ───────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mqttSource1: &mqttSource1                                                             │
  │    name: mqttSource1                                                                   │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 2000                      # Drain queue every 2 seconds        │
  │    connector: MQTT                                                                     │
  │    rbe: !!bool true                                                                    │
  │    itemized_read: !!bool false                    # Event-driven queuing mode          │
  │    address: localhost                             # Broker hostname                    │
  │    port: !!int 8883                               # MQTTS (TLS) port                   │
  │    clean_session: !!bool true                     # Start fresh each connect           │
  │    tls: !!bool true                               # Enable TLS encryption              │
  │    tls_insecure: !!bool true                      # Skip server cert validation        │
  │    client_cert_path: c:/temp/client.pfx           # Client certificate (PKCS#12)       │
  │    client_cert_password: password                 # PFX file password                  │
  │    ca_cert_path: c:/temp/ca.crt                   # CA certificate for trust chain     │
  │    qos: !!int 0                                   # At most once                       │
  │    items:                                                                              │
  │      - name: All                                                                       │
  │        enabled: !!bool true                                                            │
  │        address: "#"                               # Subscribe to all topics            │
  │        sink:                                                                           │
  │          transform:                                                                    │
  │            type: script                                                                │
  │            template: |                                                                 │
  │              Message.Data                         # Extract data value only            │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── mqttSink1.yaml ─────────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  mqttSink1: &mqttSink1                                                                 │
  │    name: mqttSink1                                                                     │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: MQTT                                # MQTT as a sink (publisher)         │
  │    address: localhost                                                                  │
  │    port: !!int 8883                               # Same broker, same TLS port         │
  │    base_topic: MqttSecure1                        # Prefix for published topics        │
  │    tls: !!bool true                               # TLS encryption                     │
  │    tls_insecure: !!bool true                                                           │
  │    client_cert_path: c:/temp/client.pfx                                                │
  │    client_cert_password: password                                                      │
  │    ca_cert_path: c:/temp/ca.crt                                                        │
  │    qos: !!int 0                                                                        │
  │    retain: !!bool true                            # Retain last message per topic      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  ── consoleSink1.yaml ──────────────────────────────────────────────────────────────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  consoleSink1: &consoleSink1                                                           │
  │    name: consoleSink1                                                                  │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 1000                                                           │
  │    connector: Console                                                                  │
  │    use_sink_transform: !!bool true                # Apply Message.Data transform       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * TLS Encryption — tls: true enables encrypted transport. Port 8883 is the standard   │
  │    MQTTS port. All data between DIME and the broker is encrypted in transit.            │
  │                                                                                        │
  │  * Client Certificates — client_cert_path points to a PKCS#12 (.pfx) file containing  │
  │    the client's private key and certificate. client_cert_password unlocks it.           │
  │    ca_cert_path provides the CA certificate for the trust chain.                       │
  │                                                                                        │
  │  * tls_insecure: true — Skips server certificate hostname validation. Useful for       │
  │    development with self-signed certificates. Set to false in production and ensure     │
  │    the CA cert properly validates the broker's server certificate.                     │
  │                                                                                        │
  │  * MQTT Source + Sink — Both source and sink connect to the same broker. The source     │
  │    subscribes to # (all topics) and the sink republishes under base_topic. This         │
  │    creates a message relay with DIME as the processing layer in between.               │
  │                                                                                        │
  │  * Retain Flag — retain: true on the sink tells the broker to keep the last message    │
  │    for each topic. New subscribers immediately receive the latest value without         │
  │    waiting for the next publish cycle.                                                 │
  │                                                                                        │
  │  * clean_session — When true, the broker discards any previous session state.           │
  │    Subscriptions are re-established on each connection. Set to false for persistent     │
  │    sessions where the broker queues messages during disconnects.                       │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
