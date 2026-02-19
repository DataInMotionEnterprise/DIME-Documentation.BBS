```
═══════════════════════════════════════════════════════════════════════════════════════════════
  EX23 — WEATHER API                                                      DIME EXAMPLE SERIES
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ WHAT THIS EXAMPLE DOES ──────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  Connects to the US National Weather Service public API to fetch real-time weather      │
  │  forecasts. Demonstrates the NwsWeather connector with lat/lon coordinates, daily vs   │
  │  hourly forecast types, and Lua scripting to extract temperature values.               │
  │  Single-file YAML config with multiple city items.                                     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  DATA FLOW
  ─────────

      ┌──────────────────────────┐
      │   NwsWeather Source       │
      │                          │
      │   address: api.weather   │         ┌─────────────────────┐
      │     .gov                 │    ┌───▶│  Console Sink       │  stdout
      │                          │    │    └─────────────────────┘
      │   Items:                 │    │
      │   · NewYork   (daily)   ├────┘
      │     40.7128, -74.0060    │
      │   · LosAngeles (hourly)  │
      │     34.0522, -118.2437   │
      │   · Chicago    (daily)   │
      │     41.8781, -87.6298    │
      │                          │
      │   scan: 10000ms          │
      │   agent: (DimeWeather)   │
      └──────────────────────────┘
              SOURCE                       RING BUFFER              SINK
        (NWS public API)                 (4096 slots)          (Console out)

  CONFIGURATION — main.yaml                                                    [single file]
  ─────────────────────────

  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  nwsweather: &nwsweather                                                               │
  │    name: nwsweather                                                                    │
  │    enabled: !!bool true                                                                │
  │    scan_interval: !!int 10000                    # Poll every 10 seconds               │
  │    connector: NwsWeather                         # National Weather Service connector  │
  │    address: https://api.weather.gov              # NWS API base URL                    │
  │    agent: (DimeWeather, contact@dime.com)        # Required User-Agent header          │
  │    items:                                                                              │
  │      - name: NewYork                                                                   │
  │        enabled: !!bool true                                                            │
  │        address: 40.7128, -74.0060                # Latitude, Longitude                 │
  │        forecast: daily                           # Daily forecast periods              │
  │        script: |                                 # Extract temperature from response   │
  │          print(result.properties.periods[0].temperature)                               │
  │          return result.properties.periods[0].temperature;                              │
  │      - name: LosAngeles                                                                │
  │        enabled: !!bool false                     # Disabled by default                 │
  │        address: 34.0522, -118.2437                                                     │
  │        forecast: hourly                          # Hourly forecast periods             │
  │      - name: Chicago                                                                   │
  │        enabled: !!bool false                                                           │
  │        address: 41.8781, -87.6298                                                      │
  │        forecast: daily                                                                 │
  │                                                                                        │
  │  console: &console                                                                     │
  │    name: console                                                                       │
  │    enabled: !!bool true                                                                │
  │    connector: Console                            # Prints to stdout                    │
  │                                                                                        │
  │  app:                                                                                  │
  │    license: 0000-0000-0000-0000-0000-0000-0000-0000                                    │
  │    ring_buffer: !!int 4096                                                             │
  │    http_server_uri: http://127.0.0.1:9999/                                             │
  │    ws_server_uri: ws://127.0.0.1:9998/                                                 │
  │  sources:                                                                              │
  │    - *nwsweather                                 # Weather source                      │
  │  sinks:                                                                                │
  │    - *console                                    # Console output                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

  KEY CONCEPTS
  ────────────
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │  * NwsWeather Connector -- Purpose-built connector for the US National Weather         │
  │    Service API. Handles the two-step NWS lookup: first resolves lat/lon to a grid      │
  │    point, then fetches the forecast for that grid. The agent property sets the          │
  │    required User-Agent header (NWS blocks requests without one).                       │
  │                                                                                        │
  │  * Lat/Lon Addressing -- Each item's address is "latitude, longitude" as a string.     │
  │    The connector parses these and calls the correct NWS grid endpoint. You can add     │
  │    as many city items as needed, each with different coordinates.                       │
  │                                                                                        │
  │  * Forecast Types -- The forecast property selects "daily" (7-day periods) or           │
  │    "hourly" (detailed hourly). The response structure differs: daily has fewer, longer  │
  │    periods; hourly has many short periods. Your script must match the structure.        │
  │                                                                                        │
  │  * Lua Result Processing -- The result variable contains the parsed JSON response       │
  │    from the NWS API. The script navigates the response tree:                           │
  │    result.properties.periods[0].temperature extracts the first period's temp.          │
  │    The print() call logs to DIME console for debugging.                                │
  │                                                                                        │
  │  * External API Integration -- This example shows the pattern for any public REST      │
  │    API: configure the connector with the base URL, set items for each data point,      │
  │    and use scripts to extract and transform the response payload.                      │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
```
