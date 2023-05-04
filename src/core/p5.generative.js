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
p5.prototype.generate = async function(pInst, endpoint, g, gen_parameters, target, export_frame=undefined) {
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

  var is_first_frame = false
  if(gen_parameters['is_first_frame']!==undefined){
    is_first_frame = gen_parameters['is_first_frame'];
  }
  var is_animation = false
  if(gen_parameters['is_animation']!==undefined){
    is_animation = gen_parameters['is_animation'];
  }
  if(is_first_frame){
    pInst.first_frame = imgdata;
  }
  var first_frame = undefined
  if(is_animation && pInst.first_frame!==undefined){
    first_frame = pInst.first_frame;
  }
  console.log(first_frame)
  var prompt = ''
  if(gen_parameters['prompt']!==undefined){
    prompt = gen_parameters['prompt'];
  }
  var negative_prompt = ''
  if(gen_parameters['negative_prompt']!==undefined){
    negative_prompt = gen_parameters['negative_prompt'];
  }
  var prompt_weights = []
  if(gen_parameters['prompt_weights']!==undefined){
    prompt_weights = gen_parameters['prompt_weights'];
  }
  var negative_prompt_weights = []
  if(gen_parameters['negative_prompt_weights']!==undefined){
    negative_prompt_weights = gen_parameters['negative_prompt_weights'];
  }
  var strength = undefined
  if(gen_parameters['strength']!==undefined){
    strength = gen_parameters['strength'];
  }
  var cfg = 7.5
  if(gen_parameters['cfg']!==undefined){
    cfg = gen_parameters['cfg'];
  }
  var pipe = 'img2img'
  if(gen_parameters['pipe']!==undefined){
    pipe = gen_parameters['pipe'];
  }
  var seed = undefined
  if(gen_parameters['seed']!==undefined){
    seed = gen_parameters['seed'];
  }
  var steps = 16
  if(gen_parameters['steps']!==undefined){
    steps = gen_parameters['steps'];
  }
  var segment = false
  if(gen_parameters['segment']!==undefined){
    segment = gen_parameters['segment'];
  }
  if(!endpoint.endsWith('/')){
    endpoint = endpoint + '/';
  }
  var response = await fetch(endpoint+'img2img', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'init_img': imgdata,
      'first_frame': first_frame,
      'prompt': prompt,
      'negative_prompt': negative_prompt,
      'prompt_weights': prompt_weights,
      'negative_prompt_weights': negative_prompt_weights,
      'strength': strength,
      'cfg': cfg,
      'seed': seed,
      'steps': steps,
      'segment': segment,
      'pipe': pipe
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