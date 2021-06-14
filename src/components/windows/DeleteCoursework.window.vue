<template>
  <div class="delete-coursework-window-vue">
    <div class="header">
      <span class="action">
        You are about to delete
        <span class="lighten">{{ coursework.title }}</span>
      </span>
    </div>
    <div class="body">
      <div class="info">This action can be reversed during the next 60 minutes. If left in trash, the coursework will be removed and access to it will be revoked!</div>
      <form @submit.prevent="confirm" @keydown.enter="lastPassFix">
        <div class="instructions">Please enter the title of the coursework to confirm:</div>
        <Input v-for="(field, id) in fields" :key="id" v-bind="field" v-model="field.model" />
      </form>
    </div>
    <div class="footer">
      <Button v-bind="buttons.confirm">I understand, delete my coursework</Button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import util from '@/lib/general';

import Input from '@/components/Input.component.vue';
import Button from '@/components/Button.component.vue';

export default {
  components: { Input, Button },
  props: ['coursework'],
  data() {
    return {
      buttons: {
        confirm: { name: 'confirm-delete', icon: 'trash', type: 'alert dialog', click: () => this.confirm() },
      },
      fields: {
        title: { id: 'cwd-title', icon: 'clipboard', type: 'text', placeholder: this.coursework.title },
      },
    };
  },
  methods: {
    /**
     * Blocks the error thrown by LastPass when enter is pressed while form is in focus
     *
     * @param {Object} ev         - The event data holder
     */
    lastPassFix(ev) {
      ev.stopImmediatePropagation();
    },
    clean() {
      _.forEach(this.fields, (field, key) => {
        this.$delete(this.fields[key], 'error');
      });
    },
    async confirm() {
      if (this.buttons.confirm.pending) return;
      this.clean();
      this.$set(this.buttons.confirm, 'pending', true);
      const response = await this.$store.dispatch('post', { url: '/coursework/delete', data: { coursework: this.coursework.id, title: this.fields.title.model } });
      if (response.error) {
        _.forEach(response.error, (error, field) => {
          if (!Array.isArray(error)) return;
          this.$set(this.fields[field], 'error', error[0]);
        });
      } else {
        this.$set(this.coursework, 'deleted', util.datetime.fromUTC(response.result.deleted));
        this.$store.commit('closeWindow');
      }
      this.$set(this.buttons.confirm, 'pending', false);
    },
  },
};
</script>

<style lang="scss">
.delete-coursework-window-vue {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  .lighten {
    color: lighten($color-cyan-bg, 60%);
  }
  .header, .footer {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .body {
    display: flex;
    flex-direction: column;
    margin: 20px 0;
    font-size: 16px;
    .info { margin: 10px 0; }
  }
  .header {
    font-weight: 700;
    font-size: 20px;
    .action {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  }
  form {
    display: flex;
    flex-direction: column;
    margin-top: 40px;
    .instructions {
      align-self: center;
      margin-bottom: 8px;
      .highlight {
        margin: 0 10px;
        padding: 2px 4px;
        border: 1px solid darken($color-cyan, 10%);
        border-radius: 2px;
        color: darken($color-cyan, 10%);
      }
    }
    .input-wrapper { margin: 0 30px; }
  }
}
</style>
