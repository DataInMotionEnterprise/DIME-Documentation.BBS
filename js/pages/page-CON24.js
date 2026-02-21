/**
 * 24 — Docker Deployment
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON24'] = {
  id: 'CON24',
  title: 'CON24 \u2014 Docker Deployment',
  file: 'content/CON24-deploy-docker.md',
  hotspots: [
    {
      id: 'docker-run',
      startLine: 16, startCol: 3, endLine: 47, endCol: 90,
      label: 'Docker Run \u2014 Quick Start',
      panel: {
        title: 'docker run \u2014 Single Container',
        body:
          '<p>Run DIME in a single container with one command:</p>' +
          '<ul>' +
          '<li><strong>Volume mount</strong> \u2014 <code>-v /path/to/configs:/app/Configs</code> maps your YAML files into the container.</li>' +
          '<li><strong>Port mapping</strong> \u2014 <code>-p 9999:9999</code> (REST API) and <code>-p 9998:9998</code> (WebSocket).</li>' +
          '<li><strong>Restart policy</strong> \u2014 <code>--restart unless-stopped</code> keeps DIME running after host reboots.</li>' +
          '<li><strong>Root by default</strong> \u2014 The container runs as root. Add <code>USER app</code> to the Dockerfile for non-root execution.</li>' +
          '</ul>' +
          '<p>Add additional <code>-p</code> flags for protocol-specific ports (SHDR 7878, MQTT 1883, etc.) as needed by your config.</p>',
        yaml:
          'docker run -d \\\n' +
          '  --name dime \\\n' +
          '  -v /path/to/configs:/app/Configs \\\n' +
          '  -p 9999:9999 \\\n' +
          '  -p 9998:9998 \\\n' +
          '  --restart unless-stopped \\\n' +
          '  datainmotionenterprise/connector:latest',
        related: [
          { page: 'CON24', hotspot: 'compose', label: 'Docker Compose multi-container' },
          { page: 'CON24', hotspot: 'volumes', label: 'Volume mounts and ports' }
        ]
      }
    },
    {
      id: 'compose',
      startLine: 55, startCol: 3, endLine: 109, endCol: 90,
      label: 'Docker Compose Stack',
      panel: {
        title: 'Docker Compose \u2014 DIME + InfluxDB + Grafana',
        body:
          '<p>Use Docker Compose to run DIME alongside companion services in a single stack:</p>' +
          '<ul>' +
          '<li><strong>DIME</strong> \u2014 Collects data from devices, writes to InfluxDB sink, serves WebSocket dashboard.</li>' +
          '<li><strong>InfluxDB</strong> \u2014 Time-series database for historical storage and trending.</li>' +
          '<li><strong>Grafana</strong> \u2014 Visualization and alerting. Queries InfluxDB directly.</li>' +
          '</ul>' +
          '<p>All services share a Docker network. DIME references InfluxDB by service name (<code>influxdb:8086</code>).</p>' +
          '<p>Commands: <code>docker compose up -d</code>, <code>docker compose logs -f dime</code>, <code>docker compose down</code>.</p>',
        yaml:
          'version: \'3.8\'\n' +
          'services:\n' +
          '  dime:\n' +
          '    image: datainmotionenterprise/connector:latest\n' +
          '    volumes:\n' +
          '      - ./configs:/app/Configs\n' +
          '    ports:\n' +
          '      - 9999:9999\n' +
          '      - 9998:9998\n' +
          '    restart: unless-stopped\n' +
          '\n' +
          '  influxdb:\n' +
          '    image: influxdb:2\n' +
          '    ports:\n' +
          '      - 8086:8086\n' +
          '    volumes:\n' +
          '      - influx-data:/var/lib/influxdb2',
        related: [
          { page: 'CON24', hotspot: 'docker-run', label: 'Basic docker run' },
          { page: 'CON03', label: 'CON03 \u2014 Installation' }
        ]
      }
    },
    {
      id: 'volumes',
      startLine: 115, startCol: 3, endLine: 134, endCol: 90,
      label: 'Volumes & Port Mapping',
      panel: {
        title: 'Volume Mounts & Port Mapping',
        body:
          '<p><strong>Volumes:</strong></p>' +
          '<ul>' +
          '<li><code>/app/Configs</code> \u2014 Mount your YAML config files here. DIME reads all <code>*.yaml</code> files on startup.</li>' +
          '<li><code>/app/Logs</code> \u2014 Optional. Mount to persist log files outside the container for log aggregation.</li>' +
          '<li><code>/app/Scripts</code> \u2014 Optional. Mount external Lua or Python scripts referenced by connectors.</li>' +
          '</ul>' +
          '<p><strong>Ports:</strong></p>' +
          '<ul>' +
          '<li><code>9999</code> \u2014 REST Admin API (always needed)</li>' +
          '<li><code>9998</code> \u2014 WebSocket feed for dashboards and DIME UX</li>' +
          '<li><code>7878</code> \u2014 SHDR server (MTConnect agent mode)</li>' +
          '<li><code>1883</code> \u2014 MQTT (if DIME acts as broker)</li>' +
          '<li><code>8092</code> \u2014 WebSocketServer sink (custom port)</li>' +
          '</ul>' +
          '<p>Only map ports your configuration actually uses. The REST API port is the only one always needed.</p>',
        related: [
          { page: 'CON24', hotspot: 'docker-run', label: 'Basic docker run' },
          { page: 'CON23', hotspot: 'directories', label: 'CON23 \u2014 Directory layout' }
        ]
      }
    },
    {
      id: 'arm64',
      startLine: 142, startCol: 3, endLine: 169, endCol: 90,
      label: 'ARM64 / Edge Deployment',
      panel: {
        title: 'ARM64 \u2014 Raspberry Pi & Edge Gateways',
        body:
          '<p>DIME provides <strong>multi-architecture Docker images</strong> that automatically select the correct binary for your platform (AMD64 or ARM64).</p>' +
          '<p>Deploy the same <code>datainmotionenterprise/connector:latest</code> image to:</p>' +
          '<ul>' +
          '<li><strong>Raspberry Pi 4/5</strong> \u2014 ARM64 Linux. Ideal for small-scale edge collection (Modbus, S7, MQTT).</li>' +
          '<li><strong>Industrial edge gateways</strong> \u2014 ARM64 devices from vendors like Advantech, Moxa, or Siemens.</li>' +
          '<li><strong>Cloud VMs</strong> \u2014 ARM64 instances on AWS Graviton, Azure Ampere, or GCP Tau T2A.</li>' +
          '</ul>' +
          '<p>Same YAML config. Same container image. Same behavior. The architecture is transparent.</p>',
        related: [
          { page: 'CON22', hotspot: 'three-tier', label: 'CON22 \u2014 Three-tier topology' },
          { page: 'CON22', hotspot: 'edge-config', label: 'CON22 \u2014 Edge instance config' }
        ]
      }
    },
    {
      id: 'ros2',
      startLine: 177, startCol: 3, endLine: 203, endCol: 90,
      label: 'ROS2 Docker Variants',
      panel: {
        title: 'ROS2 Images \u2014 Humble & Jazzy',
        body:
          '<p>For robotics integration, DIME offers Docker images with <strong>ROS2 pre-installed</strong>:</p>' +
          '<ul>' +
          '<li><code>datainmotionenterprise/connector:latest-ros2-humble</code> \u2014 ROS2 Humble Hawksbill (LTS). Stable, widely supported.</li>' +
          '<li><code>datainmotionenterprise/connector:latest-ros2-jazzy</code> \u2014 ROS2 Jazzy Jalisco (LTS). Latest long-term release.</li>' +
          '</ul>' +
          '<p>These images include the full ROS2 runtime and DIME\u2019s ROS2 source connector. Subscribe to ROS2 topics and route them through DIME\u2019s ring buffer to any sink \u2014 InfluxDB, MQTT, Splunk, dashboards, and more.</p>' +
          '<p>Use the standard DIME image (<code>datainmotionenterprise/connector:latest</code>) if you do not need ROS2 integration.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source connectors (ROS2)' },
          { page: 'CON24', hotspot: 'docker-run', label: 'Basic docker run' }
        ]
      }
    }
  ]
};
