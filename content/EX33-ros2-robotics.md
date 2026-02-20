```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX33 — ROS2 ROBOTICS                                                DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ───────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Bridges ROS2 (Robot Operating System 2) topics into MQTT for non-ROS systems. A       │
  │  single Ros2 connector subscribes to topics like /chatter, /emergency_stop, and        │
  │  /bms/status using typed message definitions loaded from external DLLs. Output goes    │
  │  to Console and MQTT. Single-file config for ROS2-to-enterprise integration.           │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

       ┌──────────────────────────────────────┐
       │           ROS2 Network               │
       │                                      │
       │  /chatter           (std_msgs/String)│
       │  /A300/emergency_stop (std_msgs/Bool)│
       │  /A300/bms/status   (sensor_msgs/    │
       │                      BatteryState)   │
       │  /A300/motors/status (clearpath_msgs/│
       │                      LynxMultiStatus)│
       └─────────────┬────────────────────────┘
                     │  DDS subscription
       ┌─────────────┴────────────────────────┐
       │  ros2 (Ros2 connector)               │         ┌───────────────────┐
       │  scan_interval: 1000ms               │         │  Disruptor Ring   │
       │                                      │────────▶│  Buffer (4096)    │
       │  message_libraries:                  │         │                   │
       │    - Ros2cs-ros2-sensor_msgs.dll     │         └─────────┬─────────┘
       │    - Ros2cs-clearpathrobotics-       │                   │
       │      clearpath_msgs.dll              │              ┌────┴────┐
       └──────────────────────────────────────┘              │         │
                                                             ▼         ▼
            1 SOURCE                                   ┌─────────┐ ┌──────┐
          (Ros2 connector)                             │ Console │ │ MQTT │
                                                       │         │ │:1883 │
                                                       └─────────┘ └──────┘
                                                              2 SINKS

  CONFIGURATION                                                    [1 file + 3 DLLs + 1 .so]
  ─────────────

  ┌─ main.yaml ──────────────────────────────────────────────────────────────────────────────┐
  │                                                                                          │
  │  app:                                                                                    │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                      │
  │    ring_buffer: !!int 4096                                                               │
  │    http_server_uri: http://0.0.0.0:9999/                                                 │
  │    ws_server_uri: ws://0.0.0.0:9998/                                                     │
  │                                                                                          │
  │  sinks:                                                                                  │
  │    - name: console                                                                       │
  │      connector: Console                                                                  │
  │      scan_interval: !!int 1000                                                           │
  │      exclude_filter:                                                                     │
  │        - /\$SYSTEM                                                                       │
  │                                                                                          │
  │    - name: mqtt                                                                          │
  │      connector: MQTT                                                                     │
  │      address: 192.168.150.225                                                            │
  │      port: !!int 1883                                                                    │
  │      base_topic: ros2                     # Topics: ros2/ros2/Chatter, etc.              │
  │      qos: !!int 1                                                                        │
  │      retain: !!bool true                                                                 │
  │      use_sink_transform: !!bool false                                                    │
  │                                                                                          │
  │  sources:                                                                                │
  │    - name: ros2                                                                          │
  │      connector: Ros2                      # ROS2 DDS subscription connector              │
  │      scan_interval: !!int 1000                                                           │
  │      message_libraries:                   # External message type DLLs                   │
  │        - ./Configs/Ros2cs-ros2-sensor_msgs.dll                                           │
  │        - ./Configs/Ros2cs-clearpathrobotics-clearpath_msgs.dll                           │
  │      items:                                                                              │
  │        - name: Chatter                                                                   │
  │          rbe: !!bool false                # Stream all messages                          │
  │          type: Ros2cs.Messages.Std.String, DIME                                          │
  │          address: /chatter                # ROS2 topic name                              │
  │          script: |                                                                       │
  │            print(result)                                                                 │
  │            return result.Data             # Extract string from ROS2 message             │
  │                                                                                          │
  │        - name: EmergencyStop                                                             │
  │          type: Ros2cs.Messages.Std.Bool, DIME                                            │
  │          address: /A300_XXXXX/platform/emergency_stop                                    │
  │          script: return result                                                           │
  │                                                                                          │
  │        - name: BatteryStatus                                                             │
  │          type: Ros2cs.Messages.Sensor.BatteryState, Ros2cs-ros2-sensor_msgs              │
  │          address: /A300_XXXXX/platform/bms/status                                        │
  │          script: return result            # Full BatteryState object                     │
  │                                                                                          │
  │        - name: MotorStatus                                                               │
  │          enabled: !!bool false            # Disabled -- needs Clearpath hardware         │
  │          type: Ros2cs.Messages.ClearpathMotor.LynxMultiStatus,                           │
  │                Ros2cs-clearpathrobotics-clearpath_msgs                                   │
  │          address: /A300_XXXXX/platform/motors/status                                     │
  │          script: return result                                                           │
  │                                                                                          │
  └──────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * ROS2 Connector -- DIME subscribes to ROS2 DDS topics using the Ros2 connector.      │
  │    Each item specifies a fully-qualified .NET type for message deserialization and a   │
  │    ROS2 topic address. DIME handles DDS discovery, subscription, and message decoding  │
  │    automatically.                                                                      │
  │                                                                                        │
  │  * External Message Libraries -- ROS2 message types are loaded from DLLs at runtime    │
  │    via message_libraries. Standard messages (std_msgs, sensor_msgs) and vendor         │
  │    messages (Clearpath) are in separate assemblies. The type field references the      │
  │    assembly: "Ros2cs.Messages.Sensor.BatteryState, Ros2cs-ros2-sensor_msgs".           │
  │                                                                                        │
  │  * ROS2-to-MQTT Bridge -- This is the core use case: subscribe to ROS2 topics on a     │
  │    robot, republish to MQTT for enterprise systems (SCADA, dashboards, cloud) that     │
  │    do not speak DDS. The MQTT sink publishes under base_topic "ros2" so topics         │
  │    become ros2/ros2/Chatter, ros2/ros2/BatteryStatus, etc.                             │
  │                                                                                        │
  │  * Typed Message Access -- The script receives the deserialized ROS2 message as        │
  │    result. For std_msgs/String, result.Data extracts the string payload. For complex   │
  │    types like BatteryState, returning the full object preserves all fields (voltage,   │
  │    current, charge, etc.) for downstream consumers.                                    │
  │                                                                                        │
  │  * RBE Override -- The Chatter item uses rbe: false to forward every message, even     │
  │    duplicates. For event-style ROS2 topics where every message matters, disable RBE    │
  │    to ensure nothing is filtered out.                                                  │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```