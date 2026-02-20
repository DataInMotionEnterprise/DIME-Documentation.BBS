
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF40 — Yaskawa Robot                                               CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads data from DX200, YRC1000, YRC1000 Micro Yaskawa controllers.                      │
  │                                                                                           │
  │  Connector Type: Yaskawa                                Source ✓    Sink ✗                │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "Yaskawa".                    │
  │  address                string   Empty       Robot IP address or hostname.                 │
  │  items.address          string   Empty       Robot variable address.                       │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  VARIABLE ADDRESSES
  ──────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Cartesian Positions      Torque            Status                                        │
  │  ────────────────────────  ────────────────  ──────────────────────────────────────────── │
  │  cartesianPositions.X     torque.Axis1      status.CommandRemote                          │
  │  cartesianPositions.Y     torque.Axis2      status.InHoldStatusPendant                    │
  │  cartesianPositions.Z     torque.Axis3      status.InHoldStatusExternally                 │
  │  cartesianPositions.Rx    torque.Axis4      status.InHoldStatusByCommand                  │
  │  cartesianPositions.Ry    torque.Axis5      status.Alarming                               │
  │  cartesianPositions.Rz    torque.Axis6      status.ErrorOccurring                         │
  │                                             status.ServoOn                                │
  │  Joint Positions          Alarm             status.Step                                   │
  │  ────────────────────────  ────────────────  status.Cycle                                 │
  │  jointPositions.Axis1     alarm.Code        status.Automatic                              │
  │  jointPositions.Axis2     alarm.Data        status.Running                                │
  │  jointPositions.Axis3     alarm.Type        status.InGuardSafeOperation                   │
  │  jointPositions.Axis4     alarm.OccurringT… status.Teach                                  │
  │  jointPositions.Axis5     alarm.Text        status.Play                                   │
  │  jointPositions.Axis6                                                                     │
  │                                             Job                                           │
  │  Position Error                             ──────────────────────────────────────────── │
  │  ────────────────────────                   job.Name                                      │
  │  positionError.Axis1                        job.Line                                      │
  │  positionError.Axis2                        job.Step                                      │
  │  positionError.Axis3                        job.SpeedOverride                              │
  │  positionError.Axis4                                                                      │
  │  positionError.Axis5                                                                      │
  │  positionError.Axis6                                                                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: yaskawa1                                                                         │
  │    connector: Yaskawa                                                                     │
  │    address: 10.1.1.200                                                                    │
  │    items:                                                                                 │
  │      - name: xpos                                                                         │
  │        address: cartesianPositions.X                                                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
