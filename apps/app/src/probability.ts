// http://www.durangobill.com/BingoStats.html
// The first value is for the first call.
const data = [
  0, 0, 0, 3.29096e-6, 1.69183e-5, 5.21455e-5, 0.000124918, 0.000256322,
  0.000473048, 0.000807826, 0.00129986, 0.00199521, 0.00294715, 0.00421648,
  0.00587167, 0.00798905, 0.0106527, 0.0139544, 0.0179931, 0.0228745, 0.02871,
  0.0356161, 0.0437125, 0.0531204, 0.0639611, 0.0763526, 0.090408, 0.106232,
  0.123916, 0.143539, 0.16516, 0.188814, 0.214512, 0.242233, 0.271928, 0.303508,
  0.336849, 0.371789, 0.408129, 0.445631, 0.484023, 0.523003, 0.56224, 0.601387,
  0.640081, 0.677958, 0.714658, 0.749837, 0.783176, 0.814392, 0.843246,
  0.869552, 0.893182, 0.91407, 0.932215, 0.947681, 0.960588, 0.971114, 0.979475,
  0.985926, 0.990739, 0.994194, 0.996563, 0.998104, 0.999041, 0.999566,
  0.999831, 0.999947, 0.999988, 0.999999, 1, 1, 1, 1, 1
]

function getValue(index: number, boardCount: number): number {
  return index > 0
    ? index < data.length - 1
      ? 1 - (1 - data[index]) ** boardCount
      : 1
    : 0
}

export function createCumulativeValues(
  boardCount: number,
  sessionLength: number
): number[] {
  return Array.from({ length: sessionLength }, (_, index) =>
    getValue(index, boardCount)
  )
}

export function createValues(
  boardCount: number,
  sessionLength: number
): number[] {
  return createCumulativeValues(boardCount, sessionLength).map(
    (value, index, values) => value - (values[index - 1] ?? 0)
  )
}
