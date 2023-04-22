/**
 * @module Rendering
 * @submodule Rendering
 * @for p5
 */

import p5 from './main';
import * as constants from './constants';

/**
 * TODO: add description
 *
 * @method arc
 * @param  {String} endpoint        the url of the ML endpoint
 * @param  {p5.Graphics} g          the graphics object from which we will draw the source image
 * @param  {Object} target          the dictionary about the target. should contain target object to draw the generated image to, x and y position about where to draw the image
 * @param  {String} prompt          prompt to specify the generation
 * @param  {String} negative_prompt negative prompt to specify the generation
 * @param  {Number} strength        strength of the img2img
 * @param  {Number} cfg             how strictly the diffusion process adheres to the prompt text
 * @param  {String} sampler         the sampler to use for the generation
 * @param  {Number} seed            the seed for the initial noise
 * @param  {Number} steps           the number of steps to take in the diffusion process
 * @param  {String} endpoint        width of the arc's ellipse by default

 * @chainable
 *
 * @example
 * TODO: add descriptions
**/
p5.prototype.generate = async function(pInst, endpoint, g, target, prompt, negative_prompt='', prompt_weights=[], negative_prompt_weights=[], strength=0.7, cfg=7.5, sampler='DDIM', seed=undefined, steps=16, segment=true, export_frame=undefined) {
  var offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = g.canvas.width;
  offscreenCanvas.height = g.canvas.height;
  var ctx = offscreenCanvas.getContext('2d');
  ctx.drawImage(g.canvas,0,0);
  if (typeof prompt == 'string'){
    prompt = [prompt];
  }
  if (typeof negative_prompt == 'string'){
    negative_prompt = [negative_prompt];
  }
  const imgdata = offscreenCanvas.toDataURL('image/png');
  console.log(imgdata);
  var response = await fetch(endpoint+'/img2img', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'init_img': imgdata,
      'prompt': prompt,
      'negative_prompt': negative_prompt,
      'prompt_weights': prompt_weights,
      'negative_prompt_weights': negative_prompt_weights,
      'strength': strength,
      'cfg': cfg,
      'seed': seed,
      'steps': steps,
      'segment': segment
    })
  });
  var data = await response.json();
  var img = new Image();
  img.src = data['img'];
  await img.decode();
  var new_gp = await new p5.Graphics(g.width, g.height, constants.P2D, pInst);
  new_gp.canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height, 0, 0, g.width, g.height);
  if(target!==undefined){
    try{
      await target['target'].image(new_gp, target['x'], target['y'], target['width'], target['height']);
    } catch(error){
      console.log('target is not fully specified.');
    }
    if(export_frame!==undefined){
      target['target'].saveCanvas(target['target'].canvas, str(export_frame), '.png');
    }
  }
  return g;
};
export default p5;