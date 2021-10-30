import SkyButton from './SkyButton.vue';
import SkyInput from './SkyInput.vue';
import SkyInputNumber from './SkyInputNumber.vue';
import SkySelect from './SkySelect.vue';
import SkyOption from './SkyOption.vue';
import SkyColorPicker from './sky-color-picker/index.vue';
import SkyPopup from './SkyPopup.vue';
import SkyTabs from './SkyTabs.vue';
import SkyTabPanel from './SkyTabPanel.vue';
import SkyTooltip from './SkyTooltip.vue';
import SkyDialog from './SkyDialog.vue';
import SkySlider from './SkySlider.vue';

const components = [
  SkyButton,
  SkyInput,
  SkyInputNumber,
  SkySelect,
  SkyOption,
  SkyColorPicker,
  SkyPopup,
  SkyTabs,
  SkyTabPanel,
  SkyTooltip,
  SkyDialog,
  SkySlider,
];

export default {
  install(app: any) {
    components.forEach((component) => {
      app.component(component.name, component);
    });
  },
};

export * as colorer from './color';
