/**
 * EX26 — Python Scripting
 * Python embedded runtime: .NET CLR interop, module imports, cache API.
 */
DIME_PAGES['EX26'] = {
  id: 'EX26',
  title: 'EX26 \u2014 Python Scripting',
  file: 'content/EX26-python-scripting.md',
  section: 'Examples',
  hotspots: [
    {
      id: 'ex26-overview',
      startLine: 4, startCol: 2, endLine: 11, endCol: 85,
      label: 'What This Example Does',
      panel: {
        title: 'Python Scripting \u2014 Overview',
        body:
          '<p>This example demonstrates DIME\u2019s embedded Python runtime as an alternative to Lua. Ten items showcase different Python capabilities:</p>' +
          '<ul>' +
          '<li><strong>.NET CLR interop</strong> \u2014 Import and use <code>System.Random</code> directly from Python</li>' +
          '<li><strong>Standard library</strong> \u2014 <code>random</code>, <code>math</code>, <code>sys</code> modules work normally</li>' +
          '<li><strong>Custom modules</strong> \u2014 Import <code>example.py</code> from the Python/ directory</li>' +
          '<li><strong>DIME cache API</strong> \u2014 <code>dime.set()</code> and <code>dime.cache()</code> for cross-item state</li>' +
          '<li><strong>Global variables</strong> \u2014 <code>counter</code> persists across scan cycles</li>' +
          '</ul>' +
          '<p>Switch from Lua to Python with a single property: <code>lang_script: python</code>.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: 'EX01', label: 'EX01 \u2014 Basic Counter (Lua version)' },
          { page: 'REF29', label: 'REF29 \u2014 Script' }
        ]
      }
    },
    {
      id: 'ex26-dataflow',
      startLine: 13, startCol: 2, endLine: 38, endCol: 70,
      label: 'Data Flow Diagram',
      panel: {
        title: 'Python Source \u2192 Ring Buffer \u2192 Console',
        body:
          '<p>Ten Python items execute every scan cycle:</p>' +
          '<ul>' +
          '<li><strong>SysPath</strong> \u2014 Returns <code>sys.path</code> (Python module search paths)</li>' +
          '<li><strong>Swallow</strong> \u2014 Returns <code>None</code> (Python\u2019s nil equivalent, suppresses output)</li>' +
          '<li><strong>CLRRandom</strong> \u2014 Creates a .NET <code>System.Random</code> and calls <code>NextDouble()</code></li>' +
          '<li><strong>PyRandom</strong> \u2014 Uses Python\u2019s native <code>random.random()</code></li>' +
          '<li><strong>Tuple</strong> \u2014 Returns a Python tuple <code>(1, 2, 3)</code></li>' +
          '<li><strong>Module</strong> \u2014 Imports <code>add()</code> from <code>example.py</code></li>' +
          '<li><strong>Math</strong> \u2014 Returns <code>math.pi</code> (3.14159...)</li>' +
          '<li><strong>CacheSet/CacheGet</strong> \u2014 Stores and retrieves values via <code>dime.set()</code>/<code>dime.cache()</code></li>' +
          '<li><strong>Counter</strong> \u2014 Increments a global variable each cycle</li>' +
          '</ul>' +
          '<p>The Console sink with <code>use_sink_transform: true</code> applies the source\u2019s <code>Message.Data</code> template to show only the data values.</p>',
        related: [
          { page: '05', hotspot: 'data-flow', label: '05 \u2014 Architecture: Data Flow' },
          { page: '10', label: '10 \u2014 Cache API' }
        ]
      }
    },
    {
      id: 'ex26-config',
      startLine: 40, startCol: 2, endLine: 101, endCol: 85,
      label: 'Python Script Configuration',
      panel: {
        title: 'Script Source with lang_script: python',
        body:
          '<p>The script.yaml file is the core of this example. Key differences from Lua:</p>' +
          '<ul>' +
          '<li><strong>lang_script: python</strong> \u2014 Switches the entire connector to the Python runtime</li>' +
          '<li><strong>Last expression = return value</strong> \u2014 No <code>return</code> keyword needed; the last expression in each script block becomes the item\u2019s value</li>' +
          '<li><strong>dime.set() / dime.cache()</strong> \u2014 Python uses the <code>dime</code> module instead of Lua\u2019s bare <code>set()</code>/<code>cache()</code> functions</li>' +
          '<li><strong>clr module</strong> \u2014 Bridges Python to the .NET runtime with <code>clr.AddReference()</code> and <code>from System import ClassName</code></li>' +
          '</ul>' +
          '<p>The <code>init_script</code> imports the CLR module and initializes global state. All 10 items run in the same Python runtime instance, sharing globals.</p>',
        yaml:
          '# Switch to Python:\n' +
          'script: &script\n' +
          '  connector: Script\n' +
          '  lang_script: python\n' +
          '  init_script: |\n' +
          '    import clr\n' +
          '    clr.AddReference("System")\n' +
          '    from System import Random\n' +
          '  items:\n' +
          '    - name: CLRRandom\n' +
          '      script: |\n' +
          '        Random().NextDouble()',
        related: [
          { page: '04', label: '04 \u2014 YAML Basics' },
          { page: '09', label: '09 \u2014 Scripting Deep Dive' }
        ]
      }
    },
    {
      id: 'ex26-keyconcepts',
      startLine: 130, startCol: 2, endLine: 157, endCol: 85,
      label: 'Key Concepts',
      panel: {
        title: 'Key Concepts in This Example',
        body:
          '<p><strong>Python Runtime</strong> \u2014 Set <code>lang_script: python</code> at the connector level to switch from Lua. The last expression in each script block automatically becomes the return value. <code>None</code> suppresses output (equivalent to Lua\u2019s <code>nil</code>).</p>' +
          '<p><strong>.NET CLR Interop</strong> \u2014 The <code>clr</code> module bridges Python to the .NET runtime. Use <code>clr.AddReference("Assembly")</code> to load assemblies, then import classes with standard Python syntax: <code>from System import Random</code>. This gives access to the entire .NET ecosystem.</p>' +
          '<p><strong>Python Cache API</strong> \u2014 In Python, use <code>dime.set(\'key\', value)</code> to store and <code>dime.cache(\'key\', default)</code> to retrieve. This differs from Lua\u2019s <code>set()</code>/<code>cache()</code> syntax but provides identical functionality. Cache entries persist across scan cycles.</p>' +
          '<p><strong>Custom Modules</strong> \u2014 Place <code>.py</code> files in DIME\u2019s <code>Python/</code> directory. Import with standard syntax: <code>from example import add</code>. The <code>paths_script</code> property can add additional module search paths.</p>' +
          '<p><strong>Global Variables</strong> \u2014 Variables defined in <code>init_script</code> (like <code>counter = 0</code>) persist across scan cycles. All items share the same Python runtime, so globals are accessible from any item script.</p>',
        related: [
          { page: '09', label: '09 \u2014 Scripting (Lua & Python)' },
          { page: '10', label: '10 \u2014 Cache API' },
          { page: 'EX01', label: 'EX01 \u2014 Basic Counter (Lua equivalent)' }
        ]
      }
    }
  ]
};
