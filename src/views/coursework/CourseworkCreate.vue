<template>
  <div class="coursework-create-view">
    <div class="panel-title">
      <div class="title">
        <Tag>CREATE COURSEWORK</Tag>
      </div>
    </div>
    <div class="panel-content">
      <form @submit.prevent="confirm" @keydown.enter="lastPassFix">
        <template v-for="(field, id) in fields">
          <DateTime v-if="field.type === 'datetime'" :key="id" v-bind="field" :model.sync="field.model" />
          <Input v-else :key="id" v-bind="field" v-model="field.model" />
        </template>
      </form>
      <div class="control">
        <Button v-for="(button) in control" :key="button.name" v-bind="button" />
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import Input from '@/components/Input.component.vue';
import DateTime from '@/components/DateTime.component.vue';
import Button from '@/components/Button.component.vue';
import Tag from '@/components/Tag.component.vue';

export default {
  components: { Input, DateTime, Button, Tag },
  data() {
    return {
      control: {
        confirm: { name: 'create-coursework', icon: 'check', type: 'dialog', text: 'Create coursework', click: () => this.confirm() },
      },
      fields: {
        title: { id: 'cwe-title', label: 'Title', type: 'text', placeholder: 'coursework title' },
        module: { id: 'cwe-module', label: 'Module', type: 'text', placeholder: 'coursework module' },
        description: { id: 'cwe-description', label: 'Description', type: 'textarea', placeholder: 'coursework description' },
        expectedDate: { id: 'cwe-expected', label: 'Expected Date', type: 'datetime', minDate: Date.now() + (60 * 1000), model: Date.now() + (60 * 1000) },
      },
    };
  },
  computed: {
    returnHref() {
      return { name: 'coursework', query: { tab: 'progress' } };
    },
  },
  methods: {
    /**
     * Cleans the active form of errors
     */
    clean() {
      _.forEach(this.fields, (field, key) => {
        this.$delete(this.fields[key], 'error');
      });
    },
    /**
     * Prepares the data of the input fields to be sent to the server
     */
    prepareInputData() {
      // Reduce the input fields to { 'fieldName': 'fieldValue' } to prepare it
      const data = _.reduce(this.fields, (acc, val, key) => {
        acc[key] = val.model;
        return acc;
      }, {});
      return data;
    },
    async confirm() {
      if (this.control.confirm.pending) return;
      this.clean();
      this.$set(this.control.confirm, 'pending', true);
      const data = this.prepareInputData();
      const response = await this.$store.dispatch('post', { url: '/coursework/create', data: { ...data } });
      if (response.error) {
        _.forEach(response.error, (error, field) => {
          if (!Array.isArray(error)) return;
          this.$set(this.fields[field], 'error', error[0]);
        });
      } else {
        this.$store.commit('addCoursework', { section: 'my', coursework: response.result[0] });
        this.$router.push(this.returnHref);
      }
      this.$set(this.control.confirm, 'pending', false);
    },
    /**
     * Blocks the error thrown by LastPass when enter is pressed while form is in focus
     *
     * @param {Object} ev         - The event data holder
     */
    lastPassFix(ev) {
      ev.stopImmediatePropagation();
    },
  },
};
</script>

<style lang="scss">
@import '~@/scss/_mixins';

.coursework-create-view {
  .panel-content {
    background-color: rgba(darken($color-cyan-d2, 4%), .6);
    border-radius: 4px;
    box-sizing: border-box;
    padding: 10px 20px 20px 20px;

    form {
      flex: 1;
      display: flex;
      flex-direction: column;
      .input-wrapper, .datetime-wrapper {
        margin: 10px 0;
      }
    }
    .control {
      display: flex;
      justify-content: center;
      .button {
        margin: 0 4px;
      }
    }
  }
}
</style>
