import store from '../store/index';

function show(binding) {
  if (this.getAttribute('unbinding')) return;
  store.commit('showTooltip', { element: this, type: binding.value.type, text: binding.value.text });
}

function hide() {
  store.commit('hideTooltip');
}

const tooltipDirective = {
  bind(el, binding) {
    if (!binding.value.text) return;
    el.addEventListener('mouseenter', show.bind(el, binding));
    el.addEventListener('mouseleave', hide);
  },
  unbind(el) {
    el.setAttribute('unbinding', true);
    // If a tooltip is active, hide it if belongs to the unbound element
    if (!store.getters.getTooltip) return;
    if (el === store.getters.getTooltip.element) {
      hide();
    }
  },
};

export default tooltipDirective;
