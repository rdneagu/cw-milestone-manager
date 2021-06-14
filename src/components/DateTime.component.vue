<template>
  <div :id="formatInputId(id)" class="datetime-wrapper" :class="[ hasFailed ]">
    <label :for="id" class="label">{{ label }}</label>
    <VueCtkDateTimePicker :id="id" :min-date="getMinDate" :max-date="getMaxDate" color="#006599" format="YYYY-MM-DD HH:mm" formatted="DD MMMM YYYY, HH:mm" v-model="inputHandler" />
    <Icon v-if="error" class="error" name="warning" v-tooltip="{ type: 'alert', text: error }"></Icon>
  </div>
</template>

<script>
import Icon from '@/components/Icon.component.vue';

export default {
  components: { Icon },
  props: ['id', 'label', 'model', 'error', 'min-date', 'max-date'],
  data() {
    return {
      dateValue: this.model,
    };
  },
  computed: {
    /**
     * Returns a special input element class name if the input has failed the validation checks
     *
     * @returns {String}  The input class name
     */
    hasFailed() {
      return (this.error) ? 'failed' : null;
    },
    getMinDate() {
      if (this.minDate) {
        const date = new Date(this.minDate);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
      }
      return null;
    },
    getMaxDate() {
      if (this.maxDate) {
        const date = new Date(this.maxDate);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
      }
      return null;
    },
    inputHandler: {
      get() {
        const date = new Date(this.dateValue);
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
      },
      set(value) {
        const date = new Date(value);
        this.dateValue = date.getTime();
      },
    },
  },
  methods: {
    /**
     * Formats the input element class based on the id passed in
     *
     * @param {String} id             - The id of the input
     * @returns {String}  The formatted input class name
     */
    formatInputId(id) {
      return `input-${id}`;
    },
  },
  watch: {
    dateValue(to) {
      this.$emit('update:model', to);
    },
  },
};
</script>

<style lang="scss">
@import '@/scss/_mixins';

.datetime-wrapper {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto minmax(30px, auto);
  grid-template-areas: "label label"
                        "field error";

  .label, .error {
    display: flex;
    align-items: center;
    padding: 8px;
    font-size: 16px;
  }
  .error { grid-area: error; }
  .label {
    grid-area: label;
    display: flex;
    color: $color-cyan;
    font-weight: 600;
  }
  .date-time-picker {
    .field {
      label {
        font-weight: 600;
        color: darken($color-cyan, 10%) !important;
      }
      input {
        color: $color-cyan;
        border: 1px solid darken($color-cyan, 15%) !important;
        background-color: transparent;
        &:hover { background-color: rgba($color-cyan, .1) }
      }
      .custom-button {
        background: transparent;
        .custom-button-effect { background: transparent; }
        .custom-button-content { color: $color-cyan !important; }
      }
    }
    .week-days { text-shadow: none; }
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
    .date-time-picker {
      .field {
        label {
          font-weight: 600;
          color: darken($redish, 10%) !important;
        }
        input {
          color: $redish;
          border: 1px solid darken($redish, 15%) !important;
          &:hover { background-color: rgba($redish, .1); }
        }
        .custom-button {
          background: transparent;
          .custom-button-effect { background: transparent; }
          .custom-button-content { color: $redish !important; }
        }
      }
    }
  }
}
</style>
