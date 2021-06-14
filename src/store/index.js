import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';
import axios from 'axios';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: undefined,
    sidebar: false,
    windows: [],
    notifications: [],
    tooltip: null,
    coursework: {
      search: undefined,
      searchFilter: null,
      recent: [],
      profile: undefined,
      my: undefined,
    },
  },
  getters: {
    getSidebarVisibility: (state) => state.sidebar,
    getWindows: (state) => state.windows,
    getWindowsNum: (state) => state.windows.length,
    getNotifications: (state) => state.notifications,
    getTooltip: (state) => state.tooltip,
    getUser: (state) => state.user,
    //
    getSearchFilter: (state) => state.coursework.searchFilter,
    getAllCourseworks: (state) => (section) => state.coursework[section],
  },
  mutations: {
    openWindow(state, { name, title, component, props, type, dismissable }) { // eslint-disable-line
      state.windows.splice(0, 1, {
        window: {
          name,
          title,
          component,
          props,
          type: type || 'default',
          dismissable: dismissable || true,
        },
      });
    },
    closeWindow(state, id) {
      state.windows.splice(id || 0, 1);
    },
    showTooltip(state, tooltip) {
      Vue.set(state, 'tooltip', tooltip);
    },
    hideTooltip(state) {
      Vue.set(state, 'tooltip', null);
    },
    authenticate(state, user) {
      Vue.set(state, 'user', user);
    },
    deauthenticate(state) {
      Vue.set(state, 'user', null);
    },
    pushNotification(state, { text, icon = 'check', type, timeout }) {
      const id = _.uniqueId('notification');
      state.notifications.push({ id, icon, text, type });
      setTimeout(this.commit, (timeout || 5) * 1000, 'hideNotification');
    },
    hideNotification(state) {
      state.notifications.shift();
    },
    setSidebarVisibility(state, visibility) {
      Vue.set(state, 'sidebar', visibility);
    },
    //
    updateSearchFilter(state, filter) {
      Vue.set(state.coursework, 'searchFilter', filter);
    },
    clearAllCourseworks(state, section) {
      Vue.set(state.coursework, section, []);
    },
    addCoursework(state, { section, coursework }) {
      state.coursework[section].push(coursework);
    },
    setAllCourseworks(state, { section, courseworks }) {
      Vue.set(state.coursework, section, courseworks);
    },
  },
  actions: {
    async post({ commit }, { url, data }) {
      const response = await axios.post(url, data);
      if (response.data.error) {
        const { _system, _notification } = response.data.error;
        if (_system) {
          commit('pushNotification', { text: _system, icon: 'warning', type: 'alert' });
        }
        if (_notification) {
          commit('pushNotification', { text: _notification, icon: 'notice', type: 'warning' });
        }
      }
      return response.data || null;
    },
    async get({ commit }, { url, params }) {
      const response = await axios.get(url, { params });
      if (response.data.error) {
        const { _system, _notification } = response.data.error;
        if (_system) {
          commit('pushNotification', { text: _system, icon: 'warning', type: 'alert' });
        }
        if (_notification) {
          commit('pushNotification', { text: _notification, icon: 'notice', type: 'warning' });
        }
      }
      return response.data || null;
    },
    async deauthenticate({ commit }) {
      await axios.get('/user/deauthenticate');
      commit('deauthenticate');
      commit('pushNotification', { icon: 'check', text: 'You have been logged out' });
    },
    async getAllCourseworks({ commit }, { section = 'recent', participant, brief, search }) {
      let results;
      if (section === 'my') {
        // Load my own courseworks
        results = await axios.get('/coursework/list', { params: { brief } });
        if (brief) {
          // If loading for sidebar, don't store in vuex
          return results;
        }
      } else if (section === 'profile') {
        // Load courseworks for a specific user profile
        results = await axios.get('/coursework/list', { params: { participant } });
      } else {
        // Load all searched courseworks
        if (search) {
          commit('updateSearchFilter', search);
        }
        results = await axios.get('/coursework/list', { params: { ...search, search: true } });
      }
      if (results.data.error) {
        commit('pushNotification', { icon: 'warning', text: results.data.error._system });
      }
      commit('setAllCourseworks', { section, courseworks: results.data.result });
      return results;
    },
  },
  modules: {},
});
