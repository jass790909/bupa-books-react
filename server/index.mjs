import { createApp } from './app.mjs';
const port=Number(process.env.PORT || 3001);
createApp().listen(port, process.env.HOST || '127.0.0.1',()=>console.log(`Bupa Books: http://localhost:${port}`));
