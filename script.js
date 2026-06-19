import { auth, db } from "./firebase.js";

// Login local do Projeto Dieta
const APP_PASSWORD = "batata";

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const authArea = document.getElementById("authArea");
const appArea = document.getElementById("appArea");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const resetBtn = document.getElementById("resetBtn");
const logoutBtn = document.getElementById("logoutBtn");

const profileName = document.getElementById("profileName");
const profileSex = document.getElementById("profileSex");
const profileAge = document.getElementById("profileAge");
const profileHeight = document.getElementById("profileHeight");
const profileWeight = document.getElementById("profileWeight");
const profileGoalWeight = document.getElementById("profileGoalWeight");
const activityLevel = document.getElementById("activityLevel");
const waterGoalInput = document.getElementById("waterGoalInput");
const saveProfileBtn = document.getElementById("saveProfileBtn");

const foodName = document.getElementById("foodName");
const foodCalories = document.getElementById("foodCalories");
const waterAmount = document.getElementById("waterAmount");
const weightInput = document.getElementById("weightInput");
const workoutType = document.getElementById("workoutType");
const workoutMinutes = document.getElementById("workoutMinutes");
const appPassword = document.getElementById("appPassword");
const enterAppBtn = document.getElementById("enterAppBtn");
const rememberMe = document.getElementById("rememberMe");


const activeProfileText =
  document.getElementById("activeProfile");

let activeProfile =
  localStorage.getItem("activeProfile") || "";

const addFoodBtn = document.getElementById("addFoodBtn");
const addWaterBtn = document.getElementById("addWaterBtn");
const addWeightBtn = document.getElementById("addWeightBtn");
const addWorkoutBtn = document.getElementById("addWorkoutBtn");

const totalCalories = document.getElementById("totalCalories");
const totalWater = document.getElementById("totalWater");
const currentWeight = document.getElementById("currentWeight");
const totalWorkouts = document.getElementById("totalWorkouts");

const calorieGoal = document.getElementById("calorieGoal");
const waterGoalText = document.getElementById("waterGoalText");
const goalWeightText = document.getElementById("goalWeightText");
const tmbText = document.getElementById("tmbText");

const historyList = document.getElementById("historyList");
const navButtons = document.querySelectorAll(".nav-btn[data-screen]");
const screens = document.querySelectorAll(".screen");
const sidebar = document.querySelector(".sidebar");
const toggleMenuBtn = document.getElementById("toggleMenuBtn");
const foodSearch = document.getElementById("foodSearch");
const foodResults = document.getElementById("foodResults");
const gramsInput = document.getElementById("gramsInput");
const minusGramsBtn = document.getElementById("minusGramsBtn");
const plusGramsBtn = document.getElementById("plusGramsBtn");
const addToMealBtn = document.getElementById("addToMealBtn");
const saveMealBtn = document.getElementById("saveMealBtn");
const selectedFoodsList = document.getElementById("selectedFoodsList");

const mealCalories = document.getElementById("mealCalories");
const mealProtein = document.getElementById("mealProtein");
const mealCarbs = document.getElementById("mealCarbs");
const mealFat = document.getElementById("mealFat");

let selectedFood = null;
let selectedMeal = "Café da manhã";
let mealItems = [];

const foodDatabase = [
  { name: "Ovo cozido", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { name: "Peito de frango grelhado", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Arroz branco cozido", calories: 128, protein: 2.5, carbs: 28, fat: 0.2 },
  { name: "Feijão carioca cozido", calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: "Maçã", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: "Batata doce cozida", calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: "Leite integral", calories: 61, protein: 3.2, carbs: 4.7, fat: 3.3 },
  { name: "Pão integral", calories: 247, protein: 13, carbs: 41, fat: 4.2 },
  { name: "Iogurte natural", calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { name: "Queijo minas", calories: 264, protein: 17, carbs: 3.2, fat: 20 },
  { name: "Aveia", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9 },
  { name: "Carne bovina magra", calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: "Tilápia grelhada", calories: 128, protein: 26, carbs: 0, fat: 2.7 },
  { name: "Salmão", calories: 208, protein: 20, carbs: 0, fat: 13 }
];

function calculateFood(food, grams) {
  const factor = grams / 100;

  return {
    name: food.name,
    grams,
    calories: Math.round(food.calories * factor),
    protein: Number((food.protein * factor).toFixed(1)),
    carbs: Number((food.carbs * factor).toFixed(1)),
    fat: Number((food.fat * factor).toFixed(1))
  };
}

if (foodSearch) {
  foodSearch.addEventListener("input", () => {
    const term = foodSearch.value.toLowerCase();
    foodResults.innerHTML = "";

    if (!term) return;

    foodDatabase
      .filter((food) => food.name.toLowerCase().includes(term))
      .slice(0, 10)
      .forEach((food) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "food-result";
        button.innerHTML = `
          <strong>${food.name}</strong>
          <small>${food.calories} kcal / 100g</small>
        `;

        button.addEventListener("click", () => {
          selectedFood = food;
          foodSearch.value = food.name;
          foodResults.innerHTML = "";
        });

        foodResults.appendChild(button);
      });
  });
}

if (minusGramsBtn) {
  minusGramsBtn.addEventListener("click", () => {
    gramsInput.value = Math.max(Number(gramsInput.value) - 10, 10);
  });
}

if (plusGramsBtn) {
  plusGramsBtn.addEventListener("click", () => {
    gramsInput.value = Number(gramsInput.value) + 10;
  });
}

document.querySelectorAll(".quick-grams button").forEach((button) => {
  button.addEventListener("click", () => {
    gramsInput.value = button.dataset.grams;
  });
});

document.querySelectorAll(".meal-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".meal-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    selectedMeal = button.dataset.meal;
  });
});

if (addToMealBtn) {
  addToMealBtn.addEventListener("click", () => {
    if (!selectedFood) {
      alert("Selecione um alimento.");
      return;
    }

    const calculated = calculateFood(selectedFood, Number(gramsInput.value || 100));
    mealItems.push(calculated);

    selectedFood = null;
    foodSearch.value = "";
    gramsInput.value = 100;

    renderMealItems();
  });
}

function renderMealItems() {
  if (!selectedFoodsList) return;

  selectedFoodsList.innerHTML = "";

  if (mealItems.length === 0) {
    selectedFoodsList.innerHTML = `<p class="empty-list">Nenhum alimento adicionado.</p>`;
  }

  mealItems.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "selected-food-item";

    div.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <small>${item.grams}g • ${item.calories} kcal • ${item.protein}g proteína</small>
      </div>
      <button type="button" data-index="${index}">Excluir</button>
    `;

    div.querySelector("button").addEventListener("click", () => {
      mealItems.splice(index, 1);
      renderMealItems();
    });

    selectedFoodsList.appendChild(div);
  });

  const totals = mealItems.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  if (mealCalories) mealCalories.textContent = `${Math.round(totals.calories)} kcal`;
  if (mealProtein) mealProtein.textContent = `${totals.protein.toFixed(1)}g`;
  if (mealCarbs) mealCarbs.textContent = `${totals.carbs.toFixed(1)}g`;
  if (mealFat) mealFat.textContent = `${totals.fat.toFixed(1)}g`;
}

async function saveMeal() {
  if (!activeProfile) {
    alert("Selecione Gabriel ou Raissa.");
    return;
  }

  if (mealItems.length === 0) {
    alert("Adicione pelo menos um alimento.");
    return;
  }

  const totals = mealItems.reduce(
    (acc, item) => {
      acc.calories += item.calories;
      acc.protein += item.protein;
      acc.carbs += item.carbs;
      acc.fat += item.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  await addDoc(collection(db, "entries"), {
    profile: activeProfile,
    type: "meal",
    meal: selectedMeal,
    items: mealItems,
    calories: Math.round(totals.calories),
    protein: Number(totals.protein.toFixed(1)),
    carbs: Number(totals.carbs.toFixed(1)),
    fat: Number(totals.fat.toFixed(1)),
    date: today(),
    createdAt: serverTimestamp()
  });

  mealItems = [];
  renderMealItems();
  alert("Refeição salva com sucesso!");
}

if (saveMealBtn) {
  saveMealBtn.addEventListener("click", saveMeal);
}

renderMealItems();

toggleMenuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("expanded");
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const screenName = button.dataset.screen;

    screens.forEach((screen) => {
      screen.classList.remove("active");
    });

    navButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    document
      .getElementById(`screen-${screenName}`)
      .classList.add("active");

    button.classList.add("active");
  });
});

let currentProfile = null;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function calculateTMB(sex, weight, height, age) {
  if (!sex || !weight || !height || !age) return 0;

  if (sex === "masculino") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }

  return 10 * weight + 6.25 * height - 5 * age - 161;
}

function getActivityFactor(level) {
  const factors = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    atleta: 1.9
  };

  return factors[level] || 1.2;
}

function calculateDailyCalories(tmb, level) {
  return tmb * getActivityFactor(level);
}

function calculateFatLossCalories(dailyCalories) {
  return Math.max(dailyCalories - 500, 1200);
}

const savedLogin =
  localStorage.getItem("projectDietLogged");

if (savedLogin === "true") {
  authArea.classList.add("hidden");
  appArea.classList.remove("hidden");
}

enterAppBtn.addEventListener("click", () => {
  const password = appPassword.value;

  if (password !== APP_PASSWORD) {
    alert("Senha incorreta");
    return;
  }

  if (rememberMe.checked) {
    localStorage.setItem(
      "projectDietLogged",
      "true"
    );
  }

  authArea.classList.add("hidden");
  appArea.classList.remove("hidden");
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem(
    "projectDietLogged"
  );

  location.reload();
});

profileSelect.addEventListener("change", async () => {
  activeProfile = profileSelect.value;

  localStorage.setItem("activeProfile", activeProfile);

  updateProfileLabel();

  await loadProfile();
  listenEntries();
});


function updateProfileLabel() {
  if (activeProfileText) {
    activeProfileText.textContent = activeProfile || "Nenhum";
  }

  if (profileSelect) {
    profileSelect.value = activeProfile || "";
  }

  document.querySelectorAll(".currentProfileLabel").forEach((item) => {
    item.textContent = activeProfile || "Nenhum";
  });

  document.querySelectorAll(".currentDateLabel").forEach((item) => {
    item.textContent = new Date().toLocaleDateString("pt-BR");
  });
}

updateProfileLabel();

if (savedLogin === "true") {
  loadProfile();
  listenEntries();
}

async function loadProfile() {
  if (!activeProfile) return;

  const ref = doc(db, "profiles", activeProfile);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  currentProfile = snap.data();

  profileName.value = currentProfile.name || "";
  profileSex.value = currentProfile.sex || "masculino";
  profileAge.value = currentProfile.age || "";
  profileHeight.value = currentProfile.height || "";
  profileWeight.value = currentProfile.currentWeight || "";
  profileGoalWeight.value = currentProfile.goalWeight || "";
  activityLevel.value = currentProfile.activityLevel || "moderado";
  waterGoalInput.value = currentProfile.waterGoal || 2500;

  updateProfileDashboard();
}

saveProfileBtn.addEventListener("click", async () => {
  if (!activeProfile) {
  alert("Selecione Gabriel ou Raissa.");
  return;
}

  const sex = profileSex.value;
  const age = Number(profileAge.value);
  const height = Number(profileHeight.value);
  const weight = Number(profileWeight.value);
  const level = activityLevel.value;

  const tmb = calculateTMB(sex, weight, height, age);
  const dailyCalories = calculateDailyCalories(tmb, level);
  const fatLossCalories = calculateFatLossCalories(dailyCalories);

  const profileData = {
   profile: activeProfile,
   name: profileName.value.trim(),
   sex,
   age,
   height,
   currentWeight: weight,
   goalWeight: Number(profileGoalWeight.value),
   activityLevel: level,
   waterGoal: Number(waterGoalInput.value),
   tmb: Math.round(tmb),
   dailyCalories: Math.round(dailyCalories),
   fatLossCalories: Math.round(fatLossCalories),
   updatedAt: serverTimestamp()
};

  await setDoc(
  doc(db, "profiles", activeProfile),
  profileData,
  { merge: true }
);

currentProfile = profileData;
updateProfileDashboard();

alert("Perfil salvo com sucesso!");
});

function updateProfileDashboard() {
  if (!currentProfile) return;

  calorieGoal.textContent = currentProfile.fatLossCalories
    ? `${currentProfile.fatLossCalories} kcal`
    : "-- kcal";

  waterGoalText.textContent = currentProfile.waterGoal
    ? `${currentProfile.waterGoal} ml`
    : "-- ml";

  goalWeightText.textContent = currentProfile.goalWeight
    ? `${currentProfile.goalWeight} kg`
    : "-- kg";

  tmbText.textContent = currentProfile.tmb
    ? `${currentProfile.tmb} kcal`
    : "--";

  currentWeight.textContent = currentProfile.currentWeight
    ? `${currentProfile.currentWeight} kg`
    : "-- kg";
}

addWaterBtn.addEventListener("click", async () => {
  if (!activeProfile) {
    alert("Selecione Gabriel ou Raissa.");
    return;
  }

  await addDoc(collection(db, "entries"), {
    profile: activeProfile,
    type: "water",
    title: "Água",
    amount: Number(waterAmount.value),
    date: today(),
    createdAt: serverTimestamp()
  });

  waterAmount.value = "";

});
if (addWeightBtn) {
  addWeightBtn.addEventListener("click", async () => {
    if (!activeProfile) {
      alert("Selecione Gabriel ou Raissa.");
      return;
    }

    const newWeight = Number(weightInput.value);

    await addDoc(collection(db, "entries"), {
      profile: activeProfile,
      type: "weight",
      title: "Peso",
      weight: newWeight,
      date: today(),
      createdAt: serverTimestamp()
    });

    await setDoc(
      doc(db, "profiles", activeProfile),
      {
        currentWeight: newWeight,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    if (currentProfile) {
      currentProfile.currentWeight = newWeight;
      updateProfileDashboard();
    }

    weightInput.value = "";
  });
}

if (addWorkoutBtn) {
  addWorkoutBtn.addEventListener("click", async () => {
    if (!activeProfile) {
      alert("Selecione Gabriel ou Raissa.");
      return;
    }

    await addDoc(collection(db, "entries"), {
      profile: activeProfile,
      type: "workout",
      title: workoutType.value,
      minutes: Number(workoutMinutes.value),
      date: today(),
      createdAt: serverTimestamp()
    });

    workoutMinutes.value = "";
  });
}

function listenEntries() {
  if (!activeProfile) return;

  const q = query(
    collection(db, "entries"),
    where("profile", "==", activeProfile),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    const entries = [];

    snapshot.forEach((doc) => {
      entries.push({
        id: doc.id,
        ...doc.data()
      });
    });

    render(entries);
  });
}

function render(entries) {
  const todayEntries = entries.filter((item) => item.date === today());

  const calories = todayEntries
    .filter((item) => item.type === "food")
    .reduce((sum, item) => sum + Number(item.calories || 0), 0);

  const water = todayEntries
    .filter((item) => item.type === "water")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const workouts = todayEntries.filter((item) => item.type === "workout");

  const lastWeight = entries.find((item) => item.type === "weight");

  totalCalories.textContent = `${calories} kcal`;
  totalWater.textContent = `${water} ml`;
  totalWorkouts.textContent = workouts.length;

  if (lastWeight) {
    currentWeight.textContent = `${lastWeight.weight} kg`;
  } else if (currentProfile?.currentWeight) {
    currentWeight.textContent = `${currentProfile.currentWeight} kg`;
  }

  if (!historyList) return;

    historyList.innerHTML = "";

  entries.forEach((item) => {
    const div = document.createElement("div");
    div.className = "history-item";

    div.innerHTML = `
      <div>
        <strong>${formatTitle(item)}</strong><br>
        <small>${item.date}</small>
      </div>
      <small>${formatValue(item)}</small>
    `;

    historyList.appendChild(div);
  });
}

function formatTitle(item) {
  if (item.type === "food") return `Alimento: ${item.title}`;
  if (item.type === "water") return "Água";
  if (item.type === "weight") return "Peso";
  if (item.type === "workout") return `Treino: ${item.title}`;
  return item.title;
}

function formatValue(item) {
  if (item.type === "food") return `${item.calories} kcal`;
  if (item.type === "water") return `${item.amount} ml`;
  if (item.type === "weight") return `${item.weight} kg`;
  if (item.type === "workout") return `${item.minutes} min`;
  return "";
}
