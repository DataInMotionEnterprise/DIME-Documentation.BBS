/**
 * 03 — Installation & First Run
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['03'] = {
  id: '03',
  title: '03 \u2014 Installation',
  file: 'content/03-installation.md',
  hotspots: [
    {
      id: 'platforms',
      startLine: 18, startCol: 3, endLine: 30, endCol: 82,
      label: 'Supported Platforms',
      panel: {
        title: 'Platform Matrix',
        body:
          '<p>DIME runs anywhere .NET 9.0 runs \u2014 self-contained, no runtime to install:</p>' +
          '<ul>' +
          '<li><strong>Windows</strong> (x86, x64) \u2014 Standalone DIME.exe or Windows Service</li>' +
          '<li><strong>Linux</strong> (x64, ARM64) \u2014 Standalone binary or systemd service</li>' +
          '<li><strong>Docker</strong> (x64, ARM64) \u2014 Multi-arch container image</li>' +
          '<li><strong>Docker + ROS2</strong> (x64) \u2014 Humble or Jazzy ROS2 base image</li>' +
          '</ul>',
        related: [
          { page: '03', hotspot: 'windows', label: 'Windows installation' },
          { page: '03', hotspot: 'linux', label: 'Linux installation' },
          { page: '03', hotspot: 'docker', label: 'Docker deployment' }
        ]
      }
    },
    {
      id: 'windows',
      startLine: 39, startCol: 5, endLine: 99, endCol: 82,
      label: 'Windows Installation',
      panel: {
        title: 'Windows Installation',
        body:
          '<p>Three options for Windows:</p>' +
          '<ul>' +
          '<li><strong>Option A \u2014 Standalone</strong>: Extract zip, place YAML configs, run DIME.exe</li>' +
          '<li><strong>Option B \u2014 Windows Service</strong>: "DIME.exe install" creates a service. Supports named instances for running multiple side-by-side.</li>' +
          '<li><strong>Option C \u2014 PowerShell script</strong>: Interactive menu for managing service instances</li>' +
          '</ul>' +
          '<p>Use <code>--config</code> to specify a custom config directory.</p>',
        yaml:
          '> DIME.exe                          # standalone\n' +
          '> DIME.exe install                   # as service\n' +
          '> DIME.exe install /instance:Plant1  # named instance\n' +
          '> curl http://localhost:9999/status   # verify',
        related: [
          { page: '03', hotspot: 'verify', label: 'Verify it works' },
          { page: '03', hotspot: 'directories', label: 'Directory layout' }
        ]
      }
    },
    {
      id: 'linux',
      startLine: 107, startCol: 5, endLine: 151, endCol: 82,
      label: 'Linux Installation',
      panel: {
        title: 'Linux Installation',
        body:
          '<p>Two options for Linux:</p>' +
          '<ul>' +
          '<li><strong>Option A \u2014 Standalone</strong>: Extract tarball, chmod +x, run "./DIME run"</li>' +
          '<li><strong>Option B \u2014 systemd service</strong>: Run install script. Installs to /opt/dime-connector/ with systemd unit.</li>' +
          '</ul>' +
          '<p>Install script supports <code>--config-dir</code>, <code>--config</code>, <code>--log-config</code>, and <code>--user</code> flags.</p>',
        yaml:
          '$ tar -xzf dime-connector-linux-x64.tar.gz\n' +
          '$ cd dime-connector && chmod +x DIME\n' +
          '$ ./DIME run\n' +
          '\n' +
          '# Or as systemd service:\n' +
          '$ sudo ./install-dime-connector.sh <tarball>',
        related: [
          { page: '03', hotspot: 'verify', label: 'Verify it works' }
        ]
      }
    },
    {
      id: 'docker',
      startLine: 160, startCol: 5, endLine: 188, endCol: 82,
      label: 'Docker Deployment',
      panel: {
        title: 'Docker Deployment',
        body:
          '<p>Mount your config directory as a volume and expose admin ports:</p>' +
          '<ul>' +
          '<li><strong>ladder99/dime:latest</strong> \u2014 Standard multi-arch (x64 + ARM64)</li>' +
          '<li><strong>ladder99/dime:ros2-humble</strong> \u2014 ROS2 Humble base image</li>' +
          '<li><strong>ladder99/dime:ros2-jazzy</strong> \u2014 ROS2 Jazzy base image</li>' +
          '</ul>' +
          '<p>Expose additional ports as needed for MTConnect Agent (5000), SHDR (7878), WebSocket Server (8092).</p>',
        yaml:
          'docker run -d \\\n' +
          '  -v /path/to/configs:/app/Configs \\\n' +
          '  -p 9999:9999 \\\n' +
          '  -p 9998:9998 \\\n' +
          '  --name dime \\\n' +
          '  ladder99/dime:latest',
        related: [
          { page: '03', hotspot: 'ports', label: 'Default ports reference' }
        ]
      }
    },
    {
      id: 'startup',
      startLine: 199, startCol: 3, endLine: 266, endCol: 87,
      label: 'Startup Sequence',
      panel: {
        title: 'What Happens at Startup',
        body:
          '<p>Six stages execute in order when DIME starts:</p>' +
          '<ul>' +
          '<li><strong>1. Load Configuration</strong> \u2014 Read all *.yaml files, merge, main.yaml loaded last</li>' +
          '<li><strong>2. Validate License</strong> \u2014 Valid key = full operation; no key = 150-minute demo</li>' +
          '<li><strong>3. Start Ring Buffer</strong> \u2014 Create Disruptor (4096 slots default), register SinkDispatcher</li>' +
          '<li><strong>4. Create Connectors</strong> \u2014 Factories create sources and sinks from config</li>' +
          '<li><strong>5. Initialize & Start</strong> \u2014 ConnectorRunners walk through the lifecycle; data flows</li>' +
          '<li><strong>6. Start Admin Server</strong> \u2014 REST on :9999, WebSocket on :9998</li>' +
          '</ul>',
        related: [
          { page: '05', hotspot: 'lifecycle', label: '05 \u2014 Connector lifecycle' },
          { page: '05', hotspot: 'system-diagram', label: '05 \u2014 Full system diagram' }
        ]
      }
    },
    {
      id: 'directories',
      startLine: 277, startCol: 5, endLine: 296, endCol: 62,
      label: 'Directory Layout',
      panel: {
        title: 'Directory Layout',
        body:
          '<p>After extracting and running DIME:</p>' +
          '<ul>' +
          '<li><strong>DIME.exe / ./DIME</strong> \u2014 Main executable</li>' +
          '<li><strong>Configs/</strong> \u2014 YAML config files (main.yaml, sources, sinks)</li>' +
          '<li><strong>Logs/</strong> \u2014 Daily rolling log files (auto-created at first run)</li>' +
          '<li><strong>Lua/</strong> \u2014 Lua utility libraries and transform scripts</li>' +
          '<li><strong>Python/</strong> \u2014 Python scripts</li>' +
          '<li><strong>nlog.config</strong> \u2014 Logging configuration</li>' +
          '</ul>',
        related: [
          { page: '01', hotspot: 'yaml-config', label: '01 \u2014 YAML configuration example' }
        ]
      }
    },
    {
      id: 'verify',
      startLine: 306, startCol: 3, endLine: 337, endCol: 82,
      label: 'Verification Methods',
      panel: {
        title: 'Verify It Works',
        body:
          '<p>Three ways to confirm DIME is running:</p>' +
          '<ul>' +
          '<li><strong>Console Output</strong> \u2014 Standalone mode shows connector activity in the terminal</li>' +
          '<li><strong>REST API</strong> \u2014 <code>curl http://localhost:9999/status</code> returns JSON with every connector\'s state, faults, and metrics</li>' +
          '<li><strong>Log Files</strong> \u2014 Check Logs/ for today\'s log. Default level: WARN and above. Adjust in nlog.config.</li>' +
          '</ul>',
        yaml:
          '$ curl http://localhost:9999/status\n' +
          '# Returns JSON with connector states,\n' +
          '# fault counts, and performance metrics',
        related: [
          { page: '05', hotspot: 'admin-server', label: '05 \u2014 Admin server endpoints' }
        ]
      }
    },
    {
      id: 'ports',
      startLine: 346, startCol: 3, endLine: 357, endCol: 82,
      label: 'Default Ports',
      panel: {
        title: 'Default Port Reference',
        body:
          '<p>Two ports are always active:</p>' +
          '<ul>' +
          '<li><strong>9999</strong> \u2014 Admin REST API (always on)</li>' +
          '<li><strong>9998</strong> \u2014 Admin WebSocket (always on)</li>' +
          '</ul>' +
          '<p>Optional ports depend on sink configuration:</p>' +
          '<ul>' +
          '<li><strong>5000</strong> \u2014 MTConnect Agent</li>' +
          '<li><strong>7878</strong> \u2014 MTConnect SHDR</li>' +
          '<li><strong>8080</strong> \u2014 HTTP Server</li>' +
          '<li><strong>8092</strong> \u2014 WebSocket Server</li>' +
          '</ul>',
        related: [
          { page: '05', hotspot: 'admin-server', label: '05 \u2014 Admin server details' },
          { page: '03', hotspot: 'docker', label: 'Docker port mapping' }
        ]
      }
    },
    {
      id: 'quick-start',
      startLine: 367, startCol: 7, endLine: 378, endCol: 82,
      label: 'Quick Start Guide',
      panel: {
        title: 'Zero to Running in 60 Seconds',
        body:
          '<p>Four steps:</p>' +
          '<ul>' +
          '<li><strong>Extract</strong> \u2014 Unzip the release archive</li>' +
          '<li><strong>Edit YAML</strong> \u2014 Point at your device and destination</li>' +
          '<li><strong>Run</strong> \u2014 DIME.exe or ./DIME run</li>' +
          '<li><strong>Verify</strong> \u2014 curl :9999/status</li>' +
          '</ul>' +
          '<p>No installer. No dependencies. No runtime. Just extract and run.</p>',
        related: [
          { page: '01', hotspot: 'yaml-config', label: '01 \u2014 YAML config example' },
          { page: '03', hotspot: 'windows', label: 'Windows installation details' },
          { page: '03', hotspot: 'linux', label: 'Linux installation details' }
        ]
      }
    }
  ]
};
