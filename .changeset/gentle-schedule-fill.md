---
"@commute/market-data-chartjs": minor
---

Add optional `data-start-time` / `data-end-time` attributes on the canvas to pin the x-axis to a fixed schedule window (e.g. `11:00` to `17:00`), instead of auto-ranging to only the data received so far. As new points arrive, the line fills in toward the end of a stable axis. Both attributes must be set together; when omitted, the axis continues to auto-range as before.
