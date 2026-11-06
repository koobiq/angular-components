# Spec Delta

## MODIFIED Requirements

### Requirement: Indeterminate fill sweeps across the track

In a left-to-right layout and with motion on, the indeterminate segment SHALL sweep across the track from left to right and repeat. It SHALL start each iteration at the left edge of the track and leave past its right edge, with no part of the iteration in which it is parked outside the track. The sweep is not mirrored for a right-to-left layout, where the segment is laid out at the right end of the track, so this guarantee does not cover it.

#### Scenario: One iteration of the sweep

- **WHEN** an indeterminate bar in a left-to-right layout animates with motion on
- **THEN** at the start of an iteration the right edge of the segment is at or past the left edge of the track
- **AND** halfway through the segment overlaps the track
- **AND** by the end of the iteration the right edge of the segment is past the right edge of the track
