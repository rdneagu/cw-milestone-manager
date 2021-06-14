<template>
  <div v-show="isCondition" :id="formatInputId(id)" class="input-wrapper" :class="[ hasFailed, hasTextLabel ]">
    <label v-if="hasAnyLabel" :for="id" class="label">
      <Icon v-if="icon" :name="icon" />
      <template v-else-if="label">{{ label }}</template>
    </label>
    <textarea v-if="isTextarea" :id="id" type="textarea" :name="id" :placeholder="placeholder" rows="5" v-model="model" />
    <input v-else :id="id" :type="getInputType" :name="id" :placeholder="placeholder" v-model="model" />
    <Icon v-if="error" class="error" name="warning" v-tooltip="{ type: 'alert', text: error }"></Icon>
  </div>
</template>

<script>
import Icon from '@/components/Icon.component.vue';

export default {
  components: { Icon },
  props: ['id', 'icon', 'label', 'type', 'textareaRows', 'placeholder', 'value', 'error', 'condition'],
  computed: {
    /**
     * Returns a special input element class name if the input has failed the validation checks
     *
     * @returns {String}  The input class name
     */
    hasFailed() {
      return (this.error) ? 'failed' : null;
    },
    hasAnyLabel() {
      return (this.icon || this.label);
    },
    hasTextLabel() {
      return (this.label) ? 'text-label' : 'icon-label';
    },
    getInputType() {
      return this.type || 'text';
    },
    isTextarea() {
      return (this.getInputType === 'textarea');
    },
    isCondition() {
      if (this.condition === undefined) return true;
      return this.condition;
    },
    model: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
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
};
</script>

<style lang="scss">
@import '@/scss/_mixins';

.input-wrapper {
  display: grid;
  &.icon-label {
    grid-template-columns: 40px 1fr auto;
    grid-template-rows: min(30px);
    grid-template-areas: "label field error";
  }
  &.text-label {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto minmax(30px, auto);
    grid-template-areas: "label ."
                         "field error";
  }

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
  }
  &.text-label .label {
    color: $color-cyan;
    font-weight: 600;
  }
  &.icon-label .label {
    justify-content: center;
    padding: 0 12px;
    border-radius: 2px 0 0 2px;
    background-color: darken($color-cyan, 15%);
    color: lighten($color-cyan, 30%);
  }
  input, textarea {
    grid-area: field;
    min-width: 50px;
    padding: 0 20px;
    border-radius: 2px;
    color: $color-cyan;
    border: 1px solid darken($color-cyan, 15%);
    @include transition('background-color, text-shadow, box-shadow, border-color', 200ms, ease);
    &:hover { background-color: rgba($color-cyan, .1); }
    &:focus {
      background-color: rgba($color-cyan, .1);
      box-shadow: 0 0 3px lighten($color-cyan, 10%) inset;
      text-shadow: 0 0 2px $color-cyan;
    }
    line-height: 1;
  }
  textarea {
    min-height: 16px;
    resize: vertical;
    padding: 10px 20px;
  }
  &.icon-label input {
    border-left: none;
    border-radius: 0 4px 4px 0;
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
    input, textarea {
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
</style>
