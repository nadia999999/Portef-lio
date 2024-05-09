
import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, vec3, perspective, scale, vec4, normalMatrix } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationY, multScale, multRotationZ,multRotationX, pushMatrix, popMatrix, multTranslation } from "../../libs/stack.js";
import * as dat from '../../libs/dat.gui.module.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as PYRAMID from '../../libs/objects/pyramid.js';
import * as TORUS from '../../libs/objects/torus.js';
import * as BUNNY from '../../libs/objects/bunny.js';

let lights = [];
const MAX_LIGHTS = 1;

function setup(shaders)
{
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;

    /** @type WebGL2RenderingContext */
    let gl = setupWebGL(canvas);

    let mode = gl.TRIANGLES;
    //let mode = gl.LINES;

    let  mProjection = ortho(-1*aspect,aspect, -1, 1,0.01,3);
    let mView = lookAt([1, 1, 1], [0, 0.7, 0], [0, 1, 0]);

    //gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test

    CUBE.init(gl);
    SPHERE.init(gl);
    CYLINDER.init(gl);
    PYRAMID.init(gl);
    TORUS.init(gl);
    BUNNY.init(gl);

    const program = buildProgramFromSources(gl, shaders['shader.vert'], shaders['shader.frag']);

    // Camera  
    let camera = {
        eye: vec3(10,5,-1),
        at: vec3(0,0.7,0),
        up: vec3(0,1,0),
        fovy: 78,
        aspect: 12, 
        near: 0.1,
        far: 20
    }

    let options = {
        backface_culling: true,
        depth_test: true
    }

    let variablesK = {
        Ka : vec3(1.0, 0.0, 0.0),
        Kd : vec3(1.0, 0.0, 0.0),
        Ks : vec3(1.0, 1.0, 1.0),
        shininess: 2.0
    }

    let defaultLight = {
        // default values
        ambient: vec3(75, 75, 75),
        diffuse:  vec3(175, 175, 175),
        specular: vec3(255, 255, 255),
        position: vec4(-5,-5,-5,0),
        axis: vec3(1,1,1),
        aperture: 10,
        cuttoff: 10,
        active: true,
        spotlight: false,
        directional: false
    }

    let bunnyMaterial = {
        Ka: [ 0, 128, 255 ],
        Kd: [ 0, 128, 255 ],
        Ks: [ 0, 128, 255 ],
        shininess: 100.0
    }

    let floorMaterial = {
        Ka: [ 150, 150, 75 ],
        Kd: [ 125, 125, 125 ],
        Ks: [ 10, 10, 10 ],
        shininess: 100.0
    }

    let cubeMaterial = {
        Ka: [ 150, 0, 0 ],
        Kd: [ 150, 0, 0 ],
        Ks: [ 200, 200, 200 ],
        shininess: 100.0
    }

    let cylinderMaterial = {
        Ka: [ 0, 150, 100 ],
        Kd: [ 0, 150, 100 ],
        Ks: [ 200, 200, 200 ],
        shininess: 100.0
    }

    let torusMaterial = {
        Ka: [ 50, 150, 50 ],
        Kd: [ 50, 150, 50 ],
        Ks: [ 200, 200, 200 ],
        shininess: 100.0
    }

    const gui = new dat.GUI();

    const optionsGui = gui.addFolder("options");
    optionsGui.add(options, "backface_culling");
    optionsGui.add(options, "depth_test");

    const cameraGui = gui.addFolder("camera");

    cameraGui.add(camera, "fovy").min(1).max(100).step(1).listen();
    
    cameraGui.add(camera, "near").min(0.1).max(20).onChange( function(v) {
        camera.near = Math.min(camera.far-0.5, v);
    });

    cameraGui.add(camera, "far").min(0.1).max(20).listen().onChange( function(v) {
        camera.far = Math.max(camera.near+0.5, v);
    });

    const eye = cameraGui.addFolder("eye");
    eye.add(camera.eye, 0).min(3).max(20).step(0.05).name("x").listen();
    eye.add(camera.eye, 1).min(0).max(20).step(0.05).name("y").listen();
    eye.add(camera.eye, 2).min(1).max(20).step(0.05).name("z").listen();

    const at = cameraGui.addFolder("at");
    at.add(camera.at, 0).min(-10).max(10).step(0.05).name("x").listen();
    at.add(camera.at, 1).min(-10).max(10).step(0.05).name("y").listen();
    at.add(camera.at, 2).min(-10).max(10).step(0.05).name("z").listen();

    const up = cameraGui.addFolder("up");
    up.add(camera.up, 0).min(0).max(20).step(0.05).name("x").listen();
    up.add(camera.up, 1).min(0).max(20).step(0.05).name("y").listen();
    up.add(camera.up, 2).min(0).max(20).step(0.05).name("z").listen();

    const lightGui = gui.addFolder("lights");

    for (let i=0; i<MAX_LIGHTS; i++) {

        let light = { ...defaultLight };

        let lightIdx = i + 1;

        const clightGui = lightGui.addFolder("Light" + lightIdx);

        clightGui.add(light, "active");
        clightGui.add(light, "directional");
        clightGui.add(light, "spotlight");

        const lightPosition = clightGui.addFolder("position");

        lightPosition.add(light.position, 0).min(-20).max(20).step(0.05).name("x");
        lightPosition.add(light.position, 1).min(-20).max(20).step(0.05).name("y");
        lightPosition.add(light.position, 2).min(-20).max(20).step(0.05).name("z");
        lightPosition.add(light.position, 3).min(-20).max(20).step(0.05).name("w");
    
        const lightProperties = clightGui.addFolder("intensities");

        lightProperties.addColor(light, "ambient"); 
        lightProperties.addColor(light, "diffuse");
        lightProperties.addColor(light, "specular");

        const lightAxis = clightGui.addFolder("axis"); // incompleto
        lightAxis.add( light.axis, 0).min(0).max(20).step(0.05).name("x");
        lightAxis.add( light.axis, 1).min(0).max(20).step(0.05).name("y");
        lightAxis.add( light.axis, 2).min(0).max(20).step(0.05).name("z");

        lights.push(light);
    }
   
    const material = gui.addFolder("material");
    material.addColor(bunnyMaterial, "Ka");
    material.addColor(bunnyMaterial, "Kd");
    material.addColor(bunnyMaterial, "Ks");
    material.add(bunnyMaterial,"shininess").step(0.05).name("shininess");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    resizeCanvasToFullWindow();

    window.addEventListener('resize', resizeCanvasToFullWindow);

    window.addEventListener('wheel', function(event) {        
        const factor = 1 - event.deltaY/1000;
        camera.fovy = Math.max(1, Math.min(100, camera.fovy * factor)); 
    });

    function uploadModelView(){
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(modelView()));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mNormals"), false, flatten(normalMatrix(modelView())));

        gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ka"), variablesK.Ka);
        gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Kd"), variablesK.Kd);
        gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ks"), variablesK.Ks);
        gl.uniform1f(gl.getUniformLocation(program, "uMaterial.shininess"), variablesK.shininess);
    }    

    function Floor()
    {
        pushMatrix();
            variablesK.Ka = scale(1/255,floorMaterial.Ka);
            variablesK.Kd = scale(1/255,floorMaterial.Kd);
            variablesK.Ks = scale(1/255,floorMaterial.Ks);
            variablesK.shininess = floorMaterial.shininess;
            multTranslation([0, -0.25, 0]);
            multScale([10, 0.5, 10]);
            uploadModelView();
            CUBE.draw(gl, program, mode);
        popMatrix();
    }

    function Cube()
    {
        pushMatrix();
            variablesK.Ka = scale(1/255,cubeMaterial.Ka);
            variablesK.Kd = scale(1/255,cubeMaterial.Kd);
            variablesK.Ks = scale(1/255,cubeMaterial.Ks);
            variablesK.shininess = cubeMaterial.shininess;
            multTranslation([-2.5, 0, 2.5]);
            multScale([2, 2, 2]);
            uploadModelView();
            CUBE.draw(gl, program, mode);
        popMatrix();
    }

    function Cylinder()
    {
        pushMatrix();
            variablesK.Ka = scale( 1/255,cylinderMaterial.Ka);
            variablesK.Kd = scale( 1/255,cylinderMaterial.Kd);
            variablesK.Ks = scale( 1/255,cylinderMaterial.Ks);
            variablesK.shininess = cylinderMaterial.shininess;
            multTranslation([-2.5, 0, -2.5]);
            multScale([2, 2, 2]);
            uploadModelView();
            CYLINDER.draw(gl, program, mode);
        popMatrix();
    }

    function Torus()
    {
        pushMatrix();
            variablesK.Ka = scale( 1/255,torusMaterial.Ka);
            variablesK.Kd = scale( 1/255,torusMaterial.Kd);
            variablesK.Ks = scale( 1/255,torusMaterial.Ks);
            variablesK.shininess = torusMaterial.shininess;
            multTranslation([2.5, -0.7, 2.5]);
            multScale([2, 2, 2]);
            uploadModelView();
            TORUS.draw(gl, program, mode);
        popMatrix();
    }

    function Bunny()
    {
        pushMatrix();
            variablesK.Ka = scale( 1/255, bunnyMaterial.Ka);
            variablesK.Kd = scale( 1/255, bunnyMaterial.Kd);
            variablesK.Ks = scale( 1/255, bunnyMaterial.Ks);
            variablesK.shininess = bunnyMaterial.shininess;
            multTranslation([2.5, 0, -2.5]);
            multScale([15, 15, 15]);
            multRotationY(90);
            uploadModelView();
            BUNNY.draw(gl, program, mode);
        popMatrix();
    }

    function Light(i){
        pushMatrix();
            gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i + "].active"), lights[i].active)
            gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i + "].directional"), lights[i].directional);
            gl.uniform1i(gl.getUniformLocation(program, "uLight[" + i + "].spotlight"), lights[i].spotlight);
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i + "].ambient"), flatten(scale(1 / 255, lights[i].ambient)));
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i + "].diffuse"), flatten(scale(1 / 255, lights[i].diffuse)));
            gl.uniform3fv(gl.getUniformLocation(program, "uLight[" + i + "].specular"), flatten(scale(1 / 255, lights[i].specular)));
            gl.uniform4fv(gl.getUniformLocation(program, "uLight[" + i + "].position"), flatten(lights[i].position));

            gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lights[i].position));

            console.log(lights[i].position);

            gl.uniform1i(gl.getUniformLocation(program, "uNLights"), lights.length);

            multTranslation([lights[i].position]);
            multScale([0.125, 0.125, 0.125]);
            uploadModelView();
            SPHERE.draw(gl, program, mode);
        popMatrix();
    }

    window.requestAnimationFrame(render);

    function resizeCanvasToFullWindow()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        camera.aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
    }

    function render()
    {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);

        mView = lookAt(camera.eye, camera.at, camera.up);
        loadMatrix(mView);

        mProjection = perspective(camera.fovy, camera.aspect, camera.near, camera.far);

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mView"), false, flatten(mView));

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormals"), false, flatten(normalMatrix(mView)));

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));

        options.depth_test ? gl.enable(gl.DEPTH_TEST) :  gl.disable(gl.DEPTH_TEST);
        options.backface_culling ? gl.enable(gl.CULL_FACE) :  gl.disable(gl.CULL_FACE);

        Floor();
        multTranslation([0, 1, 0]);
        Cube();
        Cylinder();
        Torus();
        Bunny();
        for (let i = 0; i <MAX_LIGHTS; i++) {
            pushMatrix();
                Light(i);
            popMatrix();
        }
    }
}
const urls = ['shader.vert','shader.frag'];
loadShadersFromURLS(urls).then(shaders => setup(shaders));
