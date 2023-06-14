<template>
  <div v-if="pageError" class="tt-error-page">
    <div class="tt-error-page__status">
      {{ pageError.status }}
    </div>
    <div class="tt-error-page__message">
      {{ pageError.message }}
    </div>
    <div class="tt-error-page__actions">
      <v-btn color="blue" to="/" variant="outlined">
        Go to Home Page
      </v-btn>
    </div>
  </div>
  <div v-else-if="isReady" class="tt-wrapper">
    <v-theme-provider
      v-if="isEditing"
      :style="{ '--width': codeWidth + 'px' }"
      class="tt-wrapper__col tt-wrapper__col--code tt-code"
      theme="dark"
      with-background
    >
      <div class="tt-code__body">
        <CodeEditor
          v-model="codeImmediate"
        />
      </div>
    </v-theme-provider>
    <div
      :style="{ '--left': codeWidth + 'px' }"
      class="tt-wrapper__separator"
      @mousedown="dragstart('code', $event)"
    />
    <div class="tt-wrapper__col tt-wrapper__col--calendar">
      <MainCalendar>
        <template #actions="{ title }">
          <router-link v-if="!isEditing" to="/" class="tt-intro__logo-small">
            <v-icon icon="$mdiCodeNotEqualVariant" />
          </router-link>
          <div class="tt-calendar__title">
            {{ title }}
          </div>
          <template v-if="isEditing">
            <v-btn
              :variant="changesCount ? 'elevated' : 'outlined'"
              color="primary"
              @click="saveChanges"
            >
              <v-icon icon="$mdiContentSave" class="mr-1" />
              {{ changesCount === 1 ? 'Save (1 change)':  changesCount ? `Save (${changesCount} changes)` : 'Save' }}
            </v-btn>
            <v-btn variant="text" @click="discardChanges">
              Discard
            </v-btn>
          </template>
          <template v-else>
            <v-btn color="primary" variant="outlined" @click="editFiddle(token)">
              <v-icon icon="$mdiPlaylistEdit" class="mr-1" />
              Edit
            </v-btn>
            <v-btn color="primary" variant="outlined" @click="shareIsOpened = true">
              <v-icon icon="$mdiShareVariant" class="mr-1" />
              Share
            </v-btn>
            <v-btn color="primary" variant="outlined" @click="forkFiddle">
              <v-icon icon="$mdiSourceFork" class="mr-1" />
              Fork
            </v-btn>
          </template>
        </template>
      </MainCalendar>
    </div>
    <v-dialog
      v-model="tokenRequest.isOpened"
      max-width="500"
    >
      <v-card>
        <v-card-title>
          Enter Access Token
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="tokenRequest.tokenInput"
            :error-messages="tokenRequest.errorMessage"
            label="Token"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="forkFiddle">Fork Fiddle</v-btn>
          <v-spacer />
          <v-btn variant="text" @click="tokenRequest.isOpened = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!tokenRequest.tokenInput" @click="editFiddle(tokenRequest.tokenInput)">
            Edit Fiddle
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      :model-value="!!saveError"
      max-width="500"
      @update:model-value="() => { saveError = null }"
    >
      <v-alert type="error">
        {{ saveError?.message }}
      </v-alert>
    </v-dialog>
    <v-dialog
      v-model="shareIsOpened"
      max-width="500"
    >
      <v-card>
        <v-card-title>Share Fiddle</v-card-title>
        <v-card-text>
          <v-text-field
            :model-value="origin + '/' + id"
            label="Copy Read-Only Link"
            readonly
            prepend-icon="$mdiLink"
          />
          <v-text-field
            :model-value="origin + '/' + id + '/' + currentVersion"
            label="Copy Current Version Link (it will never change)"
            readonly
            prepend-icon="$mdiLink"
          />
          <v-text-field
            v-if="token"
            :model-value="origin + '/' + id + '?token=' + token"
            label="Copy Full Access Link (anyone with the link will be able to edit it)"
            readonly
            prepend-icon="$mdiLinkLock"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLayoutResize } from '@/composables/layoutResize'
import { useSyncRefsWithDebounce } from '@/composables/syncRefsWithDebounce'
import CodeEditor from '@/components/codeEditor/CodeEditor.vue'
import MainCalendar from '@/components/mainCalendar/MainCalendar.vue'
import { useCalendarStore } from '@/stores/calendar'
import { appClient } from '@/api/clients'
import { ApiException, CheckFiddleDto, CreateFiddleDto, UpdateFiddleDto } from '@/api/api'
import { defaultCode } from '@/constants/defaultCode'
import { useRecentFiddles } from '@/composables/recentFiddles'

const calendarStore = useCalendarStore()
const code = toRef(calendarStore, 'code')
const currentVersion = ref(0)
const codeImmediate = ref('')
useSyncRefsWithDebounce(codeImmediate, code, 500)

const { codeWidth, dragstart } = useLayoutResize()
const route = useRoute()
const router = useRouter()
const isEditing = ref(false)
const changesCount = ref(0)
const id = computed(() => (route.params.id || '').toString())
const version = computed(() => (route.params.version || '').toString())
const token = computed(() => (route.query.token || '').toString())
const pageError = ref<null | { status: number; message: string }>(null)
const saveError = ref<null | { status: number; message: string }>(null)
const isReady = ref(false)
const tokenRequest = ref({
  isOpened: false,
  tokenInput: '',
  errorMessage: ''
})
const shareIsOpened = ref(false)
const origin = computed(() => document.location.origin)
const { addRecentFiddle } = useRecentFiddles()

watch(code, () => {
  changesCount.value++
})

watch(isEditing, () => {
  changesCount.value = 0
})

const loadFiddle = async () => {
  try {
    if (!id.value) {
      code.value = defaultCode
      isReady.value = true
      isEditing.value = true
    } else {
      const data = await (version.value ? appClient.getFiddleByIdAndVersion(id.value, version.value) : appClient.getLastFiddleById(id.value))
      code.value = data.code
      currentVersion.value = data.version
      isReady.value = true
    }
  } catch (error) {
    if (error instanceof ApiException) {
      pageError.value = {
        status: error.status,
        message: (error.response as unknown as any)?.message || error.message
      }
    } else if (error instanceof Error) {
      pageError.value = {
        status: 500,
        message: error.message
      }
    }
  }
}

const editFiddle = async (innerToken: string) => {
  if (!innerToken) {
    tokenRequest.value = {
      isOpened: true,
      tokenInput: '',
      errorMessage: ''
    }
    return
  } else {
    try {
      const data = await appClient.checkToken(id.value, CheckFiddleDto.fromJS({ token: innerToken }))
      if (data.token !== token.value) {
        router.replace({
          query: { token: data.token }
        })
      }
      tokenRequest.value = {
        isOpened: false,
        tokenInput: '',
        errorMessage: ''
      }
      isEditing.value = true
    } catch (_) {
      tokenRequest.value = {
        isOpened: true,
        tokenInput: innerToken,
        errorMessage: 'Token is invalid'
      }
    }
  }
}

const saveChanges = async () => {
  saveError.value = null
  try {
    if (!id.value) {
      const data = await appClient.createFiddle(CreateFiddleDto.fromJS({ code: code.value }))
      router.replace({
        name: 'main',
        params: {
          id: data.id
        },
        query: {
          token: data.token
        }
      })
      currentVersion.value = data.version
      isEditing.value = false
      addRecentFiddle(data.id, data.token)
    } else {
      const data = await appClient.updateFiddle(id.value, UpdateFiddleDto.fromJS({ token: token.value, code: code.value }))
      if (version.value && !isNaN(Number(version.value)) && Number(version.value) !== data.version) {
        router.replace({
          name: 'main',
          params: {
            id: id.value,
            version: data.version
          },
          query: {
            token: token.value
          }
        })
      }
      currentVersion.value = data.version
      isEditing.value = false
      addRecentFiddle(data.id, data.token)
    }
  } catch (error) {
    if (error instanceof ApiException) {
      saveError.value = {
        status: error.status,
        message: (error.response as unknown as any)?.message || error.message
      }
    } else if (error instanceof Error) {
      saveError.value = {
        status: 500,
        message: error.message
      }
    }
  }
}

const discardChanges = async () => {
  if (!id.value) {
    router.push('/')
  } else {
    isEditing.value = false
    await loadFiddle()
  }
}

const forkFiddle = async () => {
  if (!id.value) {
    return
  }
  const data = await (version.value ? appClient.forkFiddleVersion(id.value, version.value) : appClient.forkFiddle(id.value))
  code.value = data.code
  currentVersion.value = data.version
  tokenRequest.value = {
    isOpened: false,
    tokenInput: '',
    errorMessage: ''
  }
  isEditing.value = true
  router.push({
    name: 'main',
    params: {
      id: data.id
    },
    query: {
      token: data.token
    }
  })
}

onMounted(loadFiddle)
onBeforeUnmount(() => {
  code.value = ''
})
</script>
