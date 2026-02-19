```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                  │
│          ██████┐  ██┐ ███┐   ███┐ ███████┐        30 — Troubleshooting                           │
│          ██┌──██┐ ██│ ████┐ ████│ ██┌────┘                                                       │
│          ██│  ██│ ██│ ██┌████┌██│ █████┐          Fix it fast. The most common                   │
│          ██│  ██│ ██│ ██│└██┌┘██│ ██┌──┘          issues and how to solve them.                  │
│          ██████┌┘ ██│ ██│ └─┘ ██│ ███████┐                                                       │
│          └─────┘  └─┘ └─┘     └─┘ └──────┘                                                       │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   NO DATA FLOWING — 5-STEP CHECKLIST                                                             │
│   ──────────────────────────────────                                                             │
│                                                                                                  │
│   Work through these in order. Most problems are in step 1 or 2.                                 │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   ┌──────────────────────────────────────┐                                             │     │
│   │   │  1. Is the connector enabled?        │                                             │     │
│   │   │                                      │                                             │     │
│   │   │  Check: enabled: !!bool true         │                                             │     │
│   │   │  A missing !!bool tag means it is    │                                             │     │
│   │   │  a string "true", not boolean true.  │                                             │     │
│   │   └──────────────┬───────────────────────┘                                             │     │
│   │                  │ YES                                                                  │    │
│   │                  ▼                                                                      │    │
│   │   ┌──────────────────────────────────────┐                                             │     │
│   │   │  2. Is the source connected?         │                                             │     │
│   │   │                                      │                                             │     │
│   │   │  Check: GET /status                  │                                             │     │
│   │   │  Look for IsConnected = true         │                                             │     │
│   │   │  If false: wrong IP, port, or creds  │                                             │     │
│   │   └──────────────┬───────────────────────┘                                             │     │
│   │                  │ YES                                                                  │    │
│   │                  ▼                                                                      │    │
│   │   ┌──────────────────────────────────────┐                                             │     │
│   │   │  3. Are item addresses correct?      │                                             │     │
│   │   │                                      │                                             │     │
│   │   │  OPC-UA: ns=2;s=PLC.Tag              │                                             │     │
│   │   │  Modbus: 40001 (holding register)    │                                             │     │
│   │   │  S7: DB1.DBD0 (data block)           │                                             │     │
│   │   │  Check device docs for exact syntax. │                                             │     │
│   │   └──────────────┬───────────────────────┘                                             │     │
│   │                  │ YES                                                                  │    │
│   │                  ▼                                                                      │    │
│   │   ┌──────────────────────────────────────┐                                             │     │
│   │   │  4. Is RBE hiding unchanged values?  │                                             │     │
│   │   │                                      │                                             │     │
│   │   │  Temporarily set: rbe: !!bool false  │                                             │     │
│   │   │  If data appears, the value is not   │                                             │     │
│   │   │  changing. RBE is working correctly. │                                             │     │
│   │   └──────────────┬───────────────────────┘                                             │     │
│   │                  │ YES                                                                  │    │
│   │                  ▼                                                                      │    │
│   │   ┌──────────────────────────────────────┐                                             │     │
│   │   │  5. Are sink filters too restrictive?│                                             │     │
│   │   │                                      │                                             │     │
│   │   │  Check include_filter and            │                                             │     │
│   │   │  exclude_filter regex patterns.      │                                             │     │
│   │   │  Try removing filters temporarily.   │                                             │     │
│   │   │  Add a Console sink with no filters  │                                             │     │
│   │   │  to verify data is in the ring buffer│                                             │     │
│   │   └──────────────────────────────────────┘                                             │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   CONNECTOR KEEPS FAULTING                                                                       │
│   ────────────────────────                                                                       │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   ┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐            │     │
│   │   │ Check           │        │ Verify          │        │ Look at         │            │     │
│   │   │ FaultReason     │───────▶│ network &       │───────▶│ FaultCount      │            │     │
│   │   │                 │        │ credentials     │        │                 │            │     │
│   │   │ GET /status     │        │                 │        │ Growing = the   │            │     │
│   │   │ IsFaulted: true │        │ Ping device?    │        │ device keeps    │            │     │
│   │   │ FaultReason:    │        │ Firewall open?  │        │ dropping. Check │            │     │
│   │   │ "timeout"       │        │ Creds correct?  │        │ device health.  │            │     │
│   │   └─────────────────┘        └─────────────────┘        └─────────────────┘            │     │
│   │                                                                                        │     │
│   │   DIME auto-retries on fault. If FaultCount stabilizes, the device recovered.          │     │
│   │   If FaultCount keeps climbing, the root cause is external (network, device, creds).   │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   LUA SCRIPT ERRORS                                                                              │
│   ─────────────────                                                                              │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   Symptoms:                     Diagnosis:                                             │     │
│   │   ─────────                     ──────────                                             │     │
│   │   - Data stops or is wrong      1. Check $SYSTEM/ScriptTime — is it growing?           │     │
│   │   - FaultReason mentions Lua    2. Check FaultReason for Lua stack trace               │     │
│   │   - ScriptTime spikes           3. Add Console sink to see raw vs. transformed data    │     │
│   │                                                                                        │     │
│   │   Common Lua mistakes:                                                                 │     │
│   │   ────────────────────                                                                 │     │
│   │   - Nil access: msg.data is nil when device returns nothing                            │     │
│   │   - Type mismatch: tonumber() on a string that is not a number                         │     │
│   │   - Missing return: script must return a value or use emit()                           │     │
│   │   - Infinite loop: while true without break kills the scan cycle                       │     │
│   │                                                                                        │     │
│   │   Debugging strategy:                                                                  │     │
│   │   ───────────────────                                                                  │     │
│   │   1. Add a Console sink with no filters — see everything in stdout                     │     │
│   │   2. Simplify script to just "return msg.data" — confirm raw data arrives              │     │
│   │   3. Add logic back one line at a time                                                 │     │
│   │   4. Use emit('debug/info', value) for printf-style debugging                          │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   COMMON YAML MISTAKES                                                                           │
│   ────────────────────                                                                           │
│                                                                                                  │
│   YAML looks simple, but these gotchas trip up everyone.                                         │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   MISTAKE #1: Missing type tags                                                        │     │
│   │                                                                                        │     │
│   │     WRONG:   rbe: true              ── YAML parses as string "true"                    │     │
│   │     WRONG:   scan_interval: 1000    ── YAML parses as string "1000"                    │     │
│   │     RIGHT:   rbe: !!bool true       ── Boolean true                                    │     │
│   │     RIGHT:   scan_interval: !!int 1000  ── Integer 1000                                │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   MISTAKE #2: Indentation errors                                                       │     │
│   │                                                                                        │     │
│   │     WRONG:   sources:               ── items must be indented under the source         │     │
│   │              - name: plc1                                                              │     │
│   │              items:                  ── same level as name = sibling, not child!       │     │
│   │                                                                                        │     │
│   │     RIGHT:   sources:                                                                  │     │
│   │                - name: plc1                                                            │     │
│   │                  items:              ── indented under name = child of source          │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   MISTAKE #3: Anchor / alias mismatches                                                │     │
│   │                                                                                        │     │
│   │     Anchor defined:   &my_defaults { scan_interval: !!int 1000 }                       │     │
│   │     Alias used:       <<: *my_default    ── typo! missing 's'                          │     │
│   │                                                                                        │     │
│   │     YAML will silently fail or throw a cryptic error.                                  │     │
│   │     Always double-check anchor names match exactly.                                    │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   MISTAKE #4: Special characters in strings                                            │     │
│   │                                                                                        │     │
│   │     WRONG:   address: ns=2;s=PLC:Tag     ── colon may confuse YAML parser              │     │
│   │     RIGHT:   address: "ns=2;s=PLC:Tag"   ── quote strings with special chars           │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   THE CONSOLE SINK — YOUR BEST DEBUGGING FRIEND                                                  │
│   ──────────────────────────────────────────────                                                 │
│                                                                                                  │
│   Add a Console sink during development. It prints every message to stdout.                      │
│                                                                                                  │
│   ┌────────────────────────────────────────────────────────────────────────────────────────┐     │
│   │                                                                                        │     │
│   │   sinks:                                                                               │     │
│   │     - name: debug                                                                      │     │
│   │       connector: Console              ◀── Prints to stdout                             │     │
│   │       # No include/exclude filters = see everything                                    │     │
│   │                                                                                        │     │
│   │   Output:                                                                              │     │
│   │   ───────                                                                              │     │
│   │   plc1/Temperature    72.5    1708300800000                                            │     │
│   │   plc1/Pressure       14.7    1708300800001                                            │     │
│   │   plc1/$SYSTEM/IsConnected    True    1708300800100                                    │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   Use with filters to isolate one source:                                              │     │
│   │                                                                                        │     │
│   │   sinks:                                                                               │     │
│   │     - name: debug_plc1                                                                 │     │
│   │       connector: Console                                                               │     │
│   │       include_filter: plc1/.*         ◀── Only plc1 messages                           │     │
│   │                                                                                        │     │
│   │                                                                                        │     │
│   │   THREE KEY DIAGNOSTICS                                                                │     │
│   │   ─────────────────────                                                                │     │
│   │                                                                                        │     │
│   │   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐           │      │
│   │   │ Console sink        │  │ GET /status         │  │ GET /config         │           │      │
│   │   │                     │  │                     │  │                     │           │      │
│   │   │ See what data is    │  │ See connector state,│  │ See what DIME       │           │      │
│   │   │ flowing through     │  │ fault info, timing  │  │ actually loaded     │           │      │
│   │   │ the ring buffer.    │  │ metrics, counts.    │  │ (after merge).      │           │      │
│   │   │                     │  │                     │  │                     │           │      │
│   │   │ "Is data there?"    │  │ "Is it healthy?"    │  │ "Is config right?"  │           │      │
│   │   └─────────────────────┘  └─────────────────────┘  └─────────────────────┘           │      │
│   │                                                                                        │     │
│   │   Remove the Console sink before deploying to production.                              │     │
│   │                                                                                        │     │
│   └────────────────────────────────────────────────────────────────────────────────────────┘     │
│                                                                                                  │
│  ──────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                  │
│   QUICK REFERENCE — OTHER COMMON ISSUES                                                          │
│   ─────────────────────────────────────                                                          │
│                                                                                                  │
│   ┌──────────────────────────────────────────────────────────────────────────────────────┐       │
│   │                                                                                      │       │
│   │   PROBLEM                         LIKELY CAUSE              FIX                      │       │
│   │   ───────                         ────────────              ───                      │       │
│   │   Messages not reaching sink      Path format wrong         Check source_name/item   │       │
│   │                                   or strip_path_prefix      Verify include_filter    │       │
│   │                                                                                      │       │
│   │   High CPU usage                  scan_interval too low     Increase to 1000ms+      │       │
│   │                                   Script too complex        Simplify Lua, cache vars │       │
│   │                                                                                      │       │
│   │   Memory growing                  ring_buffer too large     Reduce to 4096           │       │
│   │                                   Sink not consuming        Check sink connection    │       │
│   │                                   RBE off + fast scan       Enable RBE               │       │
│   │                                                                                      │       │
│   │   Duplicate messages              RBE off on source         Set rbe: !!bool true     │       │
│   │                                   Multiple sinks w/o filter Add include_filter       │       │
│   │                                                                                      │       │
│   │   Stale data in cache             Source disconnected       Check IsConnected        │       │
│   │                                   Device offline            Check FaultReason        │       │
│   │                                                                                      │       │
│   └──────────────────────────────────────────────────────────────────────────────────────┘       │
│                                                                                                  │
│   When all else fails: GET /status is the single most useful diagnostic.                         │
│                                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```
