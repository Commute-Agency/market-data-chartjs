# Commute Market Data Render with ChartJS

A library to help you render market data using ChartJS.
This was originally developed to be used in a Webflow project, but you can use it in any other platform.

## Reference
- [Requirements](#requirements)
- [Installation](#installation)
- [How to use](#how-to-use)
- [Number Localization](#number-localization)
- [Special Thanks](#special-thanks)


## Requirements

This library requires the use of [chartjs](https://www.npmjs.com/package/chart.js?activeTab=readme). 
You can add the following line inside the <head> tag in your website:

```bash
<script async src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

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

## Number Localization
You can localize numbers by adding the custom attribute 'data-number' to the elements that need that utility.
It will get the website's locale by using the attributes 'data-wf-locale=locale' or 'data-locale=locale'.
For example, if your HTML has the 'data-wf-locale=es-AR' attribute, your locale would be 'es-AR'.

## Special Thanks

A huge thank you to [Finsweet](https://github.com/finsweet) for providing the foundation of this project with [Finsweet Developer Starter](https://github.com/finsweet/developer-starter). 💪🏽

Plase refer to the original project for extensive documentation.