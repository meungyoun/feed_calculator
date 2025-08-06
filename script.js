const products = [
  { name: "화식선생 닭", kcal: 138.3, protein: 13.96, fat: 5.4, moisture: 67.6 },
  { name: "화식선생 오리", kcal: 136.5, protein: 13.53, fat: 5.58, moisture: 68.1 },
  { name: "화식선생 소", kcal: 132.8, protein: 12.13, fat: 5.37, moisture: 68.7 },
  { name: "화식선생 양", kcal: 134.8, protein: 12.36, fat: 5.25, moisture: 68.0 },
  { name: "화식선생 흑돼지", kcal: 127.2, protein: 13.33, fat: 5.2, moisture: 68.8 },
  { name: "테리셔스 연어", kcal: 124, protein: 12.5, fat: 7.5, moisture: 78 },
  { name: "파테 치킨수퍼그린", kcal: 78, protein: 10, fat: 3, moisture: 82 },
  { name: "파테 연어치킨", kcal: 123, protein: 10.5, fat: 8, moisture: 78.25 },
  { name: "파테 칠면조가을채소", kcal: 124, protein: 12.5, fat: 7.5, moisture: 78 }
];

// UI에 체크박스 생성
const productListDiv = document.getElementById("product-list");
products.forEach((p, i) => {
  const div = document.createElement("div");
  div.className = "product-item";
  div.innerHTML = `
    <label>
      <input type="checkbox" value="${i}"> ${p.name}
    </label>
  `;
  productListDiv.appendChild(div);
});

// 조합 생성 함수
function getCombinations(arr, k) {
  const results = [];
  function helper(start, combo) {
    if (combo.length === k) {
      results.push(combo);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      helper(i + 1, [...combo, arr[i]]);
    }
  }
  helper(0, []);
  return results;
}

// 계산 시작
document.getElementById("generate").addEventListener("click", () => {
  const weight = parseFloat(document.getElementById("weight").value);
  const activity = parseFloat(document.getElementById("activity").value);
  const ratio = parseFloat(document.getElementById("ratio").value);

  if (!weight || weight <= 0) {
    alert("몸무게를 입력해주세요.");
    return;
  }

  const RER = 70 * Math.pow(weight, 0.75);
  const MER = RER * activity;

  const rawKibbleKcal = MER * (1 - ratio);
  const foodKcal = MER * ratio;

  const kibbleGram = rawKibbleKcal / 3.8;

  // 선택한 제품만 필터
  const selectedIndexes = Array.from(document.querySelectorAll('#product-list input[type="checkbox"]:checked'))
    .map(c => parseInt(c.value));
  const selected = selectedIndexes.map(i => products[i]);

  if (selected.length === 0) {
    alert("화식 제품을 최소 1개 이상 선택해주세요.");
    return;
  }

  const allCombos = [
    ...getCombinations(selected, 1),
    ...getCombinations(selected, 2),
    ...getCombinations(selected, 3)
  ];

  const results = [];

  allCombos.forEach(combo => {
    const perKcal = foodKcal / combo.length;
    let totalGram = 0;
    let totalKcal = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalMoisture = 0;

    const detail = combo.map(p => {
      const g = Math.round((perKcal / (p.kcal / 100)) / 10) * 10; // 10g 단위로 반올림
      const kcal = g * (p.kcal / 100);
      const protein = g * (p.protein / 100);
      const fat = g * (p.fat / 100);
      const moisture = g * (p.moisture / 100);

      totalGram += g;
      totalKcal += kcal;
      totalProtein += protein;
      totalFat += fat;
      totalMoisture += moisture;

      return {
        name: p.name,
        gram: g,
        kcal,
        protein,
        fat,
        moisture
      };
    });

    results.push({
      detail,
      totalGram,
      totalKcal,
      totalProtein,
      totalFat,
      totalMoisture
    });
  });

  // 랜덤 3개 추출
  const shuffled = results.sort(() => 0.5 - Math.random()).slice(0, 3);

  const resultBox = document.getElementById("result-box");
  resultBox.innerHTML = `<p><strong>선택하신 비율과 제품을 기반으로 이런 식단을 짜줄 수 있어요!</strong></p>`;

  shuffled.forEach((r, i) => {
    let out = `<div style="margin-bottom: 20px;"><strong>🥣 조합 ${i + 1}</strong><ul>`;
    r.detail.forEach(p => {
      out += `<li>${p.name}: ${p.gram}g (${p.kcal.toFixed(1)} kcal)</li>`;
    });
    out += `</ul>
      사료 급여량: <strong>${kibbleGram.toFixed(1)}g</strong><br>
      🔢 총 kcal: ${r.totalKcal.toFixed(1)} kcal<br>
      💪 단백질: ${r.totalProtein.toFixed(1)}g / 🧈 지방: ${r.totalFat.toFixed(1)}g<br>
      💧 수분: ${r.totalMoisture.toFixed(1)}g
    </div>`;
    resultBox.innerHTML += out;
  });
});
