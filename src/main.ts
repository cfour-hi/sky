import 'normalize.css';
import 'animate.css';
import '@/index.css';
import 'virtual:svg-icons-register';
import { createApp } from 'vue';
import skyUI from '@packages/sky-ui/main';
import SvgIcon from '@/components/SvgIcon.vue';
import skyPlugin from '@/plugins/sky';
import AppComponent from './App.vue';
import { createPinia } from 'pinia';

const app = createApp(AppComponent);

(window as any).app = app;
console.log('app', app);

app.use(skyPlugin);
app.use(skyUI);
app.use(createPinia());
app.component(SvgIcon.name, SvgIcon);

const vm = app.mount('#app');
console.log('vm', vm);
