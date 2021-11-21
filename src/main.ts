import 'normalize.css';
import 'animate.css';
import '@/index.css';
import 'virtual:svg-icons-register';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import SvgIcon from '@/components/SvgIcon.vue';
import skyUI from '@packages/sky-ui/main';
import skyPlugin from '@/plugins/sky';
import AppComponent from './App.vue';

const app = createApp(AppComponent);
(window as any).app = app;

app.use(createPinia());
app.component(SvgIcon.name, SvgIcon);
app.use(skyUI);
app.use(skyPlugin);

const vm = app.mount('#app');
console.log('vm', vm);
