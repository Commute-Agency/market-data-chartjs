---
"@commute/market-data-chartjs": major
---

Switch the x-axis to Chart.js's native `time` scale so points are positioned by real elapsed time and tick labels are automatically round and evenly spaced, instead of being positioned by data index. Optionally force an exact tick spacing with `data-tick-interval-minutes` on the canvas. **Breaking:** consuming sites must now also load a date adapter script (e.g. `chartjs-adapter-date-fns`) before this library's script — see the updated Requirements section in the README.
