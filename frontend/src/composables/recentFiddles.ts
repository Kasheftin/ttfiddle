import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { safeJsonParse } from '@/utils/safeJsonParse'
import { appClient } from '@/api/clients'
import { RecentFiddlesDto } from '@/api/api'
import { SUPPORTED_COMMANDS, calendarCodeToCommandList } from '@/utils/calendar'

interface RecentFiddle {
  id: string
  token: string
}

interface RecentFiddleLoaded extends RecentFiddle {
  title: string
  updatedAt: number
}

export const useRecentFiddles = () => {
  const recentFiddlesString = useLocalStorage('recentFiddles', '')

  const recentFiddles = computed(() => {
    return recentFiddlesString.value ? safeJsonParse(recentFiddlesString.value, []) as RecentFiddle[] : []
  })

  const addRecentFiddle = (id: string, token: string) => {
    const newEntries = [...recentFiddles.value]
    if (!newEntries.some(entry => entry.id === id)) {
      newEntries.unshift({ id, token })
      recentFiddlesString.value = JSON.stringify(newEntries)
    }
  }

  const recentFiddlesLoaded = ref<RecentFiddleLoaded[]>([])

  const loadRecentFiddles = async () => {
    if (!recentFiddles.value.length) {
      return
    }
    const recentByIds = recentFiddles.value.reduce((out: Record<string, string>, recentFiddle) => {
      out[recentFiddle.id] = recentFiddle.token
      return out
    }, {})
    const fiddles = await appClient.getRecentFiddlesByIds(RecentFiddlesDto.fromJS({ ids: Object.keys(recentByIds).join('|') }))
    recentFiddlesLoaded.value = fiddles.map((fiddle) => {
      const commandList = calendarCodeToCommandList(fiddle.code)
      const command = commandList.find(command => command.type === SUPPORTED_COMMANDS.SET_TITLE)
      return {
        id: fiddle.id,
        token: recentByIds[fiddle.id] || '',
        title: command?.inlineValue || '',
        updatedAt: fiddle.updatedAt
      }
    })
  }

  return { recentFiddlesLoaded, addRecentFiddle, loadRecentFiddles }
}
