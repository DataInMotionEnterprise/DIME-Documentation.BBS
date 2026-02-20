
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF18 — MQTT                                                        CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Subscribes to and publishes data via an MQTT broker.                                     │
  │                                                                                           │
  │  Connector Type: MQTT                                 Source ✓    Sink ✓                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "MQTT".                      │
  │  address                string   Empty       Broker hostname or IP address.               │
  │  port                   int      1883        Broker port.                                 │
  │  qos                    int      0           Quality of Service (0, 1, 2).                │
  │  itemized_read          bool     FALSE       Match streaming data against items list.     │
  │  clean_session          bool     TRUE        MQTT clean session.                          │
  │  tls                    bool     FALSE       SSL/TLS connection.                          │
  │  tls_insecure           bool     FALSE       Allow untrusted certificates.                │
  │  client_cert_path       string   Empty       Path to client certificate (.pfx).           │
  │  client_cert_password   string   Empty       Client certificate password.                 │
  │  ca_cert_path           string   Empty       Path to CA certificate.                      │
  │  username               string   Empty       Username.                                    │
  │  password               string   Empty       Password.                                    │
  │  items.address          string   Empty       Single or wildcard subscription topic.       │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: mqttSource1                                                                      │
  │    connector: MQTT                                                                        │
  │    address: wss.sharc.tech                                                                │
  │    port: !!int 1883                                                                       │
  │    items:                                                                                 │
  │      - name: subscribe1                                                                   │
  │        address: sharc/+/evt/#                                                             │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "MQTT".                      │
  │  address                string   Empty       Broker hostname or IP address.               │
  │  port                   int      1883        Broker port.                                 │
  │  qos                    int      0           Quality of Service (0, 1, 2).                │
  │  retain                 bool     TRUE        Retain published messages.                   │
  │  base_topic             string   dime        Topic prefix for published messages.         │
  │  clean_session          bool     TRUE        MQTT clean session.                          │
  │  tls                    bool     FALSE       SSL/TLS connection.                          │
  │  tls_insecure           bool     FALSE       Allow untrusted certificates.                │
  │  client_cert_path       string   Empty       Path to client certificate (.pfx).           │
  │  client_cert_password   string   Empty       Client certificate password.                 │
  │  ca_cert_path           string   Empty       Path to CA certificate.                      │
  │  username               string   Empty       Username.                                    │
  │  password               string   Empty       Password.                                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: mqttSink1                                                                        │
  │    connector: MQTT                                                                        │
  │    address: wss.sharc.tech                                                                │
  │    port: !!int 1883                                                                       │
  │    base_topic: ids                                                                        │
  │    qos: !!int 0                                                                           │
  │    retain: !!bool true                                                                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  MQTTnet Github: https://github.com/dotnet/MQTTnet                                        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
