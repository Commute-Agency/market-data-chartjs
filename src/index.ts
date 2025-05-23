// TypeScript example for Chart.js
//import { Chart, registerables } from 'chart.js';

// Register components
//Chart.register(...registerables);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Chart: any; // Declare Chart globally for TypeScript to avoid errors
// Obtener el idioma desde Webflow o usar un valor por defecto
const locale =
  document.documentElement.getAttribute('data-wf-locale') ||
  document.documentElement.getAttribute('data-locale') ||
  'es-AR';

/**
 * Waits for the Chart.js library to load and initializes the charts.
 */
function waitForChartJsAndInitialize(interval = 1000): void {
  const checkChartJs = () => {
    if (typeof Chart !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('Chart.js is loaded. Initializing charts...');
      initializeCharts(); // Call the main chart initialization function
    } else {
      setTimeout(checkChartJs, interval); // Retry after the interval
    }
  };

  checkChartJs();

  // Format all elements with data-number attribute
  formatNumbersByAttribute('data-number', locale);
}

/**
 * Initializes all Chart.js charts on the page.
 */
function initializeCharts(): void {
  // Select all chart items
  const chartItems = document.querySelectorAll<HTMLDivElement>('.chart-item');

  chartItems.forEach((chartItem) => {
    const canvasId = `${chartItem.id}-canvas`; // Unique canvas ID
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    const scriptTag = chartItem.querySelector<HTMLScriptElement>('.chart-data');

    if (canvas && scriptTag && scriptTag.textContent) {
      try {
        const chartData = JSON.parse(scriptTag.textContent.replace(/&quot;/g, '"') || '{}');
        const filteredData = chartData.filter(
          (data: { [x: string]: string }) =>
            scriptTag.dataset.value && Number(data[scriptTag.dataset.value]) !== 0
        );
        // Extract data for the chart
        interface ChartData {
          [key: string]: string;
        }

        const labels: string[] = scriptTag.dataset.label
          ? filteredData.map((data: ChartData) => data[scriptTag.dataset.label as string])
          : [];
        const values: number[] =
          filteredData.map((data: ChartData) =>
            parseFloat(data[scriptTag.dataset.value as string])
          ) || [];

        const { data: downsampledData, labels: downsampledLabels } = adaptiveDownsampling(
          values,
          labels,
          150
        );

        initializeChart(canvas, downsampledLabels, downsampledData, chartItem.id);
        scriptTag.remove(); // Remove the script tag after processing
      } catch (error) {
        console.error(`Error parsing JSON for chart ID: ${chartItem.id}`, error);
      }
    }
  });
}

/**
 * Reduces the number of data points and corresponding labels by downsampling them
 * to a specified maximum number of points using an adaptive approach.
 *
 * @param data - An array of numerical data points to be downsampled.
 * @param labels - An array of labels corresponding to the data points.
 * @param maxPoints - The maximum number of points to retain after downsampling. Default is 50.
 * @returns An object containing the downsampled data and labels.
 */
function adaptiveDownsampling(data: number[], labels: string[], maxPoints = 50) {
  const totalPoints = data.length;

  // Si hay pocos datos, no hacer downsampling
  if (totalPoints <= maxPoints) {
    return { data, labels };
  }

  // Calcular factor de reducción dinámico
  const factor = Math.ceil(totalPoints / maxPoints);

  // Filtrar datos y etiquetas cada 'factor' puntos
  const downsampledData = data.filter((_: number, index: number) => index % factor === 0);
  const downsampledLabels = labels.filter((_: string, index: number) => index % factor === 0);

  return { data: downsampledData, labels: downsampledLabels };
}

/**
 * Initialize a Chart.js chart.
 * @param canvas - HTMLCanvasElement where the chart will render.
 * @param labels - Array of labels for the x-axis.
 * @param data - Array of data values for the chart.
 * @param chartId - Unique ID for the chart (for logging/debugging purposes).
 */
function initializeChart(
  canvas: HTMLCanvasElement,
  labels: string[],
  data: number[],
  chartId: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error(`Canvas context not found for chart ID: ${chartId}`);
    return;
  }

  // Create gradient for the chart background
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, 'rgba(0, 192, 0, 0.7)'); // Top color
  gradient.addColorStop(1, 'rgba(0, 192, 0, 0.1)'); // Bottom transparent color

  // Initialize Chart.js chart
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: ``,
          data: data,
          borderColor: 'rgba(0, 192, 0, 0.7)',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          //cubicInterpolationMode: 'monotone',
          //hoverRadius: 7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false, drawTicks: true, offset: true },
          title: { display: false, text: 'Time' },
          ticks: {
            autoSkip: true, // Salta etiquetas si son demasiadas
            autoSkipPadding: 20, // Asegura que haya espacio entre ticks
            maxRotation: 0, // Evita que las etiquetas se roten
            //align: 'right',
            includeBounds: true,
            //maxTicksLimit: 10,
            padding: -30,
            //z: 10,
            callback: function (value: number, index: number): string {
              return index === 0 ? '' : labels[index].split(':').slice(0, 2).join(':'); // Quita los segundos
            },
            offset: true, // 🔹 Evita que los ticks extremos queden pegados
            clip: false, // 🔹 Evita que se corten los valores en los bordes
            display: true,
          },
        },
        y: {
          grid: {
            display: false,
            drawTicks: true, // 🔹 Asegura que los ticks no queden fuera del área de dibujo
            offset: true,
          },
          title: { display: false, text: 'Values' },
          ticks: {
            callback: function (value: number, index: number): string {
              return index === 0
                ? ''
                : value.toLocaleString(locale, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  });
            },
          },
          clip: false,
        },
      },
      plugins: {
        legend: { display: false, position: 'top' },
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      layout: {
        padding: {
          bottom: -50, // 🔹 Ajusta este valor para más margen
        },
      },
    },
  });
}

/**
 * Formats all numbers with a specific data attribute according to the locale.
 * @param attribute - The data attribute to select elements.
 * @param locale - The locale to use for formatting numbers.
 */
function formatNumbersByAttribute(attribute: string, locale: string): void {
  const elements = document.querySelectorAll<HTMLElement>(`[${attribute}]`);

  elements.forEach((element) => {
    const value = parseFloat(element.textContent || '0');
    if (!isNaN(value)) {
      element.textContent = value.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
    }
  });
}

/**
 * Handles the dropdown functionality for the charts index.
 */
function chartsIndexDropdown() {
  const dropdownLinks = document.querySelectorAll<HTMLElement>('[data-tab-target]');

  dropdownLinks.forEach((link) => {
    const targetId: string | undefined = link.dataset.tabTarget;
    const target: HTMLElement | null = targetId ? document.getElementById(targetId) : null;

    if (!target) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const isActive = target.closest('[aria-selected="true"]') ? true : false;

      if (isActive) return;

      target.click();
    });
  });
}

// Initialize all functions
function initMarketData() {
  waitForChartJsAndInitialize();
  chartsIndexDropdown();
}

// Run the init function after the DOM is loaded
document.addEventListener('DOMContentLoaded', initMarketData);
