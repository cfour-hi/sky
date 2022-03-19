<template>
  <div ref="refRoot" class="control-panel__cloud-text">
    <ControlPanelHeader title="文字" />

    <div class="body">
      <div class="bar__font">
        <SkySelect
          ref="refSelectFontFamily"
          :value="panelData.fontFamily"
          class="select__font-family"
          @change="changeFontFamily"
        >
          <SkyOption
            v-for="fontFamily in fontStore.list"
            :key="fontFamily.id"
            :label="fontFamily.name"
            :value="fontFamily.name"
          >
            <img :src="fontFamily.preview.url" alt="" />
          </SkyOption>
        </SkySelect>

        <SkyInputNumber
          class="ml-2"
          :value="Math.round(panelData.fontSize)"
          @input="changePanelData('fontSize', $event)"
          @change="changePanelData('fontSize', $event)"
        />
      </div>

      <div class="bar bar-tool">
        <SkyButton
          plain
          :class="{ active: panelData.fontWeight === 700 }"
          @click="changePanelData('fontWeight', 700, 400)"
        >
          <SkyTooltip content="加粗" direction="bottom" />
          <svg-icon filename="bold" />
        </SkyButton>

        <SkyButton
          plain
          :class="{ active: panelData.fontStyle === 'italic' }"
          @click="changePanelData('fontStyle', 'italic', 'normal')"
        >
          <SkyTooltip content="斜体" direction="bottom" />
          <svg-icon filename="italic" />
        </SkyButton>

        <SkyButton
          plain
          :class="{ active: panelData.textDecoration === 'underline' }"
          @click="changePanelData('textDecoration', 'underline', 'none')"
        >
          <SkyTooltip content="下划线" direction="bottom" />
          <svg-icon filename="underline" />
        </SkyButton>

        <SkyButton
          plain
          :class="{ active: panelData.textDecoration === 'line-through' }"
          @click="changePanelData('textDecoration', 'line-through', 'none')"
        >
          <SkyTooltip content="删除线" direction="bottom" />
          <svg-icon filename="deleteline" />
        </SkyButton>
      </div>

      <div class="bar bar-tool" :class="{ vertical: isVerticalRL }">
        <SkyButton
          plain
          :class="{ active: panelData.textAlign === 'left' }"
          @click="changeCloudProp('textAlign', 'left')"
        >
          <SkyTooltip content="左对齐" direction="bottom" />
          <svg-icon filename="text-align-left" />
        </SkyButton>

        <SkyButton
          plain
          :class="{ active: panelData.textAlign === 'center' }"
          @click="changeCloudProp('textAlign', 'center')"
        >
          <SkyTooltip content="居中对齐" direction="bottom" />
          <svg-icon filename="align-center" />
        </SkyButton>

        <SkyButton
          plain
          :class="{ active: panelData.textAlign === 'right' }"
          @click="changeCloudProp('textAlign', 'right')"
        >
          <SkyTooltip content="右对齐" direction="bottom" />
          <svg-icon filename="text-align-right" />
        </SkyButton>

        <SkyButton
          plain
          :class="{ active: panelData.textAlign === 'justify' }"
          @click="changeCloudProp('textAlign', 'justify')"
        >
          <SkyTooltip content="两端对齐" direction="bottom" />
          <svg-icon filename="align-justify" />
        </SkyButton>
      </div>

      <div class="bar bar__color" data-sky-popup>
        <BarColorPicker
          :value="panelData.color"
          :modes="['纯色']"
          :multiple="panelData.isMultipleColor"
          @update:value="changePanelData('color', $event)"
        />
      </div>

      <div class="bar bar-tool" data-sky-popup>
        <SkyButton
          plain
          :class="{ active: isVerticalRL }"
          @click="changeWritingMode"
        >
          <SkyTooltip content="文字竖版" direction="bottom" />
          <svg-icon filename="writing-mode" />
        </SkyButton>

        <SkyButton plain @click="showSpacingPopup = !showSpacingPopup">
          <SkyTooltip content="间距" direction="bottom" />
          <svg-icon filename="spacing" />
        </SkyButton>

        <PopupSpacing
          v-model:visible="showSpacingPopup"
          v-model:letterSpacing="panelData.letterSpacing"
          v-model:lineHeight="panelData.lineHeight"
          :fontSize="panelData.fontSize"
          @update:letterSpacing="onChangeLetterSpacing"
          @update:lineHeight="onChangeLineHeight"
        />

        <SkyButton plain>
          <SkyTooltip content="文字变形" direction="bottom" />
          <svg-icon filename="text-distortion" />
        </SkyButton>
      </div>

      <div @click="onClickAdvanced">高级</div>
    </div>
  </div>

  <AdvancedPanelVue v-if="showAdvancedPanel" @back="onBackMainPanel" />
</template>
<script>
export default {
  name: 'ControlPanelCloudText',
};
</script>

<script setup>
import {
  computed,
  reactive,
  ref,
  onMounted,
  inject,
  nextTick,
  watchEffect,
} from 'vue';
import ControlPanelHeader from '@/components/control-panel/Header.vue';
import BarColorPicker from '@/components/biz/BarColorPicker.vue';
import PopupSpacing from './control-panel/PopupSpacing.vue';
import { useFontStore } from '@/stores/font';
import { splitText, setRange, getTextSelection } from './helper';
import { hasDiffValue, hasSameValue } from '@/utils/tool';
import { assign } from '@packages/sky/tool';
import { WRITING_MODE } from '@/constants';
import AdvancedPanelVue from './control-panel/AdvancedPanel.vue';

const refSelectFontFamily = ref();
const refRoot = ref();

const sky = inject('sky');
const { targetClouds } = sky.runtime;
const [targetCloud0] = targetClouds;
const fontStore = useFontStore();

const showSpacingPopup = ref(false);

// 控制面板有自己的数据对象，避免多选文字组件的情况下数据混乱
const panelData = reactive({
  fontFamily: targetCloud0.fontFamily,
  fontSize: targetCloud0.fontSize,
  hasMultipleFontSize: hasDiffValue(targetClouds, 'fontSize'),
  fontWeight: targetCloud0.fontWeight,
  fontStyle: targetCloud0.fontStyle,
  textDecoration: targetCloud0.textDecoration,
  textAlign: targetCloud0.textAlign,
  color: targetCloud0.color,
  hasMultipleColor: hasDiffValue(targetClouds, 'color'),
  writingMode: targetCloud0.writingMode,
  lineHeight: targetCloud0.lineHeight,
  letterSpacing: targetCloud0.letterSpacing,
});

// 仅当选择一个文字组件的情况下才有值
let birdTextVM = sky.birdVM[targetCloud0.id];
// 编辑状态下的 selection 对象
let textSelection = null;

const isVerticalRL = computed(() => panelData.writingMode === WRITING_MODE.v);

watchEffect(() => {
  // 拉伸文字组件会改变字体大小
  assign(panelData, targetCloud0);
});

onMounted(() => {
  showFontFamilyImage(panelData.fontFamily);
});

/**
 * 必须有一个确定值的情况下，不传 defaultValue
 * 比如 text-align
 */
function changeCloudProp(key, value, defaultValue) {
  const result = panelData[key] === value ? defaultValue ?? value : value;
  panelData[key] = result;

  // 更新 cloud 数据
  targetClouds.forEach((cloud) => {
    cloud[key] = result;
  });
}

function changeCloudTextsProp(texts, key, value, defaultValue) {
  const diff = hasDiffValue(texts, key, value);
  const result = diff ? value : defaultValue;
  panelData[key] = result;

  texts.forEach((text) => {
    text[key] = result;
  });
}

function changePanelData(key, value, defaultValue) {
  // 没有选中任何内容
  if (textSelection && textSelection.selection.isCollapsed) return;

  if (targetClouds.length > 1) {
    // 多选情况下直接修改
    changeCloudProp(key, value, defaultValue);
  } else if (birdTextVM.exposed.readonly.value) {
    // 非编辑状态下直接修改
    changeCloudProp(key, value, defaultValue);
    // 改变父级时删除所有 span key
    targetCloud0.texts.forEach((text) => Reflect.deleteProperty(text, key));
  } else if (textSelection) {
    // 单选 && 可编辑
    const {
      elTextContent,
      anchorOffset,
      anchorEl,
      anchorElIndex,
      focusOffset,
      focusEl,
      focusElIndex,
    } = textSelection;

    // 在同一个元素内
    if (anchorEl === focusEl) {
      const text = targetCloud0.texts[anchorElIndex];
      const [anchorNode] = anchorEl.childNodes;

      // 没选中内容
      if (textSelection.selection.isCollapsed) {
        // ???
      } else if (anchorOffset === 0 && focusOffset === anchorNode.length) {
        // 选中当前 sapn 的所有内容
        changeCloudTextsProp([text], key, value, defaultValue);
        setRange(anchorNode, 0, anchorNode, anchorNode.length);
      } else {
        const newText = splitText(text, anchorOffset, focusOffset);
        targetCloud0.texts.splice(anchorElIndex, 1, ...newText);

        // 选中当前 sapn 的部分内容，需进行分段
        const changeTexts = [];
        if (newText.length === 1) {
          changeTexts.push(...newText);
        } else {
          if (anchorOffset === 0) {
            changeTexts.push(newText[0]);
          } else {
            changeTexts.push(newText[1]);
          }
        }
        changeCloudTextsProp(changeTexts, key, value, defaultValue);

        nextTick(() => {
          const spans = Array.from(elTextContent.children);
          const startOffset = anchorElIndex + (anchorOffset === 0 ? 0 : 1);
          const [startTextNode] = spans[startOffset].childNodes;
          setRange(startTextNode, 0, startTextNode, startTextNode.length);
        });
      }
    } else {
      const changeTexts = [];
      // 从后往前赋值
      let text = targetCloud0.texts[focusElIndex];
      let newText = splitText(text, 0, focusOffset);
      changeTexts.push(newText[0]);
      targetCloud0.texts.splice(focusElIndex, 1, ...newText);

      for (let i = anchorElIndex + 1; i < focusElIndex; i += 1) {
        text = targetCloud0.texts[i];
        changeTexts.push(text);
      }
      text = targetCloud0.texts[anchorElIndex];
      newText = splitText(text, anchorOffset, text.text.length);
      changeTexts.push(newText[anchorOffset === 0 ? 0 : 1]);
      targetCloud0.texts.splice(anchorElIndex, 1, ...newText);

      changeCloudTextsProp(changeTexts, key, value, defaultValue);

      nextTick(() => {
        const spans = Array.from(elTextContent.children);
        const startOffset = anchorElIndex + (anchorOffset === 0 ? 0 : 1);
        const endOffset =
          startOffset +
          (focusElIndex - anchorElIndex - 1) +
          (focusOffset === focusEl.length ? 0 : 1);

        const [startTextNode] = spans[startOffset].childNodes;
        const [endTextNode] = spans[endOffset].childNodes;
        setRange(startTextNode, 0, endTextNode, endTextNode.length);
      });
    }
  }
}

function showFontFamilyImage(name) {
  const font = fontStore.list.find((f) => f.name === name);
  if (!font) return;

  const elInputInner = refRoot.value
    .querySelector('.select__font-family')
    .querySelector('.sky-input__inner');

  const style = {
    backgroundImage: `url(${font.preview.url})`,
    backgroundSize: '80%',
    backgroundPosition: '12px center',
    backgroundRepeat: 'no-repeat',
  };

  Object.assign(elInputInner.style, style);
}

function changeFontFamily(value) {
  changePanelData('fontFamily', value);
  showFontFamilyImage(value);

  const font = fontStore.list.find((f) => f.name === value);
  fontStore.addFont2Style(font.name, font.content.woff);
}

function changeTextColor(value) {
  changePanelData('color', value);
}

function changeWritingMode() {
  changeCloudProp(
    'writingMode',
    isVerticalRL.value ? WRITING_MODE.h : WRITING_MODE.v,
  );

  targetClouds.forEach((cloud) => {
    const { width, height } = cloud;
    cloud.width = height;
    cloud.height = width;
  });
}

function onChangeLetterSpacing(value) {
  changeCloudProp('letterSpacing', value);

  // 同步更新，异步更新有延迟，以及会出现 moveable rect 更新不准确问题
  sky.runtime.targetClouds.forEach((cloud) => {
    const el = sky.birdVM[cloud.id].subTree.el.querySelector('.text__content');
    el.style.letterSpacing = `${value}px`;

    if (cloud.writingMode === WRITING_MODE.h) {
      cloud.height = el.clientHeight;
    } else if (cloud.writingMode === WRITING_MODE.v) {
      cloud.width = el.clientWidth;
    }
  });
  sky.cloud.updateCloudsElementRect();
}

function onChangeLineHeight(value) {
  changeCloudProp('lineHeight', value);

  // 同步更新，异步更新有延迟，以及会出现 moveable rect 更新不准确问题
  sky.runtime.targetClouds.forEach((cloud) => {
    const el = sky.birdVM[cloud.id].subTree.el.querySelector('.text__content');
    el.style.lineHeight = value;

    if (cloud.writingMode === WRITING_MODE.h) {
      cloud.height = el.clientHeight;
    } else if (cloud.writingMode === WRITING_MODE.v) {
      cloud.width = el.clientWidth;
    }
  });
  sky.cloud.updateCloudsElementRect();
}

const showAdvancedPanel = ref(false);

function onClickAdvanced() {
  showAdvancedPanel.value = true;
}

function onBackMainPanel() {
  showAdvancedPanel.value = false;
}

document.onselectionchange = () => {
  if (birdTextVM.exposed.readonly.value) {
    // 不可编辑模式
    textSelection = null;
    return;
  }

  textSelection = getTextSelection();

  const texts = targetCloud0.texts.slice(
    textSelection.anchorElIndex,
    textSelection.focusElIndex + 1,
  );
  const [text0] = texts;

  Object.assign(panelData, {
    hasMultipleFontSize: hasDiffValue(texts, 'fontSize'),
    fontWeight: hasDiffValue(texts, 'fontWeight', 700) ? 400 : 700,
    fontStyle: hasDiffValue(texts, 'fontStyle', 'italic') ? 'normal' : 'italic',
    color: text0.color || targetCloud0.color,
    hasMultipleColor: hasDiffValue(texts, 'color'),
    textDecoration: hasSameValue(texts, 'textDecoration', 'underline')
      ? 'underline'
      : hasSameValue(texts, 'textDecoration', 'line-through')
      ? 'line-through'
      : 'none',
  });
};
</script>

<style lang="scss" scoped>
.bar__font {
  @apply flex justify-between;

  .select__font-family {
    :deep {
      .sky-input__inner {
        @apply text-transparent cursor-pointer;
      }
    }
  }

  .sky-input__number {
    width: 60px;

    :deep {
      .sky-input__number--increase,
      .sky-input__number--decrease {
        @apply w-4;
      }

      .sky-input .sky-input__inner {
        @apply pl-2 pr-4;
      }
    }
  }
}

.bar {
  @apply mt-3;

  &.vertical {
    .svg-icon {
      transform: rotate(90deg);
    }
  }
}
</style>
