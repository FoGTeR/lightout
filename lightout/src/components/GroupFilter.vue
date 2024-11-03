<template>
  <div class="main-container">
    <div class="header">
      <h1>Графік ймовірних відключень</h1>
      <p>Вам залишається вказати номер групи або місто нижче. Пам’ятайте, що графік не гарантує 100% відключення.</p>
    </div>

    <div class="main-content">
      <div class="address-form-container">
        <div class="address-form">
          <div>
            <label>Введіть номер групи/черги</label>
            <input v-model="groupNumber" @input="checkAndFetchSchedule" type="text" placeholder="Наприклад, 3" />
          </div>
        </div>
      </div>
      <label>Або</label>
      <div class="address-form-container">
        <div class="address-form">
          <div>
            <label>Введіть місто</label>
            <input v-model="city" @input="checkAndFetchSchedule" type="text" placeholder="Наприклад, Київ" />
          </div>
        </div>
      </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="schedule">
        <p v-if="group.length">Група: {{ group }}</p>

        <table>
          <thead>
            <tr>
              <th></th>
              <th v-for="hour in 24" :key="hour">{{ String(hour).padStart(2, "0") }}:00</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(day, index) in ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота', 'Неділя']" :key="index">
              <td :class="{ 'highlight-day': index === currentDayIndex }">{{ day }}</td>
              <td v-for="hour in 24" :key="hour" :class="{ 'highlight-cell': index === currentDayIndex }" @click="toggleLight(index, hour - 1)" :style="{ cursor: isEditing ? 'pointer' : 'default' }">
                <template v-if="schedule[index][hour - 1]">
                  <img v-if="schedule[index][hour - 1] === 'Вимкнення'" src="../../src/assets/icons/flashlight.png" alt="Вимкнення" class="light-out-icon" />
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
        <a href="/import"><button>Імпорт з Excel/</button></a>
        <button @click="toggleEditMode">{{ isEditing ? "Скасувати" : "Редагувати" }}</button>
        <button v-if="isEditing" @click="saveSchedule">Зберегти</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { scheduleFilter } from "@/assets/js/useScheduleFilter";
import { apiServiceFilter } from "@/assets/js/api";

const { schedule, currentDayIndex, group, groupNumber, city, errorMessage, isEditing, toggleEditMode, toggleLight, saveSchedule, checkAndFetchSchedule } = scheduleFilter(apiServiceFilter);
</script>
