<template>
  <div class="delete-participant-window-vue">
    <div class="header">
      <span class="action">
        You are editing the member
        <span class="lighten">{{ member.username }}</span>
      </span>
    </div>
    <div class="body">
      <div class="info">Member editing supports only changing the team of the member at the moment.</div>
      <div class="info">Entering the new team name in the field will transfer the member into that team.</div>
      <form @submit.prevent="confirm" @keydown.enter="lastPassFix">
        <Input v-for="(field, id) in fields" :key="id" v-bind="field" v-model="field.model" />
      </form>
    </div>
    <div class="footer">
      <Button v-bind="buttons.confirm">Confirm changes</Button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import Input from '@/components/Input.component.vue';
import Button from '@/components/Button.component.vue';

export default {
  components: { Input, Button },
  props: ['coursework', 'member'],
  data() {
    return {
      buttons: {
        confirm: { name: 'confirm-edit', icon: 'edit', type: 'dialog', click: () => this.confirm() },
      },
      fields: {
        team: { id: 'cwme-team', icon: 'group', type: 'text', placeholder: 'team name', model: this.member.team },
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
      const response = await this.$store.dispatch('post', { url: '/coursework/editParticipant', data: { coursework: this.coursework.id, member: this.member.id, team: this.fields.team.model } });
      if (response.error) {
        _.forEach(response.error, (error, field) => {
          if (!Array.isArray(error)) return;
          this.$set(this.fields[field], 'error', error[0]);
        });
      } else {
        const id = _.findIndex(this.coursework.participants, (p) => p.id === this.member.id);
        this.$set(this.coursework.participants[id], 'team', response.result.team);
        this.$store.commit('closeWindow');
      }
      this.$set(this.buttons.confirm, 'pending', false);
    },
  },
};
</script>

<style lang="scss">
.delete-participant-window-vue {
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
