/**
 * EX30 — CNC Machine Simulator
 * State machine simulation (IDLE/SETUP/RUNNING/FAULT). Test without hardware.
 */
DIME_PAGES['EX30'] = {
  id: 'EX30',
  title: 'EX30 \u2014 CNC Machine Simulator',
  file: 'content/EX30-cnc-machine-simulator.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex30-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'CNC Machine Simulator \u2014 Overview',
        body:
          '<p>A complete CNC monitoring pipeline that runs entirely in simulation, requiring <strong>no external hardware or services</strong>. Three Script sources work together:</p>' +
          '<ul>' +
          '<li><strong>machine_simulator</strong> \u2014 Lua state machine cycling through IDLE \u2192 SETUP \u2192 RUNNING \u2192 IDLE with fault injection. Produces power, temperature, vibration, and status data</li>' +
          '<li><strong>production_simulator</strong> \u2014 Reads machine state via cache for part counts, cycle times, order tracking, and downtime reasons</li>' +
          '<li><strong>analytics_processor</strong> \u2014 ~600 lines of Lua implementing moving averages, cycle detection, trend analysis, anomaly detection, OEE calculation, and predictive maintenance</li>' +
          '</ul>' +
          '<p>This is ideal for testing DIME configurations, training, and developing analytics logic before connecting to real machines.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: 'EX01', label: 'EX01 \u2014 Basic Counter (simpler simulation)' }
        ]
      }
    },
    {
      id: 'ex30-dataflow',
      startLine: 13, startCol: 2, endLine: 40, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: '3 Script Sources \u2192 Analytics Pipeline',
        body:
          '<p>Data flows through a three-tier pipeline:</p>' +
          '<ol>' +
          '<li><strong>machine_simulator</strong> (1000ms) \u2014 State machine with probabilistic transitions. Power consumption follows a ramp-up/hold/ramp-down profile during cycles. Temperature and vibration respond to machine state with realistic dynamics</li>' +
          '<li><strong>production_simulator</strong> (5000ms) \u2014 Reads machine state and part counts from cache to compute KPIs: cycle time with time-of-day variation, quality rates, order progress, and weighted random downtime reasons</li>' +
          '<li><strong>analytics_processor</strong> (1000ms) \u2014 Heavy analytics: power/temperature/vibration smoothing, power-based cycle detection, linear regression trend analysis, z-score anomaly detection, OEE calculation, and a predictive maintenance wear index</li>' +
          '</ol>' +
          '<p>The <code>enter_script</code> runs the state machine logic before items read cached state. The <code>exit_script</code> checks for alert conditions after all items complete.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '10', label: '10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'ex30-config',
      startLine: 42, startCol: 2, endLine: 145, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Three-Source Analytics Configuration',
        body:
          '<p>The configuration spans 7 files with the analytics source containing the bulk of the logic:</p>' +
          '<ul>' +
          '<li><strong>machine_simulator.yaml</strong> \u2014 State machine in <code>enter_script</code> (~160 lines), 6 output items for power, temp, vibration, cycle, status, fault</li>' +
          '<li><strong>production_simulator.yaml</strong> \u2014 Production KPIs, order tracking, downtime analysis using weighted probabilities</li>' +
          '<li><strong>analytics.yaml</strong> \u2014 ~600 lines including utility functions (moving average, standard deviation, cycle detection, trend detection, OEE), 7 analytics items, and alert generation in <code>exit_script</code></li>' +
          '<li><strong>console.yaml</strong> \u2014 Console sink with selective filtering to reduce noise</li>' +
          '<li><strong>mtconnect.yaml</strong> \u2014 Optional MTConnect Agent on port 5000</li>' +
          '</ul>' +
          '<p>The analytics source demonstrates all three script hooks: <code>init_script</code> (setup), <code>enter_script</code> (periodic OEE), <code>exit_script</code> (alerts).</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting Deep Dive' },
          { page: '12', label: '12 \u2014 emit() Function' }
        ]
      }
    },
    {
      id: 'ex30-keyconcepts',
      startLine: 146, startCol: 2, endLine: 170, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>State Machine in enter_script</strong> \u2014 The <code>enter_script</code> runs before every scan cycle\u2019s item evaluation. It handles state transitions (IDLE \u2192 SETUP \u2192 RUNNING \u2192 IDLE) and uses <code>set("./current_state", value)</code> to persist state. Items read the cached state to produce coordinated output.</p>' +
          '<p><strong>Analytics Pipeline</strong> \u2014 The analytics source implements a complete signal processing chain: raw data \u2192 moving average smoothing \u2192 cycle detection (threshold crossing) \u2192 trend analysis (linear regression) \u2192 anomaly detection (z-score) \u2192 OEE calculation. All in embedded Lua.</p>' +
          '<p><strong>emit() in All Three Hooks</strong> \u2014 The <code>enter_script</code> uses <code>emit()</code> for periodic OEE metrics. Item scripts use <code>emit()</code> for derived observations like PowerTrend and VibrationBand. The <code>exit_script</code> uses <code>emit()</code> for alert conditions (high temperature, excessive vibration).</p>' +
          '<p><strong>Cross-Source Dependencies</strong> \u2014 production_simulator reads machine_simulator cache. analytics reads both. This three-source cascade demonstrates DIME\u2019s data combination pattern where each source enriches the data pipeline.</p>' +
          '<p><strong>Predictive Maintenance</strong> \u2014 A simple wear index combines vibration band energy, temperature, and anomaly counts to estimate days until maintenance. Illustrates how Lua analytics can approach ML-style pattern recognition.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (enter/exit scripts)' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '12', label: '12 \u2014 emit() Function' }
        ]
      }
    }
  ]
};
