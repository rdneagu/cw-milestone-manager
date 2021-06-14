<template>
  <div class="add-participant-window-vue">
    <div class="header">
      <span class="action">
        You are about to invite a new member to
        <span class="lighten">{{ coursework.title }}</span>
      </span>
    </div>
    <div class="body">
      <div class="info">Inviting a new user will add it to the member list and grant read only access to the coursework regardless of privacy!</div>
      <form @submit.prevent="confirm" @keydown.enter="lastPassFix">
        <div class="instructions">Please enter the username of the member to confirm:</div>
        <Input v-for="(field, id) in fields" :key="id" v-bind="field" v-model="field.model" />
      </form>
    </div>
    <div class="footer">
      <Button v-bind="buttons.confirm">Invite user</Button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import Input from '@/components/Input.component.vue';
import Button from '@/components/Button.component.vue';

export default {
  components: { Input, Button },
  props: ['coursework'],
  data() {
    return {
      buttons: {
        confirm: { name: 'confirm-invite', icon: 'add', type: 'dialog', click: () => this.confirm() },
      },
      fields: {
        member: { id: 'cwma-username', icon: 'user-circle', type: 'text', placeholder: 'username or userid' },
        team: { id: 'cwmda-team', icon: 'group', type: 'text', placeholder: 'team' },
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
      const response = await this.$store.dispatch('post', {
        url: '/coursework/addParticipant',
        data: { coursework: this.coursework.id, member: this.fields.member.model, team: this.fields.team.model },
      });
      if (response.error) {
        _.forEach(response.error, (error, field) => {
          if (!Array.isArray(error)) return;
          this.$set(this.fields[field], 'error', error[0]);
        });
      } else {
        this.coursework.participants.push(response.result);
        this.$store.commit('pushNotification', { icon: 'check', text: `${response.result.username} has been invited to the coursework` });
        this.$store.commit('closeWindow');
      }
      this.$set(this.buttons.confirm, 'pending', false);
    },
  },
};
</script>

<style lang="scss">
.add-participant-window-vue {
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
    margin-top: 20px;
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
    .input-wrapper { margin: 4px 30px; }
  }
}
</style>
