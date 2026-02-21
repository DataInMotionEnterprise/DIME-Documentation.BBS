/**
 * EX23 — Weather API
 * NWS weather source: lat/lon addressing, forecast types, external public API.
 */
DIME_PAGES['EX23'] = {
  id: 'EX23',
  title: 'EX23 \u2014 Weather API',
  file: 'content/EX23-weather-api.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex23-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Weather API \u2014 Overview',
        body:
          '<p>This example connects to the US National Weather Service public API to fetch real-time weather forecasts. It demonstrates a purpose-built connector for external API integration:</p>' +
          '<ul>' +
          '<li><strong>NwsWeather connector</strong> \u2014 Handles the NWS two-step API lookup (lat/lon \u2192 grid point \u2192 forecast)</li>' +
          '<li><strong>Multiple cities</strong> \u2014 Three items for New York, Los Angeles, and Chicago, each with lat/lon coordinates</li>' +
          '<li><strong>Forecast types</strong> \u2014 "daily" for 7-day periods, "hourly" for detailed hourly data</li>' +
          '<li><strong>Lua scripting</strong> \u2014 Extracts temperature from the nested JSON response</li>' +
          '</ul>' +
          '<p>A single-file YAML config keeps everything in one place. Only the New York item is enabled by default.</p>',
        related: [
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX22', label: 'EX22 \u2014 JSON Web Scraper (generic REST)' },
          { page: 'REF23', label: 'REF23 \u2014 NWS Weather' }
        ]
      }
    },
    {
      id: 'ex23-dataflow',
      startLine: 13, startCol: 2, endLine: 34, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'NWS API \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>The NwsWeather connector polls the NWS API every 10 seconds:</p>' +
          '<ol>' +
          '<li><strong>Resolve grid point</strong> \u2014 The connector converts lat/lon coordinates to an NWS grid reference (done internally)</li>' +
          '<li><strong>Fetch forecast</strong> \u2014 Retrieves the daily or hourly forecast for that grid point</li>' +
          '<li><strong>Run Lua script</strong> \u2014 The item script extracts <code>result.properties.periods[0].temperature</code></li>' +
          '<li><strong>Publish to ring buffer</strong> \u2014 The temperature value flows to the Console sink</li>' +
          '</ol>' +
          '<p>The <code>agent</code> property sets a User-Agent header required by the NWS API. Without it, requests are rejected. Multiple city items can run in parallel within the same source connector.</p>',
        related: [
          { page: 'CON05', hotspot: 'data-flow', label: 'CON05 \u2014 Architecture: Data Flow' },
          { page: 'CON09', label: 'CON09 \u2014 Scripting (result variable)' }
        ]
      }
    },
    {
      id: 'ex23-config',
      startLine: 36, startCol: 2, endLine: 80, endCol: 85,
      label: 'YAML Configuration',
      panel: {
        title: 'Single-File Configuration with NwsWeather',
        body:
          '<p>This single-file config defines the weather source, console sink, and app settings together:</p>' +
          '<ul>' +
          '<li><strong>connector: NwsWeather</strong> \u2014 Purpose-built connector for the NWS API</li>' +
          '<li><strong>address</strong> (connector level) \u2014 The NWS API base URL: <code>https://api.weather.gov</code></li>' +
          '<li><strong>agent</strong> \u2014 User-Agent string required by NWS: <code>(DimeWeather, contact@dime.com)</code></li>' +
          '<li><strong>address</strong> (item level) \u2014 Latitude, longitude as a comma-separated string</li>' +
          '<li><strong>forecast</strong> \u2014 Either "daily" or "hourly" to select forecast granularity</li>' +
          '</ul>' +
          '<p>Items can be independently <code>enabled</code>/<code>disabled</code>. The Lua <code>script</code> block navigates the NWS JSON response tree using dot notation on the <code>result</code> object.</p>',
        yaml:
          '# NwsWeather item pattern:\n' +
          'items:\n' +
          '  - name: NewYork\n' +
          '    address: 40.7128, -74.0060\n' +
          '    forecast: daily\n' +
          '    script: |\n' +
          '      return result.properties\n' +
          '        .periods[0].temperature;',
        related: [
          { page: 'CON04', label: 'CON04 \u2014 YAML Basics' },
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' }
        ]
      }
    },
    {
      id: 'ex23-keyconcepts',
      startLine: 82, startCol: 2, endLine: 108, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>NwsWeather Connector</strong> \u2014 A specialized source connector that handles the NWS API\u2019s two-step lookup: first resolves coordinates to a grid point, then fetches the forecast. The <code>agent</code> property sets the required User-Agent header (NWS blocks bare requests).</p>' +
          '<p><strong>Lat/Lon Addressing</strong> \u2014 Each item\u2019s <code>address</code> is a "latitude, longitude" string. The connector parses these coordinates internally. You can add as many city items as needed with different locations.</p>' +
          '<p><strong>Forecast Types</strong> \u2014 The <code>forecast</code> property selects "daily" (7-day with day/night periods) or "hourly" (detailed hourly). The JSON response structure differs between them, so scripts must navigate the correct path.</p>' +
          '<p><strong>External API Pattern</strong> \u2014 This example demonstrates the general pattern for integrating any public REST API: set the base URL in <code>address</code>, configure authentication/headers, define items for each data point, and use Lua scripts to extract values from the response.</p>',
        related: [
          { page: 'CON09', label: 'CON09 \u2014 Scripting (Lua & Python)' },
          { page: 'CON06', label: 'CON06 \u2014 Source Connectors' },
          { page: 'EX22', label: 'EX22 \u2014 JSON Web Scraper' }
        ]
      }
    }
  ]
};
