# Commute Market Data Render with ChartJS

A library to help you render market data using ChartJS.
This was originally developed to be used in a Webflow project, but you can use it in any other platform.

## Reference
- [Requirements](#requirements)
- [Installation](#installation)
- [How to use](#how-to-use)
- [Chart Configuration](#chart-configuration)
- [Number Localization](#number-localization)
- [Special Thanks](#special-thanks)


## Requirements

This library requires the use of [chartjs](https://www.npmjs.com/package/chart.js?activeTab=readme), plus a
date adapter for its `time` x-axis scale. Add the following lines inside the `<head>` tag in your website,
in this order:

```html
<script defer src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
```

Use `defer` (not `async`) on these scripts, and load this library's script after them, so the date adapter
is registered before any chart is created.

## Installation

Add the following line inside the <head> tag in your website:

```bash
<script async src="https://cdn.jsdelivr.net/npm/@commute/market-data-chartjs@version/dist/index.js"></script>
```

## How to use

Add the following line inside the <head> tag in your website:

```bash
<script async src="https://cdn.jsdelivr.net/npm/@commute/market-data@version/dist/index.js"></script>
```

## Chart Configuration

The chart's `<canvas>` element accepts a few optional `data-*` attributes:

- `data-currency`: e.g. `data-currency="ARS"` formats tooltip values as currency instead of plain numbers.
- `data-tick-interval-minutes`: e.g. `data-tick-interval-minutes="15"` forces the x-axis ticks to fall at exact, evenly-spaced multiples of that interval instead of Chart.js's automatic "nice" steps.
- `data-line-color`, `data-gradient-top-color`, `data-gradient-bottom-color`: override the line and fill colors.
- `data-gradient-angle`: e.g. `data-gradient-angle="30"` tilts the fill gradient clockwise by that many degrees, instead of the default straight-down (`0`) direction.
- `data-start-time` / `data-end-time`: e.g. `data-start-time="11:00"` and `data-end-time="17:00"` pin the x-axis to that fixed schedule window (anchored to today), instead of auto-ranging to only the data received so far. As new points arrive during the day, the line fills in toward the end of a stable axis rather than the axis growing with the data. Both attributes must be set together — if only one is present, the axis auto-ranges as before. Times use `HH:MM` or `HH:MM:SS` format.

## Number Localization
You can localize numbers by adding the custom attribute 'data-number' to the elements that need that utility.
It will get the website's locale by using the attributes 'data-wf-locale=locale' or 'data-locale=locale'.
For example, if your HTML has the 'data-wf-locale=es-AR' attribute, your locale would be 'es-AR'.

## Special Thanks

A huge thank you to [Finsweet](https://github.com/finsweet) for providing the foundation of this project with [Finsweet Developer Starter](https://github.com/finsweet/developer-starter). 💪🏽

Plase refer to the original project for extensive documentation.