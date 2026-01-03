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
let chart: Chart|null = null;
export function profile(canvas: HTMLCanvasElement, dataArray: number[], lblArray: number[]) {

  if(chart) {
    chart.clear
    chart.destroy
    chart = null
  }

  console.log("dataArray", dataArray)
  console.log("lblArray", lblArray)
  chart = new Chart(canvas as any, {
    type: "line",
    data: {
      labels: lblArray,
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
          title: { display: true, text: "Distance (Meters)" },
          type: "linear",
          min: 0
        },
        y: {
          title: { display: true, text: "Elevation (Meters)" },
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
