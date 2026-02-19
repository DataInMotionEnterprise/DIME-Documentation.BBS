/**
 * EX33 — ROS2 Robotics
 * ROS2 topic subscriptions → MQTT. Bridge ROS2 to non-ROS systems.
 */
DIME_PAGES['EX33'] = {
  id: 'EX33',
  title: 'EX33 \u2014 ROS2 Robotics',
  file: 'content/EX33-ros2-robotics.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex33-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'ROS2 Robotics \u2014 Overview',
        body:
          '<p>This example bridges <strong>ROS2 (Robot Operating System 2)</strong> topics into MQTT, enabling non-ROS enterprise systems to consume robot data:</p>' +
          '<ul>' +
          '<li><strong>Ros2 connector</strong> \u2014 DIME subscribes to ROS2 DDS topics using typed .NET message classes loaded from external DLLs</li>' +
          '<li><strong>4 topic subscriptions</strong> \u2014 /chatter (String), /emergency_stop (Bool), /bms/status (BatteryState), /motors/status (LynxMultiStatus)</li>' +
          '<li><strong>MQTT output</strong> \u2014 Republishes ROS2 data under <code>base_topic: ros2</code> for SCADA, dashboards, and cloud systems</li>' +
          '</ul>' +
          '<p>This is a single-file configuration demonstrating how DIME bridges robotics middleware to industrial IT infrastructure.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '14', label: '14 \u2014 MQTT Connector' }
        ]
      }
    },
    {
      id: 'ex33-dataflow',
      startLine: 13, startCol: 2, endLine: 42, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'ROS2 DDS \u2192 DIME \u2192 MQTT',
        body:
          '<p>DIME acts as a protocol bridge between the ROS2 DDS network and MQTT:</p>' +
          '<ol>' +
          '<li><strong>ROS2 Network</strong> \u2014 A Clearpath A300 robot publishes topics for chatter, emergency stop, battery status, and motor status using standard and vendor-specific message types</li>' +
          '<li><strong>Ros2 Connector</strong> \u2014 Subscribes to each topic with a fully-qualified .NET type (e.g., <code>Ros2cs.Messages.Sensor.BatteryState, Ros2cs-ros2-sensor_msgs</code>). DIME handles DDS discovery and message deserialization</li>' +
          '<li><strong>Console + MQTT Sinks</strong> \u2014 Console for debugging, MQTT with <code>base_topic: ros2</code> and <code>retain: true</code> for enterprise consumers</li>' +
          '</ol>' +
          '<p>External message type DLLs (<code>Ros2cs-ros2-sensor_msgs.dll</code>, <code>Ros2cs-clearpathrobotics-clearpath_msgs.dll</code>) are loaded via the <code>message_libraries</code> array.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '20', label: '20 \u2014 Report By Exception' }
        ]
      }
    },
    {
      id: 'ex33-config',
      startLine: 43, startCol: 2, endLine: 103, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Single-File ROS2 Configuration',
        body:
          '<p>The entire configuration is in one <code>main.yaml</code> with a Ros2 source and two sinks:</p>' +
          '<ul>' +
          '<li><strong>message_libraries</strong> \u2014 Array of DLL paths for ROS2 message type definitions. Standard messages (std_msgs, sensor_msgs) and vendor messages (Clearpath) are in separate assemblies</li>' +
          '<li><strong>type field</strong> \u2014 Each item specifies a fully-qualified .NET type: <code>Ros2cs.Messages.Std.String, DIME</code> (built-in) or <code>Ros2cs.Messages.Sensor.BatteryState, Ros2cs-ros2-sensor_msgs</code> (external DLL)</li>' +
          '<li><strong>address</strong> \u2014 The ROS2 topic name (e.g., <code>/chatter</code>, <code>/A300_XXXXX/platform/bms/status</code>)</li>' +
          '<li><strong>script</strong> \u2014 Receives the deserialized message object as <code>result</code>. For String messages, <code>result.Data</code> extracts the payload</li>' +
          '</ul>' +
          '<p>The Chatter item uses <code>rbe: false</code> to forward every message, while other items use default RBE to only report changes.</p>',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '09', label: '09 \u2014 Scripting' }
        ]
      }
    },
    {
      id: 'ex33-keyconcepts',
      startLine: 105, startCol: 2, endLine: 133, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>ROS2 Connector</strong> \u2014 DIME subscribes to ROS2 DDS topics using the Ros2 connector. Each item specifies a .NET type for deserialization and a topic address. DIME handles DDS discovery, subscription lifecycle, and message decoding automatically.</p>' +
          '<p><strong>External Message Libraries</strong> \u2014 ROS2 message types are loaded from DLLs at runtime via <code>message_libraries</code>. The <code>type</code> field references both class and assembly: <code>"TypeName, AssemblyName"</code>. This allows any ROS2 message type without recompiling DIME.</p>' +
          '<p><strong>ROS2-to-MQTT Bridge</strong> \u2014 The core use case: subscribe to ROS2 topics on a robot and republish to MQTT for enterprise systems. SCADA, dashboards, and cloud platforms consume MQTT without knowing DDS.</p>' +
          '<p><strong>Typed Message Access</strong> \u2014 Scripts receive the deserialized ROS2 message object. For <code>std_msgs/String</code>, <code>result.Data</code> extracts the string. For complex types like <code>BatteryState</code>, returning the full object preserves all fields (voltage, current, charge, capacity).</p>' +
          '<p><strong>RBE Override</strong> \u2014 <code>rbe: false</code> on Chatter ensures every message is forwarded, even duplicates. For event-style topics, disable RBE so nothing is filtered.</p>',
        related: [
          { page: '06', label: '06 \u2014 Source Connectors' },
          { page: '14', label: '14 \u2014 MQTT Connector' },
          { page: '20', label: '20 \u2014 Report By Exception' }
        ]
      }
    }
  ]
};
