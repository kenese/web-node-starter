import { Canvas } from './canvas.js';

const canvas = new Canvas();
canvas.init();

const closeCanvas = () => {
    canvas.destroy();
}