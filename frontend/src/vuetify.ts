import { createVuetify } from 'vuetify'
import 'vuetify/styles'
// TODO: import only what is used to minimize the build
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import {
  mdiArrowRightBold,
  mdiCodeNotEqualVariant,
  mdiContentSave,
  mdiLink,
  mdiLinkLock,
  mdiPlaylistEdit,
  mdiRefresh,
  mdiShareVariant,
  mdiSourceFork,
} from '@mdi/js'

const icons = {
  mdiArrowRightBold,
  mdiCodeNotEqualVariant,
  mdiContentSave,
  mdiLink,
  mdiLinkLock,
  mdiPlaylistEdit,
  mdiRefresh,
  mdiShareVariant,
  mdiSourceFork,
}

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      ...icons
    },
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#0284c7'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#0284c7'
        }
      }
    }
  },
  defaults: {
    VTextField: {
      density: 'compact',
      variant: 'outlined'
    }
  }
})

export default vuetify
