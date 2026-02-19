/**
 * EX35 — CNC Fingerprinting
 * Current draw analysis: cycle detection, part identification, ML patterns. ~600 lines Lua.
 */
DIME_PAGES['EX35'] = {
  id: 'EX35',
  title: 'EX35 \u2014 CNC Fingerprinting',
  file: 'content/EX35-cnc-fingerprinting.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex35-overview',
      startLine: 4, startCol: 2, endLine: 13, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'CNC Fingerprinting \u2014 Overview',
        body:
          '<p>The most advanced DIME example: <strong>automated CNC part identification</strong> through spindle current pattern analysis with ~600 lines of embedded Lua across three source connectors:</p>' +
          '<ul>' +
          '<li><strong>currentTransformer</strong> (~300 lines) \u2014 Simulates realistic current draw for 4 part types with 12 pattern generators (steady, ramping, pulsed, gear_cutting, etc.)</li>' +
          '<li><strong>analyticsProcessor</strong> (~350 lines) \u2014 Signal processing, cycle detection, fingerprint extraction, pattern correlation, and a self-learning fingerprint library</li>' +
          '<li><strong>productivityMetrics</strong> (~250 lines) \u2014 OEE calculation, parts per hour, part mix tracking, cycle time variance analysis, and identification accuracy</li>' +
          '</ul>' +
          '<p>The system learns part fingerprints automatically (3 cycles per type), then identifies parts in real-time with 55-80% confidence. A web dashboard shows live current waveforms and identification results.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: 'EX30', label: 'EX30 \u2014 CNC Machine Simulator' }
        ]
      }
    },
    {
      id: 'ex35-dataflow',
      startLine: 15, startCol: 2, endLine: 49, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Current Transformer \u2192 Analytics \u2192 Productivity',
        body:
          '<p>A three-tier analytics pipeline processes current draw data:</p>' +
          '<ol>' +
          '<li><strong>currentTransformer</strong> (1000ms, rbe: false) \u2014 Simulates 4 part types with distinct current profiles. Each part has startup/running/shutdown phases. Running phases use pattern generators like steady, varying, ramping, pulsed, periodic, spiking, heavy_cutting, smooth, drilling_cycle, tapping, gear_cutting, and light_cut</li>' +
          '<li><strong>analyticsProcessor</strong> (1000ms) \u2014 Reads current from cache, applies 3-sample moving average, detects cycle boundaries (2.5A start, 1.8A end thresholds), extracts 10-segment fingerprints, and correlates against a self-learning library</li>' +
          '<li><strong>productivityMetrics</strong> (2000ms) \u2014 Tracks OEE (Availability \u00d7 Performance \u00d7 Quality), parts per hour, part mix percentages, cycle time variance, anomaly counts, downtime minutes, and fingerprint identification accuracy</li>' +
          '</ol>' +
          '<p>Data flows through cache: the transformer writes raw current, the analytics processor writes identification results, and the productivity module reads both for comprehensive metrics.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '10', label: '10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'ex35-config',
      startLine: 50, startCol: 2, endLine: 201, endCol: 85,
      label: 'YAML Configuration (10 files)',
      panel: {
        title: 'Three-Source Analytics Configuration',
        body:
          '<p>The 10-file configuration centers on three heavy-Lua source connectors:</p>' +
          '<ul>' +
          '<li><strong>currentTransformer.yaml</strong> \u2014 4 part definitions with weighted selection, 12 pattern generators, state machine (idle \u2192 startup \u2192 running phases \u2192 shutdown \u2192 idle), 8 output items including CurrentDraw (rbe: false) and FingerprintSignature</li>' +
          '<li><strong>analyticsProcessor.yaml</strong> \u2014 Statistical functions (moving average, std deviation, correlation), fingerprint extraction (10 segments), pattern comparison (60% mean + 30% range + 10% std), self-learning library (3 cycles minimum), 9 output items</li>' +
          '<li><strong>productivityMetrics.yaml</strong> \u2014 Ideal cycle times per part, OEE components, downtime tracking, anomaly detection, 12 output items including ProductionSummary JSON</li>' +
          '</ul>' +
          '<p>Sinks include WebSocket with <code>include_filter</code> for 30+ specific paths, CSV for historical analysis, and WebServer for the dashboard.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting Deep Dive' },
          { page: '21', label: '21 \u2014 Multi-File Configs' }
        ]
      }
    },
    {
      id: 'ex35-keyconcepts',
      startLine: 203, startCol: 2, endLine: 230, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Fingerprint Extraction</strong> \u2014 Each completed cycle is divided into 10 equal time segments. Each segment stores mean, std deviation, min, and max current. This fixed-length signature enables comparison regardless of cycle duration.</p>' +
          '<p><strong>Pattern Correlation</strong> \u2014 Fingerprints are compared using weighted similarity: 60% mean pattern (are current levels similar?), 30% range shape (are variations similar?), 10% std deviation (is noise similar?). Scores above 0.55 trigger identification.</p>' +
          '<p><strong>Learning Library</strong> \u2014 The system needs 3 cycles per part type before identification. Fingerprints are averaged across samples (up to 10 stored) for robust reference patterns. The library builds automatically using ground-truth labels from the simulator.</p>' +
          '<p><strong>Three-Source Pipeline</strong> \u2014 currentTransformer generates raw data. analyticsProcessor reads it via cache for signal processing. productivityMetrics reads both for OEE. Each runs at its own rate (1s, 1s, 2s) and communicates solely through the cache API.</p>' +
          '<p><strong>rbe: false for Streaming</strong> \u2014 The current transformer disables RBE because every sample matters for pattern analysis. Even identical consecutive readings are meaningful in a waveform. Other connectors use <code>rbe: true</code> since they only output when derived metrics change.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: '20', label: '20 \u2014 Report By Exception' },
          { page: '08', label: '08 \u2014 Message Paths & Filtering' }
        ]
      }
    }
  ]
};
