"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/index.ts
  var locale = document.documentElement.getAttribute("data-wf-locale") || document.documentElement.getAttribute("data-locale") || "es-AR";
  function waitForChartJsAndInitialize(timeout = 6e3, interval = 50) {
    const startTime = Date.now();
    const checkChartJs = () => {
      if (typeof Chart !== "undefined") {
        console.log("Chart.js is loaded. Initializing charts...");
        initializeCharts();
      } else if (Date.now() - startTime < timeout) {
        setTimeout(checkChartJs, interval);
      } else {
        console.error("Chart.js library did not load within the timeout period.");
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
          initializeChart(canvas, downsampledLabels, downsampledData, chartItem.id);
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
  function initializeChart(canvas, labels, data, chartId) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error(`Canvas context not found for chart ID: ${chartId}`);
      return;
    }
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(0, 192, 0, 0.7)");
    gradient.addColorStop(1, "rgba(0, 192, 0, 0.1)");
    new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: ``,
            data,
            borderColor: "rgba(0, 192, 0, 0.7)",
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
            grid: { display: false, drawTicks: true, offset: true },
            title: { display: false, text: "Time" },
            ticks: {
              autoSkip: true,
              // Salta etiquetas si son demasiadas
              autoSkipPadding: 20,
              // Asegura que haya espacio entre ticks
              maxRotation: 0,
              // Evita que las etiquetas se roten
              //align: 'right',
              includeBounds: true,
              //maxTicksLimit: 10,
              padding: -30,
              //z: 10,
              callback: function(value, index) {
                return index === 0 ? "" : labels[index].split(":").slice(0, 2).join(":");
              },
              offset: true,
              // 🔹 Evita que los ticks extremos queden pegados
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
          legend: { display: false, position: "top" }
        },
        interaction: {
          intersect: false,
          mode: "index"
        },
        layout: {
          padding: {
            bottom: -50
            // 🔹 Ajusta este valor para más margen
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
        element.textContent = value.toLocaleString(locale2, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        });
      }
    });
  }
  document.addEventListener("DOMContentLoaded", () => waitForChartJsAndInitialize());
})();
//# sourceMappingURL=index.js.map
