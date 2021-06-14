<template>
  <div class="subpanel milestone-edit">
    <template v-if="milestone">
      <div class="title">Edit milestone</div>
      <div v-if="milestone" class="body">
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
    </template>
    <div v-else class="not-found">
      <span class="message">Invalid milestone</span>
      <Button name="return-to-milestones" icon="previous" type="dialog" :href="returnHref">Return to milestones</Button>
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
      milestone: null,
      control: {
        cancel: { name: 'return-to-coursework', icon: 'previous', type: 'alert dialog', text: 'Return', click: () => this.$router.push(this.returnHref) },
        confirm: { name: 'confirm-edit', icon: 'check', type: 'dialog', text: 'Confirm', click: () => this.confirm() },
      },
      fields: {
        title: { id: 'm-title', label: 'Title', type: 'text', placeholder: 'milestone title' },
        description: { id: 'm-description', label: 'Description', type: 'textarea', placeholder: 'milestone description' },
        startedDate: { id: 'm-start', label: 'Started Date', type: 'datetime', minDate: this.coursework.startedDate, maxDate: this.coursework.expectedDate, model: Date.now() },
        expectedDate: { id: 'm-expected', label: 'Expected Date', type: 'datetime', minDate: this.coursework.startedDate, maxDate: this.coursework.expectedDate, model: Date.now() },
      },
    };
  },
  mounted() {
    const found = _.find(this.coursework.milestones, (m) => m.id.toString() === this.$route.params.milestoneId.toString());
    let title = `Milestone Manager - Coursework: ${this.coursework.title} - Edit Milestone:`;
    if (found) {
      title = `${title} ${found.title}`;
      this.$set(this, 'milestone', found);
      // Update model fields
      _.forEach(this.fields, (f, key) => {
        this.$set(this.fields[key], 'model', found[key]);
      });
    } else {
      title = `${title} Invalid milestone`;
    }
    document.title = title;
  },
  computed: {
    returnHref() {
      return { name: 'courseworkView', params: { coursework: this.coursework.id }, query: { ...this.$route.query, tab: 'milestones' } };
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
      const response = await this.$store.dispatch('post', { url: '/milestone/edit', data: { coursework: this.coursework.id, milestone: this.milestone.id, ...data } });
      if (response.error) {
        _.forEach(response.error, (error, field) => {
          if (!Array.isArray(error)) return;
          this.$set(this.fields[field], 'error', error[0]);
        });
      } else {
        const id = _.findIndex(this.coursework.milestones, (m) => m.id === this.milestone.id);
        this.coursework.milestones.splice(id, 1, { ...this.coursework.milestones[id], ...response.result });
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

.milestone-edit {
  flex-direction: column !important;
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
