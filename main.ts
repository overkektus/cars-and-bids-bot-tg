import { IApp } from './src/app.interface';
import { container } from './src/inversify.config';
import { TYPES } from './src/types';

const app = container.get<IApp>(TYPES.App);
app.launch();