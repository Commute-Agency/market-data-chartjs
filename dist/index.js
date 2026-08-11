"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/index.ts
  var locale = document.documentElement.getAttribute("data-wf-locale") || document.documentElement.getAttribute("data-locale") || "es-AR";
  function formatNumber(value, numberLocale, currency) {
    if (currency) {
      return value.toLocaleString(numberLocale, {
        style: "currency",
        currency,
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
    }
    return value.toLocaleString(numberLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }
  function waitForChartJsAndInitialize(interval = 1e3) {
    const checkChartJs = () => {
      if (typeof Chart !== "undefined") {
        console.log("Chart.js is loaded. Initializing charts...");
        initializeCharts();
      } else {
        setTimeout(checkChartJs, interval);
      }
    };
    checkChartJs();
    formatNumbersByAttribute("data-number", locale);
  }
  function initializeCharts() {
    const chartItems = document.querySelectorAll(".chart-item");
    chartItems.forEach((chartItem) => {
      const canvasId = `${chartItem.id}-canvas`;
      const canvas = document.getElementById(canvasId);
      const scriptTag = chartItem.querySelector(".chart-data");
      if (canvas && scriptTag && scriptTag.textContent) {
        try {
          const chartData = JSON.parse(scriptTag.textContent.replace(/&quot;/g, '"') || "{}");
          const filteredData = chartData.filter(
            (data) => scriptTag.dataset.value && Number(data[scriptTag.dataset.value]) !== 0
          );
          const labels = scriptTag.dataset.label ? filteredData.map((data) => data[scriptTag.dataset.label]) : [];
          const values = filteredData.map(
            (data) => parseFloat(data[scriptTag.dataset.value])
          ) || [];
          const { data: downsampledData, labels: downsampledLabels } = adaptiveDownsampling(
            values,
            labels,
            150
          );
          const points = downsampledData.map((value, index) => ({
            x: parseTimeLabel(downsampledLabels[index]),
            y: value
          }));
          initializeChart(canvas, points, chartItem.id);
          scriptTag.remove();
        } catch (error) {
          console.error(`Error parsing JSON for chart ID: ${chartItem.id}`, error);
        }
      }
    });
  }
  function adaptiveDownsampling(data, labels, maxPoints = 50) {
    const totalPoints = data.length;
    if (totalPoints <= maxPoints) {
      return { data, labels };
    }
    const factor = Math.ceil(totalPoints / maxPoints);
    const downsampledData = data.filter((_, index) => index % factor === 0);
    const downsampledLabels = labels.filter((_, index) => index % factor === 0);
    return { data: downsampledData, labels: downsampledLabels };
  }
  function parseTimeLabel(label) {
    const [hours, minutes, seconds] = label.split(":").map(Number);
    const date = /* @__PURE__ */ new Date();
    date.setHours(hours, minutes, seconds || 0, 0);
    return date;
  }
  function initializeChart(canvas, points, chartId) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error(`Canvas context not found for chart ID: ${chartId}`);
      return;
    }
    const lineColor = canvas.dataset.lineColor || "rgba(0, 192, 0, 0.7)";
    const gradientTopColor = canvas.dataset.gradientTopColor || lineColor;
    const gradientBottomColor = canvas.dataset.gradientBottomColor || "rgba(0, 192, 0, 0.1)";
    const { currency, tickIntervalMinutes, startTime, endTime } = canvas.dataset;
    const tickStepSize = Number(tickIntervalMinutes) || void 0;
    const scheduleStart = startTime && endTime ? parseTimeLabel(startTime) : void 0;
    const scheduleEnd = startTime && endTime ? parseTimeLabel(endTime) : void 0;
    const gradientAngle = Number(canvas.dataset.gradientAngle) || 0;
    const gradientAngleRad = gradientAngle * Math.PI / 180;
    const gradientLength = 400;
    const gradientX1 = gradientLength * Math.sin(gradientAngleRad);
    const gradientY1 = gradientLength * Math.cos(gradientAngleRad);
    const gradient = ctx.createLinearGradient(0, 0, gradientX1, gradientY1);
    gradient.addColorStop(0, gradientTopColor);
    gradient.addColorStop(1, gradientBottomColor);
    new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: ``,
            data: points,
            borderColor: lineColor,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 0
            //cubicInterpolationMode: 'monotone',
            //hoverRadius: 7,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: "time",
            time: {
              tooltipFormat: "HH:mm:ss",
              displayFormats: { minute: "HH:mm", hour: "HH:mm" }
            },
            grid: { display: false, drawTicks: true },
            title: { display: false, text: "Time" },
            // When a fixed schedule is configured (data-start-time/data-end-time), pin
            // the axis range instead of letting it auto-range from the data extent.
            ...scheduleStart && scheduleEnd ? { min: scheduleStart, max: scheduleEnd } : {},
            // When a fixed interval is configured (data-tick-interval-minutes), generate
            // ticks at exact multiples of it, instead of Chart.js's automatic "nice" steps.
            ...tickStepSize ? {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              afterBuildTicks: (axis) => {
                const stepMs = tickStepSize * 60 * 1e3;
                const firstTick = Math.ceil(axis.min / stepMs) * stepMs;
                const generatedTicks = [];
                for (let value = firstTick; value <= axis.max; value += stepMs) {
                  generatedTicks.push({ value });
                }
                axis.ticks = generatedTicks;
              }
            } : {},
            ticks: {
              autoSkip: true,
              // Salta etiquetas si son demasiadas
              autoSkipPadding: 20,
              // Asegura que haya espacio entre ticks
              maxRotation: 0,
              // Evita que las etiquetas se roten
              padding: -30,
              clip: false,
              // 🔹 Evita que se corten los valores en los bordes
              display: true
            }
          },
          y: {
            grid: {
              display: false,
              drawTicks: true,
              // 🔹 Asegura que los ticks no queden fuera del área de dibujo
              offset: true
            },
            title: { display: false, text: "Values" },
            ticks: {
              callback: function(value, index) {
                return index === 0 ? "" : value.toLocaleString(locale, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                });
              }
            },
            clip: false
          }
        },
        plugins: {
          legend: { display: false, position: "top" },
          tooltip: {
            callbacks: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label: function(context) {
                return formatNumber(context.parsed.y, locale, currency);
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: "index"
        },
        layout: {
          padding: {
            bottom: -50,
            // 🔹 Ajusta este valor para más margen
            right: 10
            // 🔹 Evita que la línea quede pegada al borde derecho
          }
        }
      }
    });
  }
  function formatNumbersByAttribute(attribute, locale2) {
    const elements = document.querySelectorAll(`[${attribute}]`);
    elements.forEach((element) => {
      const value = parseFloat(element.textContent || "0");
      if (!isNaN(value)) {
        element.textContent = formatNumber(value, locale2, element.dataset.currency);
      }
    });
  }
  function chartsIndexDropdown() {
    const dropdownLinks = document.querySelectorAll("[data-tab-target]");
    dropdownLinks.forEach((link) => {
      const targetId = link.dataset.tabTarget;
      const target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const isActive = target.closest('[aria-selected="true"]') ? true : false;
        if (isActive) return;
        target.click();
      });
    });
  }
  function initMarketData() {
    waitForChartJsAndInitialize();
    chartsIndexDropdown();
  }
  document.addEventListener("DOMContentLoaded", initMarketData);
})();
//# sourceMappingURL=index.js.map
