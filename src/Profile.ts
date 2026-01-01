import {
  Chart,
  Colors,
  //   BarController,
  CategoryScale,
  LinearScale,
  //   BarElement,
  Legend,
  LineController,
  PointElement,
  LineElement,
} from "chart.js";

Chart.register(
  Colors,
  //   BarController,
  //   BarElement,
  CategoryScale,
  LinearScale,
  Legend,
  LineController,
  PointElement,
  LineElement
);

export function profile(canvas: HTMLCanvasElement, dataArray: number[]) {
  const labels = dataArray.map((_, i) => i.toString());

  const chart = new Chart(canvas as any, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Elevation",
          data: dataArray,
          borderColor: "red",
          backgroundColor: "rgba(255,0,0,0.08)",
          fill: true,
          tension: 0.2,
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: "Sample" },
        },
        y: {
          title: { display: true, text: "Elevation" },
          beginAtZero: false,
        },
      },
      plugins: {
        legend: { display: true },
        tooltip: { mode: "index", intersect: false },
      },
    },
  });
  return chart;
}
