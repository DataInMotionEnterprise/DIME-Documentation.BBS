
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF26 — ROS2                                                        CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Subscribes to ROS2 topics.                                                               │
  │                                                                                           │
  │  Connector Type: ROS2                                 Source ✓    Sink ✗                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "ROS2".                      │
  │  message_libraries      string[] Empty       Paths to ROS2 message structure DLLs.        │
  │  items.address          string   Empty       Topic.                                       │
  │  items.type             string   Empty       Qualified type of ROS2 message structure.     │
  │  items.qos_reliability  string   best_effort Reliability: 'reliable' or 'best_effort'.    │
  │  items.qos_durability   string   volatile    Durability: 'volatile' or 'transient_local'. │
  │  items.qos_history      string   keep_last   History: 'keep_last' or 'keep_all'.          │
  │  items.qos_depth        int      10          Queue depth for keep_last history.            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: ros2                                                                             │
  │    connector: Ros2                                                                        │
  │    message_libraries:                                                                     │
  │      - ./Configs/Ros2cs-ros2-sensor_msgs.dll                                              │
  │      - ./Configs/Ros2cs-clearpathrobotics-clearpath_msgs.dll                              │
  │    items:                                                                                 │
  │      - name: Chatter                                                                      │
  │        type: Ros2cs.Messages.Std.String, DIME                                             │
  │        address: /chatter                                                                  │
  │        script: |                                                                          │
  │          print(result)                                                                    │
  │          return result.Data                                                               │
  │      - name: EmergencyStop                                                                │
  │        type: Ros2cs.Messages.Std.Bool, DIME                                               │
  │        address: /A300_XXXXX/platform/emergency_stop                                       │
  │        script: return result                                                              │
  │      - name: BatteryStatus                                                                │
  │        type: Ros2cs.Messages.Sensor.BatteryState, Ros2cs-ros2-sensor_msgs                 │
  │        address: /A300_XXXXX/platform/bms/status                                           │
  │        script: return result                                                              │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
