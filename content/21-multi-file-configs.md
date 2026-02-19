```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        21 — Multi-File Configs                        │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Organize complex setups.                       │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          Anchors, references, and overrides.            │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   SINGLE FILE vs MULTI-FILE                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   Simple setups: everything in main.yaml. Complex setups: split across multiple files.           │
│                                                                                                  │
│   ┌──────────────────────────────────────┐    ┌──────────────────────────────────────┐           │
│   │                                      │    │                                      │           │
│   │   SINGLE FILE                        │    │   MULTI-FILE                         │           │
│   │                                      │    │                                      │           │
│   │   Configs/                           │    │   Configs/                           │           │
│   │   └── main.yaml                      │    │  ├── mqtt-settings.yaml              │           │
│   │       ├── app:                       │    │  ├── plc-sources.yaml                │           │
│   │       ├── sources:                   │    │  ├── database-sinks.yaml             │           │
│   │       │   ├── plc1                   │    │  ├── dashboard-sinks.yaml            │           │
│   │       │   ├── plc2                   │    │  └── main.yaml                       │           │
│   │       │   └── mqtt                   │    │      └── app:                        │           │
│   │       └── sinks:                     │    │          └── (overrides only)        │           │
│   │           ├── influx                 │    │                                      │           │
│   │           └── splunk                 │    │  Each file contains part of the      │           │
│   │                                      │    │   configuration. All are merged.     │           │
│   │   Everything in one place.           │    │                                      │           │
│   │   Good for < 5 connectors.           │    │   Good for 5+ connectors.            │           │
│   │                                      │    │                                      │           │
│   └──────────────────────────────────────┘    └──────────────────────────────────────┘           │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   LOADING ORDER — HOW FILES MERGE                                                                │
│   ───────────────────────────────                                                                │
│                                                                                                  │
│   DIME loads all *.yaml files from the Configs directory. main.yaml is loaded LAST.              │
│                                                                                                  │
│   ┌───────────────────────────────────────────────────────────────────────────────────────┐      │
│   │                                                                                       │      │
│   │   Configs/                                                                            │      │
│   │   ├── 01-mqtt.yaml          ─┐                                                        │      │
│   │   ├── 02-opcua.yaml          │── loaded alphabetically                                │      │
│   │   ├── 03-influx.yaml         │   and merged together                                  │      │
│   │   ├── 04-splunk.yaml        ─┘                                                        │      │
│   │   └── main.yaml             ◀── loaded LAST, wins on conflicts                        │      │
│   │                                                                                       │      │
│   │                                                                                       │      │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         ┌──────────┐         │      │
│   │   │01-mqtt   │  │02-opcua  │  │03-influx │  │04-splunk │         │ main     │         │      │
│   │   │.yaml     │  │.yaml     │  │.yaml     │  │.yaml     │         │ .yaml    │         │      │
│   │   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         └─────┬────┘         │      │
│   │        │             │             │             │                     │              │      │
│   │        └─────────────┴─────────────┴─────────────┘                     │              │      │
│   │                       │                                                │              │      │
│   │                       ▼                                                │              │      │
│   │              ┌─────────────────┐                                       │              │      │
│   │              │  Merged config  │◀──────────────────────────────────────┘              │      │
│   │              │  (all files)    │   main.yaml overrides on conflict                    │      │
│   │              └────────┬────────┘                                                      │      │
│   │                       │                                                               │      │
│   │                       ▼                                                               │      │
│   │              ┌─────────────────┐                                                      │      │
│   │              │  Running DIME   │                                                      │      │
│   │              │  instance       │                                                      │      │
│   │              └─────────────────┘                                                      │      │
│   │                                                                                       │      │
│   │   Arrays (sources, sinks) are concatenated. Scalar values: last loaded wins.          │      │
│   │                                                                                       │      │
│   └───────────────────────────────────────────────────────────────────────────────────────┘      │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   YAML ANCHORS & REFERENCES                                                                      │
│   ─────────────────────────                                                                      │
│                                                                                                  │
│   Define once, reuse everywhere. Anchors (&) create named values. References (*) reuse them.     │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   ┌─ DEFINE ──────────────────────────────────────────────────────────────────────┐    │     │
│   │   │                                                                               │    │     │
│   │   │   mqtt_settings: &mqtt_common      ◀── Anchor: names this block "mqtt_common" │    │     │
│   │   │     address: mqtt.factory.local                                               │    │     │
│   │   │     port: !!int 1883                                                          │    │     │
│   │   │     username: dime                                                            │    │     │
│   │   │     password: secret                                                          │    │     │
│   │   │                                                                               │    │     │
│   │   └───────────────────────────────────────────────────────────────────────────────┘    │     │
│   │                                                                                        │     │
│   │   ┌─ REUSE ───────────────────────────────────────────────────────────────────────┐    │     │
│   │   │                                                                               │    │     │
│   │   │   sources:                                                                    │    │     │
│   │   │     - name: line1_mqtt                                                        │    │     │
│   │   │       connector: MQTT                                                         │    │     │
│   │   │       <<: *mqtt_common               ◀── Merge: injects all mqtt_common keys  │    │     │
│   │   │       base_topic: line1/sensors      ◀── Override or add unique keys          │    │     │
│   │   │                                                                               │    │     │
│   │   │     - name: line2_mqtt                                                        │    │     │
│   │   │       connector: MQTT                                                         │    │     │
│   │   │       <<: *mqtt_common               ◀── Same settings, different topic       │    │     │
│   │   │       base_topic: line2/sensors                                               │    │     │
│   │   │                                                                               │    │     │
│   │   │     - name: line3_mqtt                                                        │    │     │
│   │   │       connector: MQTT                                                         │    │     │
│   │   │       <<: *mqtt_common               ◀── 10 connectors, 1 definition          │    │     │
│   │   │       base_topic: line3/sensors                                               │    │     │
│   │   │                                                                               │    │     │
│   │   └───────────────────────────────────────────────────────────────────────────────┘    │     │
│   │                                                                                        │     │
│   │   Change the MQTT broker address once in &mqtt_common, all connectors update.          │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   FILE ORGANIZATION PATTERNS                                                                     │
│   ──────────────────────────                                                                     │
│                                                                                                  │
│   Three common approaches. Pick what matches your plant layout:                                  │
│                                                                                                  │
│   ┌──────────────────────────────┐  ┌──────────────────────────────┐  ┌───────────────────────┐  │
│   │                              │  │                              │  │                       │  │
│   │   BY PROTOCOL                │  │   BY MACHINE                 │  │   BY ROLE             │  │
│   │                              │  │                              │  │                       │  │
│   │   Configs/                   │  │   Configs/                   │  │   Configs/            │  │
│   │   ├── mqtt.yaml              │  │   ├── lathe-01.yaml          │  │   ├── sources.yaml    │  │
│   │   ├── opcua.yaml             │  │   ├── mill-02.yaml           │  │   ├── sinks.yaml      │  │
│   │   ├── s7.yaml                │  │   ├── press-03.yaml          │  │   ├── anchors.yaml    │  │
│   │   ├── influx.yaml            │  │   ├── robot-04.yaml          │  │   └── main.yaml       │  │
│   │   └── main.yaml              │  │   └── main.yaml              │  │                       │  │
│   │                              │  │                              │  │   Sources in one,     │  │
│   │   Good when protocols        │  │   Good when machines are     │  │   sinks in another.   │  │
│   │   have shared settings.      │  │   independently managed.     │  │   Clean separation.   │  │
│   │                              │  │                              │  │                       │  │
│   └──────────────────────────────┘  └──────────────────────────────┘  └───────────────────────┘  │
│                                                                                                  │
│   All three patterns work the same way — DIME loads and merges all *.yaml files.                 │
│   Choose what makes your team's workflow easiest.                                                │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE enabled FLAG — DISABLE WITHOUT DELETING                                                    │
│   ────────────────────────────────────────────                                                   │
│                                                                                                  │
│   Set enabled: !!bool false to skip a connector without removing its config.                     │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sources:                                                                             │     │
│   │     - name: active_plc                                                                 │     │
│   │       connector: OpcUa                                                                 │     │
│   │       enabled: !!bool true        ── Running (default if omitted)                      │     │
│   │       address: 192.168.1.10                                                            │     │
│   │                                                                                        │     │
│   │     - name: old_plc                                                                    │     │
│   │       connector: S7                                                                    │     │
│   │       enabled: !!bool false       ── Disabled, config preserved ◀── DIME ignores this  │     │
│   │       address: 192.168.1.20                                                            │     │
│   │                                                                                        │     │
│   │     - name: test_mqtt                                                                  │     │
│   │       connector: MQTT                                                                  │     │
│   │       enabled: !!bool false       ── Disabled during production                        │     │
│   │       address: mqtt.test.local                                                         │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────────────────┐        │
│   │                                                                                     │        │
│   │   LOADED AT STARTUP                                                                 │        │
│   │                                                                                     │        │
│   │   ┌────────────┐  ┌────────────┐  ┌────────────┐                                    │        │
│   │   │ active_plc │  │ old_plc    │  │ test_mqtt  │                                    │        │
│   │   │            │  │            │  │            │                                    │        │
│   │   │  RUNNING   │  │  SKIPPED   │  │  SKIPPED   │                                    │        │
│   │   │  ✓         │  │  ✗ (false) │  │  ✗ (false) │                                    │        │
│   │   └────────────┘  └────────────┘  └────────────┘                                    │        │
│   │                                                                                     │        │
│   │   Disabled connectors use zero resources. Re-enable anytime by setting true.        │        │
│   │                                                                                     │        │
│   └─────────────────────────────────────────────────────────────────────────────────────┘        │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   VISUAL: MULTIPLE FILES → ONE RUNNING CONFIG                                                    │
│   ───────────────────────────────────────────                                                    │
│                                                                                                  │
│      ┌─────────────┐                                                                             │
│      │ mqtt.yaml   │──┐                                                                          │
│      │ sources: 2  │  │                                                                          │
│      └─────────────┘  │                                                                          │
│      ┌─────────────┐  │     ┌────────────────────────────────┐     ┌───────────────────────┐     │
│      │ opcua.yaml  │──┼────▶│         YAML MERGER            │────▶│   RUNNING CONFIG      │     │
│      │ sources: 3  │  │     │                                │     │                       │     │
│      └─────────────┘  │     │  Concatenate sources arrays    │     │  sources: 7           │     │
│      ┌─────────────┐  │     │  Concatenate sinks arrays      │     │  sinks: 4             │     │
│      │ sinks.yaml  │──┤     │  Last-wins for scalar keys     │     │  anchors: resolved    │     │
│      │ sinks: 4    │  │     │  Resolve all anchors           │     │                       │     │
│      └─────────────┘  │     └────────────────────────────────┘     └───────────┬───────────┘     │
│      ┌─────────────┐  │                     ▲                                  │                 │
│      │ main.yaml   │──┘                     │                                  ▼                 │
│      │ app: + wins │          main.yaml loaded last                   ┌────────────────┐         │
│      └─────────────┘          overrides on conflict                   │  DimeService   │         │
│                                                                       │  starts all    │         │
│                                                                       │  connectors    │         │
│                                                                       └────────────────┘         │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   QUICK REFERENCE                                                                                │
│   ───────────────                                                                                │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────┐       │
│   │                                                                                      │       │
│   │   Feature            Syntax                          Effect                          │       │
│   │   ─────────────────  ──────────────────────────────  ──────────────────────────────  │       │
│   │   Anchor             &name                           Defines a reusable block        │       │
│   │   Reference          *name                           Inserts the anchored value      │       │
│   │   Merge key          <<: *name                       Merges keys into a mapping      │       │
│   │   Multi-file         *.yaml in Configs/              All loaded and merged           │       │
│   │   Override           main.yaml                       Loaded last, wins on conflict   │       │
│   │   Disable            enabled: !!bool false           Skips connector, keeps config   │       │
│   │                                                                                      │       │
│   └──────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
