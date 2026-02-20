
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF23 — NWS Weather                                                CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads weather at the specified location.                                                 │
  │                                                                                           │
  │  Connector Type: NwsWeather                          Source ✓    Sink ✗                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "NwsWeather".                │
  │  address                string   (see note)  Server hostname or IP address.               │
  │  agent                  string   (see note)  Unique user-agent.                           │
  │  items.address          string   Empty       Longitude and Latitude, comma separated.     │
  │  items.forecast         string   daily       Daily or hourly forecast.                    │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: nwsweather                                                                       │
  │    enabled: !!bool true                                                                   │
  │    scan_interval: !!int 10000                                                             │
  │    connector: NwsWeather                                                                  │
  │    address: https://api.weather.gov                                                       │
  │    agent: (DimeWeather, contact@dime.com)                                                 │
  │    items:                                                                                 │
  │      - name: NewYork                                                                      │
  │        address: 40.7128, -74.0060                                                         │
  │        forecast: daily                                                                    │
  │        script: |                                                                          │
  │          print(result.properties.periods[0].temperature)                                  │
  │          return result.properties.periods[0].temperature;                                 │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  NOTES
  ─────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Default address: https://api.weather.gov                                                 │
  │  Default agent: (MyWeatherApp, contact@example.com)                                       │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
