<template>
  <div v-if="events.length > 0" class="w-full" :class="{ 'px-3': !isMobile }">
    <div :class="isMobile ? 'event-list-mobile' : 'event-list-desktop'">
      <template v-for="(event, index) in events" :key="index">
        <el-tooltip v-if="!isMobile" :content="event.message" placement="bottom">
          <div :class="['event-item', `event-item-${event.type}`, 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all px-2 py-1']">
            <span class="event-icon text-xs flex-shrink-0">{{ event.icon }}</span>
            <span class="event-text text-xs whitespace-normal">{{ event.message }}</span>
          </div>
        </el-tooltip>
        <div v-else :class="['event-item', `event-item-${event.type}`, 'px-1.5 py-0.5']">
          <span class="event-icon text-xs flex-shrink-0">{{ event.icon }}</span>
          <span class="event-text text-xs whitespace-normal">{{ event.message }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeEvent } from '@/composables/useGameEvents'
import { useMobile } from '@/composables/useMobile'

interface Props {
  events: TimeEvent[]
}

defineProps<Props>()

const { isMobile } = useMobile()
</script>

<style scoped>
.event-list-desktop {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 6px;
}

.event-list-mobile {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 4px;
}

.event-item {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  flex-wrap: wrap;
}

.event-item-commercial {
  border-color: rgba(59, 130, 246, 0.4);
}
.event-item-health {
  border-color: rgba(34, 197, 94, 0.4);
}
.event-item-money {
  border-color: rgba(234, 179, 8, 0.4);
}

.event-icon {
  width: 16px;
  text-align: center;
}
</style>

