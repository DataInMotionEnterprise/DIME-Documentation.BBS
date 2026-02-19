```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        13 — MQTT Integration                         │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Subscribe, transform, republish.               │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          The most common pattern.                       │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MQTT AS A SOURCE                                                                               │
│   ────────────────                                                                               │
│                                                                                                  │
│   Subscribe to sensor topics from a local broker and ingest into the ring buffer:                │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sources:                                                                             │     │
│   │     - name: sensors                                                                    │     │
│   │       connector: MQTT                                                                  │     │
│   │       address: mqtt.local                    # broker hostname or IP                   │     │
│   │       port: !!int 1883                       # default MQTT port                       │     │
│   │       client_id: dime-sub                    # unique client identifier                │     │
│   │       username: user                         # broker credentials                      │     │
│   │       password: pass                                                                   │     │
│   │       base_topic: factory/sensors            # subscribe to factory/sensors/#          │     │
│   │       qos: !!int 1                           # 0=at most once, 1=at least once        │     │
│   │       clean_session: !!bool true             # no persistent session state             │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   DIME subscribes to base_topic/# (wildcard).  Each sub-topic becomes an item path.             │
│   Message: factory/sensors/line1/temp  →  Ring buffer path: sensors/line1/temp                   │
│                                                                                                  │
│   MQTT CONFIG FIELDS                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   ┌─────────────────────┬────────────────────────────────────────────────────────────────┐       │
│   │  Field              │  Description                                                   │       │
│   ├─────────────────────┼────────────────────────────────────────────────────────────────┤       │
│   │  address            │  Broker hostname or IP address                                 │       │
│   │  port               │  Broker port (1883 plain, 8883 TLS)                            │       │
│   │  client_id          │  Unique ID for this MQTT client (must be unique per broker)    │       │
│   │  username / password│  Credentials (optional, depends on broker config)              │       │
│   │  base_topic         │  Root topic — DIME appends /# for wildcard subscription        │       │
│   │  qos                │  Quality of Service: 0, 1, or 2                                │       │
│   │  clean_session      │  true = no state between reconnects, false = resume session    │       │
│   │  retain             │  (sink only) true = broker stores last message per topic       │       │
│   └─────────────────────┴────────────────────────────────────────────────────────────────┘       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   TLS / SSL CONFIGURATION                                                                        │
│   ───────────────────────                                                                        │
│                                                                                                  │
│   For encrypted connections (port 8883), add the TLS flags:                                      │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │       tls: !!bool true                       # enable TLS encryption                   │     │
│   │       tls_insecure: !!bool false             # set true for self-signed certs          │     │
│   │                                                                                        │     │
│   │   ┌─────────────────────────────────────────────────────────────────────────────┐      │     │
│   │   │                                                                             │      │     │
│   │   │  tls: false  +  port 1883   =  Plain TCP           (dev / internal)        │      │     │
│   │   │  tls: true   +  port 8883   =  TLS encrypted       (production)            │      │     │
│   │   │  tls: true   +  tls_insecure  =  TLS, skip verify  (self-signed certs)     │      │     │
│   │   │                                                                             │      │     │
│   │   └─────────────────────────────────────────────────────────────────────────────┘      │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   Always use TLS in production.  tls_insecure is for self-signed certificates only.              │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   MQTT AS A SINK                                                                                 │
│   ──────────────                                                                                 │
│                                                                                                  │
│   Republish transformed data to a cloud broker:                                                  │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sinks:                                                                               │     │
│   │     - name: cloud_mqtt                                                                 │     │
│   │       connector: MQTT                                                                  │     │
│   │       address: mqtt.cloud.com                # cloud broker endpoint                   │     │
│   │       port: !!int 8883                       # TLS port                                │     │
│   │       tls: !!bool true                       # encrypted                               │     │
│   │       client_id: dime-pub                    # unique client ID for publishing         │     │
│   │       base_topic: normalized/data            # publish under this prefix               │     │
│   │       retain: !!bool true                    # broker keeps last value per topic       │     │
│   │       qos: !!int 1                                                                     │     │
│   │       include_filter: "sensors/.*"           # only forward sensor data                │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   Ring buffer path sensors/line1/temp  →  Published to normalized/data/line1/temp               │
│   The retain flag means new subscribers immediately get the last known value.                    │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SPARKPLUG B — INDUSTRIAL MQTT                                                                  │
│   ─────────────────────────────                                                                  │
│                                                                                                  │
│   SparkplugB adds structure to MQTT for industrial use:                                          │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   SparkplugB vs plain MQTT:                                                            │     │
│   │                                                                                        │     │
│   │   ┌──────────────────────┬──────────────────────────────────────────────────────┐      │     │
│   │   │  Feature             │  Plain MQTT            SparkplugB                    │      │     │
│   │   ├──────────────────────┼──────────────────────────────────────────────────────┤      │     │
│   │   │  Payload format      │  Freeform (JSON/text)  Protobuf (typed metrics)      │      │     │
│   │   │  Birth certificates  │  Not supported         NBIRTH/DBIRTH on connect      │      │     │
│   │   │  Death certificates  │  LWT (simple)          NDEATH/DDEATH (structured)    │      │     │
│   │   │  Topic namespace     │  User-defined          spBv1.0/group/type/node/dev   │      │     │
│   │   │  State awareness     │  Manual                Automatic via birth/death     │      │     │
│   │   │  Data types          │  String only           Int, Float, Bool, DateTime    │      │     │
│   │   └──────────────────────┴──────────────────────────────────────────────────────┘      │     │
│   │                                                                                        │     │
│   │   Use connector: SparkplugB instead of connector: MQTT                                 │     │
│   │   DIME handles birth/death certificates and Protobuf encoding automatically.           │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CLEAN SESSION AND RETAIN                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   Two flags that control message persistence:                                                    │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   clean_session: !!bool true                                                           │     │
│   │   ┌────────────────────────────────────────────────────────────────────────────┐       │     │
│   │   │  true  = Start fresh on every connect. No queued messages. No state.      │       │     │
│   │   │  false = Broker remembers subscriptions and queues messages while offline. │       │     │
│   │   └────────────────────────────────────────────────────────────────────────────┘       │     │
│   │                                                                                        │     │
│   │   retain: !!bool true  (sink only)                                                     │     │
│   │   ┌────────────────────────────────────────────────────────────────────────────┐       │     │
│   │   │  true  = Broker stores the LAST message per topic. New subs get it.       │       │     │
│   │   │  false = Messages are transient. Only delivered to active subscribers.     │       │     │
│   │   └────────────────────────────────────────────────────────────────────────────┘       │     │
│   │                                                                                        │     │
│   │   Typical patterns:                                                                    │     │
│   │     Source: clean_session true  — DIME is stateless, always re-subscribes              │     │
│   │     Sink:   retain true         — Dashboard sees latest value on page load             │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   EDGE-TO-CLOUD FLOW                                                                             │
│   ──────────────────                                                                             │
│                                                                                                  │
│   ┌──────────┐    ┌─────────────┐    ┌────────────────────────────┐    ┌─────────────────┐       │
│   │          │    │             │    │         D I M E            │    │                 │       │
│   │ Devices  │    │   Local     │    │                            │    │   Cloud         │       │
│   │          │    │   Broker    │    │  ┌────────┐  ┌─────────┐  │    │   Broker        │       │
│   │ Sensor ──┼───▶│             │    │  │ Source │  │  Sink   │  │    │                 │       │
│   │          │    │  mqtt.local │───▶│  │ (MQTT) │─▶│ (MQTT)  │──┼───▶│  mqtt.cloud.com │       │
│   │ Sensor ──┼───▶│  :1883     │    │  └────────┘  └─────────┘  │    │  :8883 (TLS)    │       │
│   │          │    │             │    │       │                    │    │                 │       │
│   │ Sensor ──┼───▶│             │    │  ┌────┴────────────────┐  │    │                 │       │
│   │          │    │             │    │  │    Ring Buffer      │  │    │                 │       │
│   │          │    │             │    │  │    Transform/Filter │  │    │                 │       │
│   │          │    │             │    │  └─────────────────────┘  │    │                 │       │
│   │          │    │             │    │                            │    │                 │       │
│   └──────────┘    └─────────────┘    └────────────────────────────┘    └─────────────────┘       │
│                                                                                                  │
│     DEVICES           EDGE               DIME CONNECTOR                  CLOUD                   │
│     Publish to        Receives all        Subscribe → Buffer →           Receives normalized     │
│     local broker      sensor data         Transform → Republish          data over TLS           │
│                                                                                                  │
│   This pattern works for any MQTT-to-MQTT bridge scenario:                                       │
│     • Edge sensors  →  Cloud analytics                                                           │
│     • Local SCADA   →  Enterprise historian                                                      │
│     • OT network    →  IT network (via TLS)                                                      │
│                                                                                                  │
│   To chain multiple DIME instances, see page 22 — Instance Chaining.                             │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
