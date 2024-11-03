<template>
  <div>
    <input type="file" @change="importData" accept=".xlsx, .xls, .json" />
    <select v-model="selectedDay">
      <option disabled value="">Виберіть день тижня</option>
      <option value="Понеділок">Понеділок</option>
      <option value="Вівторок">Вівторок</option>
      <option value="Середа">Середа</option>
      <option value="Четвер">Четвер</option>
      <option value="П'ятниця">П'ятниця</option>
      <option value="Субота">Субота</option>
      <option value="Неділя">Неділя</option>
    </select>
    <p v-if="error">{{ error }}</p>
    <p v-if="successMessage">{{ successMessage }}</p>
  </div>
  <div class="navigation-buttons">
    <a href="/"><button>Головна</button></a>
    <a href="/filter"><button>Фільтр по групі</button></a>
    <a href="/import"><button>Імпорт з Excel/JSON</button></a>
  </div>
</template>

<script setup lang="ts">
import { import_ } from "@/assets/js/import";
import { apiServiceImport } from "@/assets/js/api";

const { selectedDay, error, successMessage, importData } = import_(apiServiceImport);
</script>
