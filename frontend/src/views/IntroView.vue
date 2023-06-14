<template>
  <div class="tt-intro__wrapper">
    <div class="tt-intro__container">
      <div class="tt-intro__col">
        <a href="/" class="tt-intro__logo">
          <v-icon icon="$mdiCodeNotEqualVariant" />
          TTFiddle.net
        </a>
        <div class="tt-intro-card">
          <a href="https://codeburst.io/weekly-schedule-editor-concept-8df79ab83305" class="tt-intro-card__title">
            Weekly schedule editor concept
          </a>
          <div class="tt-intro-card__image">
            <a href="https://codeburst.io/weekly-schedule-editor-concept-8df79ab83305">
              <v-img :src="pic1" />
            </a>
          </div>
          <div class="tt-intro-card__description">
            We are reviewing the core principles of building the time table schedule system.
          </div>
          <div class="tt-intro-card__actions">
            <a href="https://codeburst.io/weekly-schedule-editor-concept-8df79ab83305" class="tt-intro-card__action">
              Read more
            </a>
          </div>
        </div>
      </div>
      <div class="tt-intro__col">
        <div class="tt-intro-list">
          <div class="tt-intro-list__title">
            Your fiddles
          </div>
          <v-alert v-if="!recentFiddlesLoaded.length" type="info" variant="outlined">
            Fiddles Not Found
          </v-alert>
          <div v-else class="tt-intro-list__content">
            <div
              v-for="entry in recentFiddlesLoaded"
              :key="entry.id"
              class="tt-intro-entry"
            >
              <div class="tt-intro-entry__content">
                <div class="tt-intro-entry__title">
                  {{ entry.title }}
                </div>
                <div class="tt-intro-entry__updated">
                  {{ formatDateTime(entry.updatedAt) }}
                </div>
              </div>
              <v-btn
                :to="{ name: 'main', params: { id: entry.id }, query: { token: entry.token } }"
                icon="$mdiArrowRightBold"
              />
            </div>
          </div>
        </div>
        <div class="tt-intro-list">
          <v-btn block color="primary" size="large" to="/new">
            New Fiddle
          </v-btn>
        </div>
        <div class="tt-intro-list">
          <div class="tt-intro-list__title">
            Demos
          </div>
          <div class="tt-intro-list__content">
            <div
              v-for="entry in demos"
              :key="entry.id"
              class="tt-intro-entry"
            >
              <div class="tt-intro-entry__content">
                <div class="tt-intro-entry__title">
                  {{ entry.title }}
                </div>
              </div>
              <v-btn
                :to="{ name: 'main', params: { id: entry.id } }"
                icon="$mdiArrowRightBold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import pic1 from '@/assets/pic1.webp'
import { useRecentFiddles } from '@/composables/recentFiddles'
import { onMounted } from 'vue';

const demos = [{
  id: 'dance1', title: 'Sample Dance Studio TimeTable'
}, {
  id: 'asdasd', title: 'Artoteka Schedule'
}]

const { recentFiddlesLoaded, loadRecentFiddles } = useRecentFiddles()

onMounted(loadRecentFiddles)

const formatDateTime = (dt: number) => {
  return moment(dt * 1000).format('YYYY-MM-DD HH:mm')
}

</script>
