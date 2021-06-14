<template>
  <div class="error-route">
    <div class="message">Page not found</div>
  </div>
</template>

<script>
export default {

};
</script>

<style lang="scss">
.error-route {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  padding: 50px;
  background-color: rgba(darken($color-cyan-d2, 4%), .6);
  .message {
    font-size: 32px;
    font-weight: 600;
    color: $redish;
  }
}
</style>
