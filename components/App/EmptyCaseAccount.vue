<template>
  <div class="relative max-w-120 mx-auto flex flex-col flex-1">
    <div
        ref="titleContainer"
        :class="loadLoginButton ? 'mt-10 opacity-20' : 'my-auto opacity-100'"
        class="transition-opacity duration-800 ease-out"
    >
      <div ref="title" :class="loadLoginButton ? 'text-xl' : 'text-3xl'">
        {{ $t('components.app.emptyCase.title') }}
      </div>
    </div>

    <transition name="fade" mode="out-in" enter-active-class="animate__animated animate__fadeInUp">
      <div class="space-y-4 my-auto pt-8" style="--animate-duration: 0.8s" v-if="loadLoginButton">
        <div class="flex flex-col gap-2">
          <img src="/images/ui/logos/instagram.png" alt="" class="size-8"/>

          <div>
            <div class="text-xl md:text-2xl font-semibold">
              {{ $t('components.app.emptyCase.connectTitle') }}
            </div>
            <div class="text-subtle text-xs">
              <i18n-t keypath="components.app.emptyCase.connectDescription">
                <template #bold>
                  <strong>{{ $t('components.app.emptyCase.connectDescriptionBold') }}</strong>
                </template>
              </i18n-t>
            </div>
          </div>
        </div>
        <div class="space-y-4 w-full">
          <div class="my-5">
            <label>
              <span class="block">{{ $t('components.app.emptyCase.usernameLabel') }}</span>

              <span class="join border border-base-300 rounded-lg w-full mt-2">
								<span class="join-item flex pl-2">
									<i class="fa fa-at my-auto"/>
								</span>
								<div class="join-item relative w-full">
									<input
                      :value="modelValue"
                      @input="onUsernameInput"
                      class="input border-none w-full"
                      :placeholder="$t('components.app.emptyCase.usernamePlaceholder')"
                      type="text"
                      autocapitalize="off"
                      autocorrect="off"
                      autocomplete="off"
                      spellcheck="false"
                      inputmode="url"
                      @keydown.space.prevent
                  />
									<LoadingElement
                      v-if="modelValue"
                      :isLoading="userInfoLoading"
                      class="absolute top-1/2 right-2 -translate-y-1/2"
                      size="16"
                  >
										<a href="javascript:void(0);" @click="fetchUserInfo">
											<i class="fa fa-magnifying-glass hover:scale-105"/>
										</a>
									</LoadingElement>
								</div>
							</span>
            </label>
          </div>
          <div
              v-if="userInfo.username && modelValue"
              class="flex items-center gap-4 bg-base-200 p-2 rounded-lg mt-5 h-15"
          >
            <AccountProfile
                :isLoading="userInfoLoading"
                :profilePicture="$proxyUrl(userInfo.profile_picture, true)"
                :name="userInfo.name"
                :username="userInfo.username"
                :followersCount="userInfo.followers_count"
                :followingCount="userInfo.following_count"
            />
          </div>

          <div v-if="hasFetchedUserInfo && modelValue" v-auto-animate>
            <RefreshPermissionButton
                v-if="isInstagramLogin"
                purpose="login"
                iconClass="fa-brands fa-instagram fa-lg"
                :title="$t('components.app.emptyCase.connectWithInstagram')"
                titleClass=""
                class="w-full btn-transition bg-blue-500 hover:bg-blue-600 text-white font-medium py-5 rounded-lg transition-colors duration-200"
                :beforeOpenTabFunc="sendInformation"
            />
            <RefreshPermissionButton
                v-else
                purpose="login"
                :title="$t('components.app.emptyCase.connectWithMetaButton')"
                titleClass=""
                class="w-full btn-transition bg-blue-500 hover:bg-blue-600 text-white font-medium py-5 rounded-lg transition-colors duration-200"
                :platform="PLATFORMS.FACEBOOK"
                :beforeOpenTabFunc="sendInformation"
            >
              <template #icon>
                <i class="fa-brands fa-meta"/>
              </template>
            </RefreshPermissionButton>
            <div class="text-center">
              <a
                  href="javascript:void(0);"
                  class="link link-secondary text-sm"
                  @click="isInstagramLogin = !isInstagramLogin"
              >
								<span v-if="isInstagramLogin">
									<i class="fa-brands fa-facebook"></i>
									{{ $t('components.app.emptyCase.switchToFacebook') }}
								</span>
                <span v-else>
									<i class="fa-brands fa-instagram"></i>
									{{ $t('components.app.emptyCase.switchToInstagram') }}</span
                >
              </a>
            </div>
          </div>

          <div class="space-y-4 mt-24 mb-2 max-w-xl" ref="instagramConnectGuide">
            <MetaProviderNotice/>

            <div v-if="$t('components.app.emptyCase.instagramConnectGuideLink')" class="mt-8">
              <a
                  :href="$t('components.app.emptyCase.instagramConnectGuideLink')"
                  target="_blank"
                  class="link link-secondary inline-flex items-center"
              >
                <i18n-t keypath="components.app.emptyCase.instagramConnectGuide" tag="u"></i18n-t>
                <i class="fa fa-external-link link-icon ml-1"/>
              </a>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import {gsap} from 'gsap'
import {Flip} from 'gsap/Flip'
import RefreshPermissionButton from '~/components/GlobalComponents/RefreshPermissionButton.vue'
import MetaProviderNotice from '~/components/GlobalComponents/MetaProviderNotice.vue'
import AccountProfile from '~/components/GlobalComponents/AccountProfile.vue'
import LoadingElement from '~/components/GlobalComponents/LoadingElement.vue'
import {PLATFORMS} from '~/models/Social.ts'
import apiList from '~/apis/ApiList.js'
import pkg from 'lodash'

const {debounce} = pkg

gsap.registerPlugin(Flip)

export default {
  components: {RefreshPermissionButton, MetaProviderNotice, AccountProfile, LoadingElement},
  props: {
    modelValue: {type: String, default: ''},
    sendInformation: {type: Function, required: true},
  },
  emits: ['update:modelValue'],
  data() {
    return {
      PLATFORMS,
      loadLoginButton: false,
      isInstagramLogin: true,
      userInfo: {},
      userInfoLoading: false,
      hasFetchedUserInfo: false,
    }
  },
  mounted() {
    this.animate()
  },
  methods: {
    onUsernameInput(event) {
      this.$emit('update:modelValue', event.target.value)
      this.debouncedFetchUserInfo()
    },
    fetchUserInfo() {
      if (!this.modelValue) {
        this.userInfo = {}
        return
      }
      this.userInfoLoading = true
      this.$requestAdapter
          .get(apiList.chat.userInfo, {
            query: {username: this.modelValue},
            silentErrors: true,
          })
          .then((response) => {
            consoleLog('apiList.chat.userInfo', response)
            this.userInfo = response.data
          })
          .catch(() => {
            this.userInfo = {}
          })
          .finally(() => {
            this.userInfoLoading = false
            this.hasFetchedUserInfo = true
          })
    },
    debouncedFetchUserInfo: debounce(function () {
      this.fetchUserInfo()
    }, 1500),
    animate() {
      this.loadLoginButton = false

      setTimeout(() => {
        const state = Flip.getState(this.$refs.title, {props: 'fontSize'})

        this.loadLoginButton = true

        this.$nextTick(() => {
          Flip.from(state, {
            duration: 0.8,
            ease: 'power2.out',
            props: 'fontSize',
          })
        })
      }, 1500)

      if (this.$refs?.instagramConnectGuide) {
        gsap.from(this.$refs.instagramConnectGuide, {
          opacity: 0,
          y: 20,
          duration: 0.8,
          delay: 0.5,
          ease: 'power2.out',
        })
      }
    },
  },
}
</script>
