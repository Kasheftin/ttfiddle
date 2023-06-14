<template>
  <div class="tt-calendar__container">
    <div class="tt-calendar__head">
      <slot name="actions" :title="calendarStore.title" />
      <v-spacer />
      <v-btn icon="$prev" size="x-small" @click="calendarStore.toggleDate(-1)" />
      <div class="tt-calendar__date-range">
        {{ calendarStore.weekLabel }}
      </div>
      <v-btn icon="$next" size="x-small" @click="calendarStore.toggleDate(+1)" />
    </div>
    <div class="tt-calendar__body">
      <ScrollableGrid
        :head-size="60"
        :side-size="100"
        :side-height="calendarStore.sideHeight"
        :body-width="calendarStore.bodyWidth"
        fill-height
        fill-width
        drag-scroll-enabled
      >
        <template #head>
          <div
            :style="{
              '--width': calendarStore.bodyWidth + 'px'
            }"
            class="tt-calendar-head"
          >
            <div
              v-for="date, dateIndex in calendarStore.dates"
              :key="date.key"
              :style="{
                '--width': calendarStore.cellWidth * (calendarStore.columnsByDates[date.key]?.length || 1) + 'px'
              }"
              :class="{
                'tt-calendar-colgroup--light': !(dateIndex % 2)
              }"
              class="tt-calendar-colgroup"
            >
              <div class="tt-calendar-colgroup__label">
                {{ date.value }}
              </div>
              <div class="tt-calendar-colgroup__cols">
                <div
                  v-for="column in calendarStore.columnsByDates[date.key]"
                  :key="column.id"
                  :style="{
                    '--width': calendarStore.cellWidth + 'px'
                  }"
                  class="tt-calendar-col"
                >
                  <div class="tt-calendar-col__label">
                    {{ column.name }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <template #side>
          <div
            class="tt-calendar-side"
          >
            <div
              v-for="timeLabel in calendarStore.timeLabels"
              :key="timeLabel.key"
              :style="{
                '--height': calendarStore.cellHeight + 'px'
              }"
              class="tt-calendar-row"
            >
              <div
                :class="{
                  'tt-calendar-row__time-label--hour': !(timeLabel.key % 60)
                }"
                class="tt-calendar-row__time-label"
              >
                {{ timeLabel.value }}
              </div>
            </div>
          </div>
        </template>
        <template #body>
          <div
            :style="{
              '--width': calendarStore.bodyWidth + 'px'
            }"
            class="tt-calendar-body"
          >
            <div
              v-for="timeLabel in calendarStore.timeLabels"
              :key="timeLabel.key"
              :style="{
                '--height': calendarStore.cellHeight + 'px'
              }"
              :class="{
                'tt-calendar-row--hour-bordered': !(timeLabel.key % 60)
              }"
              class="tt-calendar-row tt-calendar-row--bordered"
            />
            <div class="tt-calendar-body__columns tt-calendar-body__columns--bg">
              <div
                v-for="date, dateIndex in calendarStore.dates"
                :key="date.key"
                :style="{
                  '--width': calendarStore.cellWidth * (calendarStore.columnsByDates[date.key]?.length || 1) + 'px'
                }"
                :class="{
                  'tt-calendar-colgroup--light': !(dateIndex % 2)
                }"
                class="tt-calendar-colgroup"
              />
            </div>
            <div class="tt-calendar-body__columns">
              <div
                v-for="date in calendarStore.dates"
                :key="date.key"
                :style="{
                  '--width': calendarStore.cellWidth * (calendarStore.columnsByDates[date.key]?.length || 1) + 'px'
                }"
                class="tt-calendar-colgroup"
              >
                <div class="tt-calendar-colgroup__timeblock-cols">
                  <div
                    v-for="column in calendarStore.columnsByDates[date.key]"
                    :key="column.id"
                    :style="{
                      '--width': calendarStore.cellWidth + 'px'
                    }"
                    class="tt-calendar-col"
                  >
                    <div
                      v-for="timeblock in calendarStore.timeblocksByDateAndColumns[date.key + '|' + column.id]"
                      :key="timeblock.id"
                      :style="timeblock.position"
                      class="tt-calendar-timeblock"
                    >
                      <div class="tt-calendar-timeblock__rect" />
                      <div
                        v-for="content, index in timeblock.content"
                        :key="content"
                        :class="{
                          'tt-calendar-timeblock__content--main': !index
                        }"
                        class="tt-calendar-timeblock__content"
                      >
                        {{ content }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </ScrollableGrid>
    </div>
  </div>
</template>

<script setup lang="ts">
import ScrollableGrid from '@/components/scrollableGrid/ScrollableGrid.vue'
import { useCalendarStore } from '@/stores/calendar'

const calendarStore = useCalendarStore()
</script>
