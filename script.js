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

const gabrielBtn = document.getElementById("gabrielBtn");
const raissaBtn = document.getElementById("raissaBtn");

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

logoutBtn.addEventListener(() => {
  localStorage.removeItem(
    "projectDietLogged"
  );

  location.reload();
});

gabrielBtn.addEventListener("click", async () => {
  activeProfile = "Gabriel";

  localStorage.setItem(
    "activeProfile",
    activeProfile
  );

  updateProfileLabel();

  await loadProfile();
  listenEntries();
});

raissaBtn.addEventListener("click", async () => {
  activeProfile = "Raissa";

  localStorage.setItem(
    "activeProfile",
    activeProfile
  );

  updateProfileLabel();

  await loadProfile();
  listenEntries();
});

function updateProfileLabel() {
  activeProfileText.textContent =
    activeProfile || "Nenhum";
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

addFoodBtn.addEventListener("click", async () => {
  if (!activeProfile) {
    alert("Selecione Gabriel ou Raissa.");
    return;
  }

  if (!foodName.value || !foodCalories.value) {
    alert("Informe alimento e calorias.");
    return;
  }

 await addDoc(collection(db, "entries"), {
  profile: activeProfile,
  type: "food",
  title: foodName.value,
  calories: Number(foodCalories.value),
  date: today(),
  createdAt: serverTimestamp()
});
  foodName.value = "";
  foodCalories.value = "";
});

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
