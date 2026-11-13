// worker.js — выполняется в отдельном потоке, без доступа к DOM

self.onmessage = (e) => {
  const n = e.data.n;

  if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) {
    self.postMessage({ type: 'error', message: 'Некорректное число' });
    return;
  }

  try {
    // Тяжёлое вычисление: логарифм факториала, чтобы не переполнять Number.
    // Для больших n считаем сумму логарифмов, а потом показываем в экспоненциальной форме.
    let logSum = 0;
    for (let i = 2; i <= n; i++) {
      logSum += Math.log(i);
    }

    // Для наглядности: приближение факториала как экспоненты суммы логарифмов
    const result = Math.exp(logSum);

    self.postMessage({ type: 'success', n: n, result: result });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
