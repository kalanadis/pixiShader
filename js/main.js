"use strict";
//<a href="https://www.freepik.com/free-photos-vectors/background">Background photo created by bedneyimages - www.freepik.com</a>

import * as PIXI from 'pixi.js';

document.addEventListener("DOMContentLoaded", init);

//PIXI
var renderer;
var stage;
var PIXI_Loader;

//LOOP
var tLastFrame = 0;
var tDelta = 0;
var request_Anim_ID;
var isPaused = false;
var isLoaded = false;

//LOGIC
var smoothStep = 0;
var gameTicks = 0;
var flip = true;

//SHADER 
var simpleShader;
var UniformData = {
    uniform_float: 0.0
};

function init() {

    renderer = new PIXI.Renderer({ width: 576, height: 1024, transparent: true, autoDensity: true });
    renderer.autoResize = true;

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;

    stage = new PIXI.Container();

    renderer.render(stage);

    document.body.appendChild(renderer.view);

    window.onresize = resize;

    document.addEventListener("visibilitychange", onVisibilityChanged, false);
    document.addEventListener("mozvisibilitychange", onVisibilityChanged, false);
    document.addEventListener("webkitvisibilitychange", onVisibilityChanged, false);
    document.addEventListener("msvisibilitychange", onVisibilityChanged, false);

    resize();

    //Load Assets
    PIXI_Loader = new PIXI.Loader;
    PIXI_Loader
        .add([
            "images/intro.png",
            "images/bg.png",
            "images/waterOff.jpg"
        ])
        .on("progress", loadHandler)
        .on('complete', loadComplete)
        .load(setup);

    var graphics = new PIXI.Graphics();

    stage.addChild(graphics);

    var LoadingIconTex;
    var LoadingIconSprite;

    function loadHandler(loader, res) {

        resize();

        if (res.url === 'images/intro.png') {

            LoadingIconTex = PIXI_Loader.resources['images/intro.png'].texture;
            LoadingIconSprite = new PIXI.Sprite(LoadingIconTex);
            LoadingIconSprite.y = 150;
            LoadingIconSprite.x = 188;

            stage.addChild(LoadingIconSprite);

        }

        graphics.clear();

        graphics.beginFill(0x3333ff, 1);

        graphics.drawRect(163, 400, loader.progress * 2.5, 10);

        graphics.endFill();

        graphics.beginFill(0x3333ff, 0);

        graphics.lineStyle(2, 0xffffff, 1);

        graphics.drawRect(163, 400, 250, 10);

        graphics.endFill();

    }

    function loadComplete(loader, res) {

        stage.removeChild(graphics);
        stage.removeChild(LoadingIconSprite);
        //Keep for GC to clean !!!

    }

    function setup() {
        //bg     
        var bg_tex = PIXI_Loader.resources["images/bg.png"].texture;
        var bg_sprite = new PIXI.Sprite(bg_tex);

        stage.addChild(bg_sprite);


        //SHADER
        UniformData.offSetSampler = PIXI_Loader.resources["images/waterOff.jpg"].texture;
        var frag_shaderCode = document.getElementById("shader").innerHTML;

        //Pass Uniform data to Shader
        simpleShader = new PIXI.Filter(undefined, frag_shaderCode, UniformData);//default vertex shader will be called
        
        stage.filters = [simpleShader];
        //=========
        resize();
        isLoaded = true;
    }

    tLastFrame = performance.now();
    game_update(tLastFrame);

}

//UTIL================

function onVisibilityChanged() {
    if (document.hidden || document.mozHidden || document.webkitHidden || document.msHidden) {
        onAppPause(false);
    }
    else {
        onAppPause(true);
    }
}

function resize() {

    var w = 0;
    var h = 0;
    var ratio = 9 / 16;

    var y = 0;
    var x = 0;

    if (window.innerWidth > window.innerHeight * ratio) {
        w = window.innerHeight * ratio;
        h = window.innerHeight;

        x = (window.innerWidth - w) * 0.5;


    } else {
        w = window.innerWidth;
        h = window.innerWidth / ratio;

        y = (window.innerHeight - h) * 0.5;

    }

    renderer.view.style.width = w + 'px';
    renderer.view.style.height = h + 'px';

    renderer.view.style.margin = y + "px " + x + "px";

}

function onAppPause(status) {

    if (status) {

        if (isPaused) {
            tLastFrame = performance.now();
            game_update(tLastFrame);
            isPaused = false;
        }

    }
    else if (request_Anim_ID) {

        if (!isPaused) {
            cancelAnimationFrame(request_Anim_ID);
            isPaused = true;
        }

    }

}

//===========================
function game_update(tFrame) {

    tDelta = tFrame - tLastFrame;
    request_Anim_ID = requestAnimationFrame(game_update);

    if (isLoaded) {

        gameTicks += (tDelta * 0.06);
        gameTicks = gameTicks > 1000 ? 1000 : gameTicks;

        smoothStep = gameTicks * 0.001;
        smoothStep = 3 * smoothStep * smoothStep - 2 * smoothStep * smoothStep * smoothStep;

        if (flip) smoothStep = 1 - smoothStep;

        if (gameTicks === 1000) {
            gameTicks = 0;
            flip = !flip;
        }
        //Update Shader Data
        UniformData.uniform_float = smoothStep;
    }

    tLastFrame = tFrame;
    renderer.render(stage);
}
