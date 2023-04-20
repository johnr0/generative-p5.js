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
 * @param  {p5.Graphics} g          the graphics object from which we will draw the source image

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
 * 
 * TODO: add descriptions
 * 
**/
p5.prototype.generate = async function(endpoint, g, target, prompt, negative_prompt='', prompt_weights=[], negative_prompt_weights=[], strength=0.7, cfg=7.5, sampler='DDIM', seed=undefined, steps=16) {
    // console.log(g)
    // console.log(g.canvas, g._renderer)
    var ctx
    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = g.canvas.width;
    offscreenCanvas.height = g.canvas.height;
    // var offscreenCtx = offscreenCanvas.getContext("2d");
    // offscreenCtx.fillStyle='white'
    // offscreenCtx.fillRect(0,0,g.canvas.width,g.canvas.height);
    ctx = offscreenCanvas.getContext("2d");
    ctx.drawImage(g.canvas,0,0);
    
    if (typeof prompt == 'string'){
        prompt = [prompt]
    }
    if (typeof negative_prompt == 'string'){
        negative_prompt = [negative_prompt]
    }
    const imgdata = offscreenCanvas.toDataURL("image/png");
    console.log(imgdata)

    var response = await fetch(endpoint+'/img2img', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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
        'steps': steps})

    })
    
    var data = await response.json()

    var img = new Image();
    // img.onload = function(){
    //     console.log(img.width, img.height)
        
    // }
    img.src = data['img']
    await img.decode();
    g.canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,0, 0, g.width, g.height);
    if(target!=undefined){
        console.log(target['target'])
        target['target'].image(g, target['x'], target['y'], g.width, g.height)
    }

    // .then((response) => {
    //     console.log(response)
    //     return response.json()
    // }).then((data) => {
    //     // console.log(data['img'])
    //     console.log('img received')
    //     var img = new Image();
    //     img.onload = function(){
    //         console.log(img.width, img.height)
    //         g.canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,0, 0, g.width, g.height);
    //         if(target!=undefined){
    //             target['target'].image(g, target['x'], target['y'], g.width, g.height)
    //         }
    //         // p5.prototype.image(g, 0, 0);
    //         // g.image(img, 0, 0)
    //         // p5.Renderer2D.prototype.image(g, 0,0)
    //     }
    //     img.src = data['img']
        
    // })

    // TODO send the image data... and retrieve the generated image data
    
    return g
  };

  export default p5;