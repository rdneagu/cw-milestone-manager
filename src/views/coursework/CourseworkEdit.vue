<template>
  <div class="subpanel coursework-view coursework-edit">
    <div class="title">Edit Coursework</div>
    <div class="body">
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

export default {
  components: { Input, DateTime, Button },
  props: ['coursework'],
  data() {
    return {
      control: {
        cancel: { name: 'return-to-coursework', icon: 'previous', type: 'alert dialog', text: 'Return', click: () => this.$router.push(this.returnHref) },
        confirm: { name: 'confirm-edit', icon: 'check', type: 'dialog', text: 'Confirm', click: () => this.confirm() },
      },
      fields: {
        title: { id: 'cwe-title', label: 'Title', type: 'text', placeholder: 'coursework title', model: this.coursework.title },
        module: { id: 'cwe-module', label: 'Module', type: 'text', placeholder: 'coursework module', model: this.coursework.module },
        description: { id: 'cwe-description', label: 'Description', type: 'textarea', placeholder: 'coursework description', model: this.coursework.description },
        expectedDate: { id: 'cwe-expected', label: 'Expected Date', type: 'datetime', minDate: this.coursework.createdAt, model: this.coursework.expectedDate },
      },
    };
  },
  computed: {
    returnHref() {
      return { name: 'courseworkView', params: this.$route.params, query: this.$route.query };
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
      const response = await this.$store.dispatch('post', { url: '/coursework/edit', data: { coursework: this.coursework.id, ...data } });
      if (response.error) {
        _.forEach(response.error, (error, field) => {
          if (!Array.isArray(error)) return;
          this.$set(this.fields[field], 'error', error[0]);
        });
      } else {
        this.$emit('update:coursework', { ...this.coursework, ...response.result });
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

.coursework-edit {
  overflow: unset;
  .title {
    position: relative;
    padding-bottom: 10px;
    border-bottom: 1px solid $color-cyan;
    font-size: 30px;
    font-weight: 600;
    text-align: center;
  }
  .body {
    flex: 1;
    display: flex;
    flex-direction: column;

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
