<template>
  <div class="main-container">
    <div class="header">
      <h1>Графік ймовірних відключень</h1>
      <p>Вам залишається вказати свою адресу нижче. Пам’ятайте, що графік не гарантує 100% відключення.</p>
    </div>

    <div class="main-content">
      <div class="address-form-container">
        <div class="address-form">
          <div>
            <label>Оберіть ваш регіон</label>
            <select v-model="selectedRegion" @change="fetchCities">
              <option v-for="region in regions" :key="region">{{ region }}</option>
            </select>
          </div>
          <div>
            <label>Оберіть місто</label>
            <select v-model="selectedCity" @change="fetchStreets" :disabled="!cities.length">
              <option v-for="city in cities" :key="city">{{ city }}</option>
            </select>
          </div>
          <div>
            <label>Оберіть вулицю, бульвар, або проспект</label>
            <select v-model="selectedStreet" @change="checkAndFetchSchedule" :disabled="!streets.length">
              <option v-for="street in streets" :key="street">{{ street }}</option>
            </select>
          </div>
          <div>
            <label>Введіть номер будинку</label>
            <input v-model="houseNumber" @input="checkAndFetchSchedule" type="text" />
          </div>
        </div>
      </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div class="schedule">
        <p v-if="group">Група: {{ group }}</p>
        <table>
          <thead>
            <tr>
              <th></th>
              <th v-for="hour in 24" :key="hour">{{ String(hour).padStart(2, "0") }}:00</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(day, index) in daysOfWeek" :key="index">
              <td :class="{ 'highlight-day': index === currentDayIndex }">{{ day }}</td>
              <td v-for="hour in 24" :key="hour" :class="{ 'highlight-cell': index === currentDayIndex }">
                <template v-if="schedule[index][hour - 1]">
                  <img v-if="schedule[index][hour - 1] === 'Вимкнення'" src="@/assets/icons/flashlight.png" alt="Вимкнення" class="light-out-icon" />
                  <span v-else>{{ schedule[index][hour - 1] }}</span>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="navigation-buttons">
        <a href="/"><button>Головна</button></a>
        <a href="/filter"><button>Фільтр по групі</button></a>
        <a href="/import"><button>Імпорт з Excel/JSON</button></a>
        <button @click="exportToJson">Експорт у JSON</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { schedule_ } from "@/assets/js/useSchedule";
import { apiService } from "@/assets/js/api";

const {
  regions,
  cities,
  streets,
  selectedRegion,
  selectedCity,
  selectedStreet,
  houseNumber,
  schedule,
  currentDayIndex,
  group,
  fetchCities,
  fetchStreets,
  errorMessage,
  checkAndFetchSchedule,
  exportToJson,
} = schedule_(apiService);

const daysOfWeek = ["Понеділок", "Вівторок", "Середа", "Четвер", "П’ятниця", "Субота", "Неділя"];
</script>
