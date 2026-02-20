
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF22 — MTConnect SHDR                                             CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Streams SHDR to an external Agent.                                                       │
  │                                                                                           │
  │  Connector Type: MTConnectSHDR                       Source ✗    Sink ✓                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK PROPERTIES
  ───────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "MTConnectSHDR".             │
  │  port                   int      7878        SHDR listening port.                         │
  │  device_key             string   Empty       Device key.                                  │
  │  heartbeat_interval     int      10000       Ping/Pong frequency in milliseconds.         │
  │  filter_duplicates      bool     TRUE        Filter duplicates.                           │
  │  output_folder          string   ./Output/MTConnect   Folder path for Devices.xml.        │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SINK EXAMPLE
  ────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: shdrSink1                                                                        │
  │    connector: MTConnectSHDR                                                               │
  │    port: !!int 7878                                                                       │
  │    device_key: ~                                                                          │
  │    heartbeat_interval: !!int 10000                                                        │
  │    filter_duplicates: !!bool true                                                         │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  REFERENCES
  ──────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  MTConnect.NET Github: https://github.com/TrakHound/MTConnect.NET                         │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
