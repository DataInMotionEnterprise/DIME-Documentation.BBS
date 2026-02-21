/**
 * 23 — Service Deployment
 * Hotspot coordinates are 0-indexed lines/cols after stripping ``` fences.
 */
DIME_PAGES['CON23'] = {
  id: 'CON23',
  title: 'CON23 \u2014 Service Deployment',
  file: 'content/CON23-deploy-service.md',
  hotspots: [
    {
      id: 'windows-svc',
      startLine: 34, startCol: 3, endLine: 60, endCol: 90,
      label: 'Windows Service',
      panel: {
        title: 'Windows Service \u2014 Install, Control, Named Instances',
        body:
          '<p>DIME installs as a native Windows service using the built-in installer:</p>' +
          '<ul>' +
          '<li><strong>Install</strong> \u2014 <code>DIME.exe install</code> registers the default service. Use <code>/instance:Name</code> for named instances.</li>' +
          '<li><strong>Control</strong> \u2014 <code>net start DIME</code> / <code>net stop DIME</code>, or use the Services MMC snap-in.</li>' +
          '<li><strong>Named instances</strong> \u2014 <code>DIME.exe install /instance:Plant1</code> creates service "DIME$Plant1". Run multiple services on one machine.</li>' +
          '<li><strong>Uninstall</strong> \u2014 <code>DIME.exe uninstall</code> or <code>DIME.exe uninstall /instance:Plant1</code>.</li>' +
          '</ul>' +
          '<p>Use PowerShell <code>Get-Service DIME*</code> to monitor all DIME instances at once.</p>',
        yaml:
          '# Install as Windows Service\n' +
          '> DIME.exe install\n' +
          '> DIME.exe install /instance:Plant1\n' +
          '\n' +
          '# Control service\n' +
          '> net start DIME\n' +
          '> net stop DIME',
        related: [
          { page: 'CON03', label: 'CON03 \u2014 Installation' },
          { page: 'CON23', hotspot: 'multi-instance', label: 'Multiple instances on one machine' }
        ]
      }
    },
    {
      id: 'linux-systemd',
      startLine: 71, startCol: 3, endLine: 102, endCol: 90,
      label: 'Linux systemd Service',
      panel: {
        title: 'Linux systemd \u2014 Install Script, systemctl, Logs',
        body:
          '<p>On Linux, use the provided install script to register DIME as a systemd unit:</p>' +
          '<ul>' +
          '<li><strong>Install</strong> \u2014 <code>sudo ./install-dime-connector.sh archive.tar.gz</code></li>' +
          '<li><strong>Custom config dir</strong> \u2014 Use <code>-d /path/to/configs</code> to point to a specific config directory.</li>' +
          '<li><strong>Control</strong> \u2014 <code>systemctl start|stop|restart|status dime-connector</code></li>' +
          '<li><strong>Enable on boot</strong> \u2014 <code>systemctl enable dime-connector</code></li>' +
          '<li><strong>Live logs</strong> \u2014 <code>journalctl -u dime-connector -f</code> or check <code>/opt/dime-connector/Logs/</code></li>' +
          '<li><strong>Uninstall</strong> \u2014 <code>sudo ./install-dime-connector.sh -U</code></li>' +
          '</ul>',
        yaml:
          '# Install as systemd service\n' +
          '$ sudo ./install-dime-connector.sh \\\n' +
          '    dime-connector-linux-x64.tar.gz\n' +
          '\n' +
          '# With custom config dir\n' +
          '$ sudo ./install-dime-connector.sh \\\n' +
          '    -d /etc/dime/configs archive.tar.gz\n' +
          '\n' +
          '# Control service\n' +
          '$ sudo systemctl start dime-connector\n' +
          '$ sudo systemctl status dime-connector',
        related: [
          { page: 'CON03', label: 'CON03 \u2014 Installation' },
          { page: 'CON24', label: 'CON24 \u2014 Docker deployment' }
        ]
      }
    },
    {
      id: 'multi-instance',
      startLine: 113, startCol: 3, endLine: 136, endCol: 90,
      label: 'Multiple Instances',
      panel: {
        title: 'Multiple Instances on One Machine',
        body:
          '<p>Run several DIME instances side by side on a single machine. Each instance is fully isolated:</p>' +
          '<ul>' +
          '<li><strong>Own process</strong> \u2014 separate ring buffer, separate connectors</li>' +
          '<li><strong>Own ports</strong> \u2014 different REST and WebSocket ports (set in YAML <code>app</code> section)</li>' +
          '<li><strong>Own config directory</strong> \u2014 each instance loads its own YAML files</li>' +
          '<li><strong>Own logs</strong> \u2014 separate log directory per instance</li>' +
          '</ul>' +
          '<p><strong>Windows:</strong> Use <code>/instance:Name</code> during install. Each gets a unique service name (e.g. DIME$Plant1, DIME$Plant2).</p>' +
          '<p><strong>Linux:</strong> Use the <code>-d</code> flag to point each install at a different config directory, or run multiple systemd units with different names.</p>',
        related: [
          { page: 'CON22', hotspot: 'chaining', label: 'CON22 \u2014 Instance chaining' },
          { page: 'CON23', hotspot: 'windows-svc', label: 'Windows service install' }
        ]
      }
    },
    {
      id: 'directories',
      startLine: 142, startCol: 3, endLine: 158, endCol: 90,
      label: 'Directory Layout',
      panel: {
        title: 'Directory Layout \u2014 Windows & Linux',
        body:
          '<p>Both platforms follow the same logical layout:</p>' +
          '<ul>' +
          '<li><strong>Configs/</strong> \u2014 YAML configuration files. <code>main.yaml</code> loaded last (highest priority). All <code>*.yaml</code> files merged.</li>' +
          '<li><strong>Logs/</strong> \u2014 Daily rolling log files. Controlled by <code>nlog.config</code>.</li>' +
          '<li><strong>Scripts/</strong> \u2014 External Lua or Python scripts referenced by connectors.</li>' +
          '<li><strong>nlog.config</strong> \u2014 NLog configuration for log levels, targets, and rotation.</li>' +
          '</ul>' +
          '<p><strong>Windows default:</strong> <code>C:\\Program Files\\DIME\\</code></p>' +
          '<p><strong>Linux default:</strong> <code>/opt/dime-connector/</code></p>',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML configuration basics' },
          { page: 'CON23', hotspot: 'log-management', label: 'Log rotation and management' }
        ]
      }
    },
    {
      id: 'log-management',
      startLine: 166, startCol: 3, endLine: 188, endCol: 90,
      label: 'Log Rotation & Management',
      panel: {
        title: 'Logging \u2014 NLog Configuration',
        body:
          '<p>DIME uses <strong>NLog</strong> for structured logging. All settings live in <code>nlog.config</code>.</p>' +
          '<ul>' +
          '<li><strong>Daily rolling files</strong> \u2014 <code>Logs/${shortdate}.log</code>. One file per day.</li>' +
          '<li><strong>Log levels</strong> \u2014 Warn (default), Info, Debug, Trace. Change at runtime without restarting.</li>' +
          '<li><strong>Archive retention</strong> \u2014 Configurable, default 14 archive files.</li>' +
          '<li><strong>JSON layout</strong> \u2014 Optional structured JSON format for log aggregation tools (Splunk, ELK).</li>' +
          '<li><strong>Console target</strong> \u2014 Enabled when running interactively, auto-disabled as a service.</li>' +
          '</ul>' +
          '<p>NLog watches <code>nlog.config</code> for changes \u2014 edit the file and log levels update immediately. No restart needed.</p>',
        related: [
          { page: 'CON23', hotspot: 'directories', label: 'Directory layout' },
          { page: 'CON16', label: 'CON16 \u2014 Admin REST API' }
        ]
      }
    }
  ]
};
