
═══════════════════════════════════════════════════════════════════════════════════════════════
  REF07 — Fanuc Robot                                                 CONNECTOR REFERENCE
═══════════════════════════════════════════════════════════════════════════════════════════════

  ┌─ OVERVIEW ────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Reads R-J3iB, R-30iA, R-30iB Fanuc Robot controllers using SNPX.                        │
  │                                                                                           │
  │  Connector Type: FanucRobot                          Source ✓    Sink ✗                   │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE PROPERTIES
  ─────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Name                   Type     Default     Description                                  │
  │  ─────────────────────  ───────  ──────────  ──────────────────────────────────────────── │
  │  connector              string   "Undefined" Connector type, "FanucRobot".                │
  │  address                string   Empty       Robot hostname, IP address.                  │
  │  items.address          string   Empty       Variable to read.                            │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  VARIABLE ADDRESSES
  ──────────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  Cartesian Position        Joint Position            I/O                 Registers         │
  │  ────────────────────────  ────────────────────────  ──────────────────  ──────────────── │
  │  worldCartesianPosition.R  worldJointPosition.J1     AI.{index}          WSI.{index}      │
  │  worldCartesianPosition.P  worldJointPosition.J2     AO.{index}          PMC_K.{index}    │
  │  worldCartesianPosition.W  worldJointPosition.J3     GI.{index}          PMC_D.{index}    │
  │  worldCartesianPosition.X  worldJointPosition.J4     GO.{index}          PMC_R.{index}    │
  │  worldCartesianPosition.Y  worldJointPosition.J5     SI.{index}          StringSystem     │
  │  worldCartesianPosition.Z  worldJointPosition.J6     SO.{index}           Variables.{i}   │
  │  worldCartesianPosition.E1 worldJointPosition.J7     UI.{index}          IntegerSystem    │
  │  worldCartesianPosition.E2 worldJointPosition.J8     UO.{index}           Variables.{i}   │
  │  worldCartesianPosition.E3 worldJointPosition.J9     RDI.{index}         PositionSystem   │
  │  worldCartesianPosition.T4                           RDO.{index}          Variables.{i}   │
  │  worldCartesianPosition.T5                           SDI.{index}         NumericRegisters  │
  │  worldCartesianPosition.T6                           SDO.{index}          .{index}         │
  │                                                      WDI.{index}         PositionRegisters │
  │                                                      WSI.{index}          .{index}         │
  │                                                                          StringRegisters  │
  │                                                                           .{index}         │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

  SOURCE EXAMPLE
  ──────────────
  ┌───────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                           │
  │  - name: fanuc1                                                                           │
  │    connector: FanucRobot                                                                  │
  │    address: 192.168.111.20                                                                │
  │    items:                                                                                 │
  │      - name: UI1                                                                          │
  │        address: UI.1                                                                      │
  │                                                                                           │
  └───────────────────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════════
