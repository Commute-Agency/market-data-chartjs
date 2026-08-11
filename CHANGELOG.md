# @commute/market-data-chartjs

## 3.1.0

### Minor Changes

- 140238d: Add optional `data-start-time` / `data-end-time` attributes on the canvas to pin the x-axis to a fixed schedule window (e.g. `11:00` to `17:00`), instead of auto-ranging to only the data received so far. As new points arrive, the line fills in toward the end of a stable axis. Both attributes must be set together; when omitted, the axis continues to auto-range as before.
- 140238d: Add optional `data-gradient-angle` attribute on the canvas to rotate the chart's fill gradient clockwise by a given number of degrees, instead of always being strictly vertical. Defaults to `0`, so existing charts render unchanged.

## 3.0.0

### Major Changes

- 6a4c52c: Switch the x-axis to Chart.js's native `time` scale so points are positioned by real elapsed time and tick labels are automatically round and evenly spaced, instead of being positioned by data index. Optionally force an exact tick spacing with `data-tick-interval-minutes` on the canvas. **Breaking:** consuming sites must now also load a date adapter script (e.g. `chartjs-adapter-date-fns`) before this library's script — see the updated Requirements section in the README.

## 2.4.1

### Patch Changes

- 4104363: Add optional currency formatting (e.g. ARS) for chart tooltip values and `data-number` elements via a `data-currency` attribute.

## 2.4.0

### Minor Changes

- 3bc073b: Allow customizing the chart line and gradient colors via `data-line-color`, `data-gradient-top-color` and `data-gradient-bottom-color` attributes on the canvas element, falling back to the previous green defaults when not provided.

## 2.3.0

### Minor Changes

- 0edf8e3: Remove timeout for chartjs library waiting

## 2.2.0

### Minor Changes

- d7bdcae: Change init function name to prevent errors

## 2.1.0

### Minor Changes

- 1db779b: New functionalities

### Patch Changes

- 5dc184a: New updates

## 2.0.0

### Major Changes

- 4127f56: Improvements in functionality
