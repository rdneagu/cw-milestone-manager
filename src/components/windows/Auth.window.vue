<template>
  <div class="auth-window">
    <transition v-for="(option, key) in forms" :key="`option-${key}`" @enter="enter" @leave="leave" mode="out-in" appear>
      <div v-if="key !== form" class="auth-option" :id="`option-${key}`" @click.capture="setForm(key)">
        <Icon :name="option.panel.icon"></Icon>
        <span class="name">{{ option.panel.description }}</span>
      </div>
    </transition>
    <transition @enter="enter" @leave="leave" @afterEnter="afterEnter" mode="out-in" appear>
      <form v-if="form === 'register'" class="auth-form" id="form-register" @keydown.enter="lastPassFix" @keyup.enter="submit()">
        <div class="form-wrapper">
          <Icon name="add-circle" class="background"></Icon>
          <Button name="close" type="icon" icon="close" :click="this.setForm.bind()"></Button>
          <div class="title">{{ getForm.title }}</div>
          <section class="alternative">
            <Button icon="facebook" type="dialog" name="facebook" :disabled="true">Facebook</Button>
            <Button icon="google" type="dialog" name="google" :disabled="true">Google</Button>
          </section>
          <span class="separator or">or</span>
          <section class="form">
            <div v-for="(input, id) in getForm.input" :key="id" :id="formatInputId(id)" class="input-wrapper" :class="[ hasFailed(input) ]">
              <label :for="id" class="label icon" :class="[ input.icon ]"></label>
              <input :id="id" :type="input.type" :name="id" :placeholder="input.placeholder" v-model="input.model" />
              <Icon v-if="input.error" class="error" name="warning" v-tooltip="{ type: 'alert', text: input.error }"></Icon>
            </div>
          </section>
          <section class="form-control">
            <Button v-for="(button, id) in getForm.control" :key="id" v-bind="button"></Button>
          </section>
          <span class="separator line"></span>
          <section class="extra">
            <span>By clicking Continue, Facebook or Google</span>
            <span>you agree with our <a>Terms and Conditions</a></span>
          </section>
        </div>
      </form>
    </transition>
    <transition @enter="enter" @leave="leave" @afterEnter="afterEnter" mode="out-in" appear>
      <form v-if="form === 'login'" class="auth-form" id="form-login" @keydown.enter="lastPassFix" @keyup.enter="submit()">
        <div class="form-wrapper">
          <Icon name="user-circle" class="background"></Icon>
          <Button name="close" type="icon" icon="close" :click="this.setForm.bind()"></Button>
          <div class="title">{{ getForm.title }}</div>
          <section class="alternative">
            <Button icon="facebook" type="dialog" name="facebook" :disabled="true">Facebook</Button>
            <Button icon="google" type="dialog" name="google" :disabled="true">Google</Button>
          </section>
          <span class="separator or">or</span>
          <section class="form">
            <div v-for="(input, id) in getForm.input" :key="id" :id="formatInputId(id)" class="input-wrapper" :class="[ hasFailed(input) ]">
              <label :for="id" class="label icon" :class="[ input.icon ]"></label>
              <input :id="id" :type="input.type" :name="id" :placeholder="input.placeholder" v-model="input.model" />
              <Icon v-if="input.error" class="error" name="warning" v-tooltip="{ type: 'alert', text: input.error }"></Icon>
            </div>
          </section>
          <div class="remember">
            <input id="remember" type="checkbox" class="checkbox" name="remember" v-model="forms.login.remember">
            <label for="remember" class="checkbox-label">Remember me!</label>
          </div>
          <section class="form-control">
            <Button v-for="(button, id) in getForm.control" :key="id" v-bind="button"></Button>
          </section>
          <span class="separator line"></span>
          <section class="extra">
            <span>Don't have an account yet?</span>
            <span><a @click="setForm('register')">Create a new account!</a></span>
            <span><a @click="setForm('recovery')">Recover your account!</a></span>
          </section>
        </div>
      </form>
    </transition>
    <transition @enter="enter" @leave="leave" @afterEnter="afterEnter" mode="out-in" appear>
      <form v-if="form === 'recovery'" class="auth-form" id="form-recovery" @keydown.enter="lastPassFix" @keyup.enter="submit()">
        <div class="form-wrapper">
          <Icon name="refresh" class="background"></Icon>
          <Button name="close" type="icon" icon="close" :click="this.setForm.bind()"></Button>
          <div class="title">{{ getForm.title }}</div>
          <section class="form">
            <transition v-for="(input, id) in getForm.input" :key="id" @enter="slideEnter" @leave="slideLeave">
              <div v-show="input.step <= getForm.step" :id="formatInputId(id)" class="input-wrapper" :class="[ hasFailed(input), formatStepStatus(input.step) ]">
                <label :for="id" class="label icon" :class="[ input.icon ]"></label>
                <input :id="id" :type="input.type" :name="id" :placeholder="input.placeholder" v-model="input.model" />
                <Icon v-if="input.error" class="error" name="warning" v-tooltip="{ type: 'alert', text: input.error }"></Icon>
              </div>
            </transition>
          </section>
          <section class="form-control">
            <Button v-for="(button, id) in getForm.control" :key="id" v-bind="button"></Button>
          </section>
          <span class="separator line"></span>
          <section class="extra">
            <span>Already have a recovery code?</span>
            <span><a @click="forms.recovery.step === 0 ? setRecovery(1) : setRecovery(0)">Enter the code here!</a></span>
          </section>
        </div>
      </form>
    </transition>
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */
import _ from 'lodash';
import axios from 'axios';
import Velocity from 'velocity-animate';

import Auth from './Auth.window.vue'; // eslint-disable-line
import Icon from '../Icon.component.vue';
import Button from '../Button.component.vue';

export default {
  props: ['name'],
  components: {
    Icon,
    Button,
  },
  data() {
    return {
      form: this.name,
      forms: {
        register: {
          panel: {
            icon: 'add',
            description: 'Sign Up',
          },
          title: 'Sign Up',
          action: '/user/register',
          input: {
            username: { icon: 'icon-person', type: 'text', placeholder: 'username' },
            password: { icon: 'icon-key', type: 'password', placeholder: 'password' },
            confirmPassword: { icon: 'icon-key', type: 'password', placeholder: 'confirm password' },
            email: { icon: 'icon-email', type: 'text', placeholder: 'email' },
            confirmEmail: { icon: 'icon-email', type: 'text', placeholder: 'confirm email' },
          },
          control: [
            { name: 'register', text: 'Register', icon: 'next', type: 'dialog', click: this.submit.bind(null) },
          ],
          success: (user) => {
            this.clear();
            this.setForm('login');
            this.$store.commit('pushNotification', { icon: 'check', text: `Your account "${user}" has been created` });
          },
        },
        login: {
          panel: {
            icon: 'user',
            description: 'Sign In',
          },
          title: 'Sign In',
          action: '/user/authenticate',
          input: {
            username: { icon: 'icon-person', type: 'text', placeholder: 'username' },
            password: { icon: 'icon-key', type: 'password', placeholder: 'password' },
          },
          remember: true,
          control: [
            { name: 'login', text: 'Log In', icon: 'next', type: 'dialog', click: this.submit.bind(null) },
          ],
          success: (data) => {
            this.clear();
            this.$store.commit('pushNotification', { icon: 'check', text: `You have been logged in as "${data.username}"` });
            this.$store.commit('closeWindow');
            this.$store.commit('authenticate', data);
          },
        },
        recovery: {
          panel: {
            icon: 'refresh',
            description: 'Recover',
          },
          title: 'Recover',
          action: '/user/recover',
          input: {
            account: { icon: 'icon-person', type: 'text', placeholder: 'username or email', step: 0 },
            code: { icon: 'icon-code', type: 'text', placeholder: 'code', step: 1 },
            password: { icon: 'icon-key', type: 'password', placeholder: 'password', step: 2 },
            confirmPassword: { icon: 'icon-key', type: 'password', placeholder: 'confirm password', step: 2 },
          },
          step: 0,
          control: [
            { name: 'recover', text: 'Recover', icon: 'next', type: 'dialog', click: this.submit.bind(null) },
          ],
          success: (step) => {
            this.$set(this.forms.recovery, 'step', step + 1);
            if (this.forms.recovery.step > 2) {
              this.clear();
              this.setForm('login');
              this.$store.commit('pushNotification', { icon: 'check', text: 'Your account password has been changed' });
            }
          },
        },
      },
    };
  },
  mounted() {
    // If the recovery query exists in the URL path, direct the user to the recovery form and auto-complete the code
    if (this.$route.query.recovery) {
      this.$set(this.forms.recovery, 'step', 1);
      this.$set(this.forms.recovery.input.code, 'model', this.$route.query.recovery);
      this.$router.replace({ query: { recovery: undefined } });
    }
  },
  computed: {
    /**
     * Returns the object containing the active form depending on the name of the active form
     *
     * @return {Object}  The object containing the current active form
     */
    getForm() {
      return this.forms[this.form];
    },
  },
  methods: {
    /**
     * Changes the active form to a different one
     *
     * @param {String} form           - The form name to change to (login, register, recovery, null)
     */
    async setForm(form) {
      this.$set(this, 'form', form);
      if (form === 'recovery') {
        this.clear();
      }
    },
    /**
     * Sets the recovery step
     *
     * @param {Integer} step          - The step to set
     */
    setRecovery(step) {
      this.$set(this.forms.recovery, 'step', step);
    },
    /**
     * Formats the input element class based on the id passed in
     *
     * @param {String} id             - The id of the input
     * @returns {String}  The formatted input class name
     */
    formatInputId(id) {
      return `input-${id}`;
    },
    /**
     * Formats the input element class based on the recovery step status and the required step to pass
     *
     * @param {Integer} step          - The step number
     * @returns {String}  The formatted step class name
     */
    formatStepStatus(step) {
      if (this.forms.recovery.step <= step) {
        return 'on-step';
      }
      return 'passed-step';
    },
    /**
     * Returns a special input element class name if the field has failed the validation checks
     *
     * @param {String} field          - Field name to check
     * @returns {String}  The input class name
     */
    hasFailed(field) {
      return (field.error) ? 'failed' : null;
    },
    /**
     * Cleans the active form of errors
     */
    clean() {
      _.forEach(this.getForm.input, (field, key) => {
        this.$delete(this.getForm.input[key], 'error');
      });
    },
    /**
     * Clears the active form input fields and resets the recovery step
     */
    clear() {
      _.forEach(this.getForm.input, (field, key) => {
        this.$set(this.getForm.input[key], 'model', '');
      });
      this.$set(this.forms.recovery, 'step', 0);
    },
    /**
     * Prepares the data of the input fields to be sent to the server
     */
    prepareInputData() {
      // Reduce the input fields to { 'fieldName': 'fieldValue' } to prepare it
      const data = _.reduce(this.getForm.input, (acc, val, key) => {
        acc[key] = val.model;
        return acc;
      }, {});
      data.step = this.getForm.step;
      return _.merge(data);
    },
    /**
     * Submits the active form data to the server
     */
    async submit() {
      this.clean();
      const data = this.prepareInputData();
      // Submit the form data
      const response = await axios.post(this.getForm.action, data);
      // Format the input errors if there are any
      if (response.data.error) {
        _.forEach(response.data.error, (error, field) => {
          this.$set(this.getForm.input[field], 'error', error[0]);
        });
      } else {
        const { step } = this.forms.recovery;
        switch (this.form) {
          case 'register': this.getForm.success(data.username); break;
          case 'login': this.getForm.success(response.data.result); break;
          case 'recovery': this.getForm.success(step); break;
          default: break;
        }
      }
    },
    /**
     * Blocks the error thrown by LastPass when enter is pressed while form is in focus
     *
     * @param {Object} ev         - The event data holder
     */
    lastPassFix(ev) {
      ev.stopImmediatePropagation();
    },
    /**
     * Animation functions to run when recovery step is changed
     */
    slideEnter(el, done) {
      const curHeight = el.offsetHeight;
      el.style.height = 'auto';
      const maxHeight = el.offsetHeight;
      el.style.height = `${curHeight}px`;
      Velocity(el, 'stop');
      Velocity(el, { height: maxHeight }, { easing: 'swing', duration: 200 });
      Velocity(el, { opacity: 1 }, { easing: 'swing', duration: 200, complete: done });
    },
    slideLeave(el, done) {
      Velocity(el, 'stop');
      Velocity(el, { opacity: 0 }, { easing: 'swing', duration: 200 });
      Velocity(el, { height: 0 }, { easing: 'swing', duration: 200, complete: done });
    },
    /**
     * Animation functions to run when the active form is changed
     */
    enter(el, done) {
      if (el.classList.contains('auth-option')) {
        el.style.opacity = 0;
        Velocity(el, 'stop');
        Velocity(el, { opacity: 1 }, { easing: 'ease', duration: 200, delay: 200, complete: done });
      } else if (el.classList.contains('auth-form')) {
        el.style.height = 'auto';
        const maxHeight = el.clientHeight;
        el.style.opacity = 0;
        el.style.height = '100px';
        Velocity(el, 'stop');
        Velocity(el, { opacity: 1 }, { easing: 'ease', duration: 200, delay: 200 });
        Velocity(el, { height: maxHeight }, { easing: 'ease', duration: 200, complete: done });

        const children = el.children[0];
        children.style.opacity = 0;
        Velocity(children, { opacity: 1 }, { easing: 'ease', duration: 200, delay: 600 });
      }
    },
    afterEnter(el) {
      el.style.height = 'auto';
    },
    leave(el, done) {
      if (el.classList.contains('auth-option')) {
        Velocity(el, 'stop');
        Velocity(el, { opacity: 0 }, { easing: 'ease', duration: 200, complete: done });
      } else if (el.classList.contains('auth-form')) {
        Velocity(el, 'stop');
        Velocity(el, { opacity: 0, height: '100px' }, { easing: 'ease', duration: 200, complete: done });

        const children = el.children[0];
        children.style.opacity = '0';
      }
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/_mixins';

.auth-window {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-areas: "register login recovery";
  align-items: center;
  justify-content: space-around;
  justify-items: center;

  #option-register, #form-register {
    grid-area: register;
  }
  #option-login, #form-login {
    grid-area: login;
  }
  #option-recovery, #form-recovery {
    grid-area: recovery;
  }

  .auth-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    width: 200px;
    height: 150px;
    border: 1px solid $color-cyan-border;
    border-radius: 4px;
    background-color: rgba($color-cyan-d2, .8);
    cursor: pointer;
    transition: background-color .2s linear;

    .icon {
      font-size: 80px;
      text-shadow: 0 0 5px $color-cyan;
      transition: text-shadow .2s linear;
    }
    .name { font-weight: 600; }
    &:hover {
      background-color: rgba($color-cyan-d2, .5);
      .icon { text-shadow: 0 0 10px lighten($color-cyan, 5%); }
    }
  }

  .auth-form {
    width: 320px;
    border: 1px solid $color-cyan;
    border-radius: 4px;
    background-color: rgba(#001625, .8);
    box-shadow: 0 1px 2px #000;
    overflow: hidden;

    .form-wrapper {
      position: relative;
      display: grid;
      grid-auto-flow: row;
      align-content: center;
      overflow: hidden;
      .background {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 400px;
        opacity: .05;
        pointer-events: none;
      }
      .title {
        display: block;
        position: relative;
        margin-top: 25px;
        margin-bottom: 30px;
        font-size: 26px;
        text-align: center;
      }
      .alternative {
        display: flex;
        justify-content: center;
        position: relative;
        .button {
          width: 80px;
          justify-content: center;
          margin-left: 8px;
          margin-right: 8px;
          &.btn-google {
            background: linear-gradient(to bottom, #dd4a36, darken(#dd4a36, 10%));
            color: lighten(#dd4a36, 40%);
            &:hover:not(.disabled) { background-color: darken(#c93737, 35%); }
          }
        }
      }
      .separator {
        flex: 1 100%;
        position: relative;
        margin-top: 30px;
        margin-bottom: 30px;
        border: none;
        &.or {
          font-size: 14px;
          text-align: center;
          &:before {
            position: absolute;
            content: "";
            left: 40px; top: 8px;
            width: 90px;
            border-top: 1px solid $color-cyan-border;
            border-bottom: 1px solid rgba(#000, .8);
          }
          &:after {
            position: absolute;
            content: "";
            right: 40px; top: 8px;
            width: 90px;
            border-top: 1px solid $color-cyan-border;
            border-bottom: 1px solid rgba(#000, .8);
          }
        }
        &.line {
          &:before {
            position: absolute;
            content: "";
            left: 40px; right: 40px;
            border-top: 1px solid $color-cyan-border;
            border-bottom: 1px solid rgba(#000, .8);
          }
        }
      }
      .form {
        flex: 1;
        display: grid;
        grid-auto-flow: row;
        grid-row-gap: 10px;
        align-content: center;
        padding: 0 40px;
        .input-wrapper {
          display: grid;
          grid-template-columns: auto 1fr auto;
          grid-template-rows: 30px;
          grid-template-areas: "label field error";
          overflow: hidden;
          .label, .error {
            display: flex;
            align-items: center;
            padding: 8px;
            font-size: 16px;
          }
          .label {
            padding: 0 12px;
            border-radius: 4px 0 0 4px;
            background-color: darken($color-cyan, 15%);
            color: lighten($color-cyan, 30%);
          }
          input {
            min-width: 50px;
            padding: 0 20px 0 20px;
            color: $color-cyan;
            border: 1px solid darken($color-cyan, 15%);
            border-left: none;
            border-radius: 0 4px 4px 0;
            @include transition('background-color, text-shadow, box-shadow, border-color', 200ms, ease);
            &:hover { background-color: rgba($color-cyan, .1); }
            &:focus {
              background-color: rgba($color-cyan, .1);
              box-shadow: 0 0 3px lighten($color-cyan, 10%) inset;
              text-shadow: 0 0 2px $color-cyan;
            }
          }
          &.on-step:not(#input-account) {
            .label {
              background-color: darken(orange, 15%);
              color: lighten(orange, 20%);
            }
            input {
              @include setPlaceholder(orange);
              border-color: darken(orange, 15%);
              color: orange;
              &:hover { background-color: rgba(orange, .1); }
              &:focus {
                background-color: rgba(orange, .1);
                box-shadow: 0 0 3px lighten(orange, 10%) inset;
                text-shadow: 0 0 2px orange;
              }
              &::selection { background-color: darken(orange, 5%); }
            }
          }
          &.passed-step:not(#input-account) {
            .label {
              background-color: darken(lime, 15%);
              color: lighten(lime, 20%);
            }
            input {
              @include setPlaceholder(lime);
              border-color: darken(lime, 15%);
              color: lime;
              &:hover { background-color: rgba(lime, .1); }
              &:focus {
                background-color: rgba(lime, .1);
                box-shadow: 0 0 3px lighten(lime, 10%) inset;
                text-shadow: 0 0 2px lime;
              }
              &::selection { background-color: darken(lime, 5%); }
            }
          }
          // If input field has failed the validation checks styling below applies
          &.failed:not(#prioritize) {
            .label {
              color: lighten($redish, 30%);
              border-color: $redish;
              background-color: $redish;
            }
            .error {
              font-size: 20px;
              color: $redish;
              animation: .4s fxerror ease-in-out;
            }
            input {
              @include setPlaceholder($redish);
              color: $redish;
              border-color: $redish;
              &:hover { background-color: rgba($redish, .1); }
              &:focus {
                background-color: rgba($redish, .1);
                box-shadow: 0 0 3px lighten($redish, 10%) inset;
                text-shadow: 0 0 2px $redish;
              }
              &::selection {
                background-color: $redish;
              }
            }
          }
        }
      }

      .remember {
        justify-self: center;
        margin-top: 20px;
      }

      .form-control {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
      }

      section.extra {
        position: relative;
        margin-bottom: 30px;
        font-size: 14px;
        font-weight: 600;
        text-align: center;
        span {
          display: block;
          margin-top: 2px;
          a {
            color: darken($color-cyan, 10%);
            &:hover { color: $color-cyan; }
          }
        }
      }
    }

    &#form-recovery {
      #input-code,
      #input-password,
      #input-confirmPassword {
        height: 0;
        opacity: 0;
      }
    }
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  @include transition('color, text-shadow', .2s, ease);
  &:hover {
    color: lighten($color-cyan, 20%);
    text-shadow: 0 0 1px $color-cyan;
  }
  @include disableSelect();
}

.checkbox {
  position: absolute;
  display: none;
  visibility: hidden;
  & + .checkbox-label:before {
    position: relative;
    content: '\e907';
    margin-right: 5px;
    border: 2px solid $color-cyan-border;
    border-radius: 2px;
    font-family: 'cwscheduleappicon';
    color: rgba($color-cyan, 0);
    text-shadow: none;
    transition: color .15s ease;
  }

  &:checked + .checkbox-label:before {
    content: '\e907';
    font-family: 'cwscheduleappicon';
    color: $color-cyan;
    text-shadow: none;
  }
}

</style>
